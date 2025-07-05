import { useState, useEffect } from 'react';
import { DEFAULT_SESSION_ID } from '@/lib/constants';
import { useWebSocket } from '@/hooks/use-websocket';
import { useCart } from '@/hooks/use-cart';
import { useLiFi } from '@/hooks/use-lifi';
import { useToast } from '@/hooks/use-toast';

import StoreMap from '@/components/store-map';
import BarcodeScanner from '@/components/barcode-scanner';
import WeighingScale from '@/components/weighing-scale';
import ShoppingCart from '@/components/shopping-cart';
import Promotions from '@/components/promotions';
import Checkout from '@/components/checkout';
import ProductSearch from '@/components/product-search';
import EnhancedProductSearch from '@/components/enhanced-product-search';
import InteractiveFeatures from '@/components/interactive-features';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { ShoppingCart as CartIcon, Wifi, MapPin, Scan, Weight, Search, Tag, CreditCard, Mic, AlertTriangle, Zap, Users, TrendingUp, Gift, Star, Bell, Volume2, Trophy } from 'lucide-react';

export default function SmartCart() {
  const [sessionId] = useState(() => DEFAULT_SESSION_ID());
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'info' | 'success' | 'warning'}>>([]);
  const [shoppingProgress, setShoppingProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeInStore, setTimeInStore] = useState(0);
  const [sectionsVisited, setSectionsVisited] = useState<string[]>([]);
  const { toast } = useToast();

  // Timer for shopping session
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInStore(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Initialize hooks
  const { 
    currentPosition, 
    currentSection, 
    isTracking, 
    signal, 
    navigateToSection,
    getNavigationInstructions,
    getNearbyPromotions 
  } = useLiFi({ 
    sessionId,
    onPositionChange: (position) => {
      updatePosition(position.section, position.x, position.y);
      // Add interactive notification for section change
      addNotification(`Moved to ${position.section} section`, 'info');
      playSound('section_change');
    }
  });

  const { cartSummary, addScannedProduct, addWeighedProduct } = useCart({ 
    sessionId,
    onCartUpdate: (cart) => {
      notifyCartUpdate(cart);
      // Update shopping progress
      const progress = Math.min((cart.total / 1000) * 100, 100);
      setShoppingProgress(progress);
      if (cart.itemCount > 0) {
        playSound('item_added');
      }
    }
  });

  const { 
    isConnected, 
    connectionStatus, 
    updatePosition, 
    notifyCartUpdate 
  } = useWebSocket({
    sessionId,
    onMessage: (message) => {
      console.log('WebSocket message:', message);
      // Handle real-time updates with interactive feedback
      if (message.type === 'promotion_alert') {
        addNotification(`New promotion: ${message.promotion}`, 'success');
        playSound('promotion');
      }
    }
  });

  // Interactive features
  const addNotification = (message: string, type: 'info' | 'success' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const playSound = (type: string) => {
    if (!soundEnabled) return;
    // Simulate sound feedback with visual indication
    toast({
      title: "🔊 Sound",
      description: `${type} sound played`,
      duration: 1000,
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? "Sound Disabled" : "Sound Enabled",
      description: soundEnabled ? "Audio feedback turned off" : "Audio feedback turned on",
    });
  };

  // Track sections visited
  useEffect(() => {
    if (currentSection && !sectionsVisited.includes(currentSection)) {
      setSectionsVisited(prev => [...prev, currentSection]);
    }
  }, [currentSection, sectionsVisited]);

  const openDialog = (dialogId: string) => setActiveDialog(dialogId);
  const closeDialog = () => setActiveDialog(null);

  const navigationInstructions = getNavigationInstructions('dairy');
  const nearbyPromotions = getNearbyPromotions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {/* Enhanced Header with Interactive Elements */}
      <header className="bg-white shadow-lg border-b-4 border-primary sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-3 rounded-xl relative">
              <CartIcon className="text-white h-6 w-6" />
              {cartSummary.itemCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                  {cartSummary.itemCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Cart</h1>
              <p className="text-sm text-gray-600">Li-Fi Enabled Shopping</p>
              {shoppingProgress > 0 && (
                <div className="mt-1">
                  <Progress value={shoppingProgress} className="h-2 w-32" />
                  <p className="text-xs text-gray-500">Shopping Progress: {Math.round(shoppingProgress)}%</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleSound}
              className="touch-feedback"
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            </Button>
            
            <Badge variant={isConnected ? "default" : "destructive"} className="bg-secondary">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <Wifi className="w-3 h-3 mr-1" />
              Li-Fi {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
            
            <Badge variant="outline" className="bg-accent text-gray-900 font-bold">
              ₹{cartSummary.total.toLocaleString()}
            </Badge>
            
            {notifications.length > 0 && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Bell className="w-3 h-3 mr-1" />
                {notifications.length}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Live Notifications Bar */}
        {notifications.length > 0 && (
          <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    flex items-center space-x-2 px-3 py-1 rounded-full text-sm whitespace-nowrap animate-slide-up
                    ${notification.type === 'success' ? 'bg-green-100 text-green-800' : ''}
                    ${notification.type === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                    ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}
                >
                  <Zap className="w-3 h-3" />
                  <span>{notification.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Panel - Store Map & Navigation */}
        <div className="space-y-6">
          <StoreMap 
            currentSection={currentSection}
            onSectionClick={navigateToSection}
            navigationInstructions={navigationInstructions}
          />
          
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => openDialog('scanner')} 
                className="bg-secondary hover:bg-green-700 p-4 h-auto flex-col space-y-2 touch-feedback"
              >
                <Scan className="h-6 w-6" />
                <span className="text-sm font-medium">Scan Item</span>
              </Button>
              
              <Button 
                onClick={() => openDialog('scale')} 
                className="bg-accent hover:bg-yellow-500 text-gray-900 p-4 h-auto flex-col space-y-2 touch-feedback"
              >
                <Weight className="h-6 w-6" />
                <span className="text-sm font-medium">Weigh Item</span>
              </Button>
              
              <Button 
                onClick={() => openDialog('promotions')} 
                className="bg-[var(--turquoise)] hover:bg-cyan-600 text-white p-4 h-auto flex-col space-y-2 touch-feedback"
              >
                <Tag className="h-6 w-6" />
                <span className="text-sm font-medium">View Offers</span>
              </Button>
              
              <Button 
                onClick={() => openDialog('search')} 
                className="bg-[var(--magenta)] hover:bg-pink-600 text-white p-4 h-auto flex-col space-y-2 touch-feedback"
              >
                <Search className="h-6 w-6" />
                <span className="text-sm font-medium">Search</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Center Panel - Product Interface */}
        <div className="space-y-6">
          <BarcodeScanner onProductScanned={addScannedProduct} />
          <WeighingScale onProductWeighed={addWeighedProduct} />
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="space-y-6">
          <ShoppingCart 
            cartSummary={cartSummary}
            sessionId={sessionId}
          />
          <Promotions nearbyPromotions={nearbyPromotions} />
          <Checkout cartSummary={cartSummary} sessionId={sessionId} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4">
            <TabsContent value="map" className="mt-0">
              <StoreMap 
                currentSection={currentSection}
                onSectionClick={navigateToSection}
                navigationInstructions={navigationInstructions}
              />
            </TabsContent>
            
            <TabsContent value="scan" className="mt-0">
              <BarcodeScanner onProductScanned={addScannedProduct} />
            </TabsContent>

            <TabsContent value="search" className="mt-0">
              <EnhancedProductSearch onProductSelected={addScannedProduct} />
            </TabsContent>
            
            <TabsContent value="cart" className="mt-0">
              <ShoppingCart 
                cartSummary={cartSummary}
                sessionId={sessionId}
              />
            </TabsContent>
            
            <TabsContent value="game" className="mt-0">
              <InteractiveFeatures 
                cartValue={cartSummary.total}
                itemCount={cartSummary.itemCount}
                timeInStore={timeInStore}
                sectionsVisited={sectionsVisited}
                onAchievementUnlock={(achievement) => {
                  addNotification(`Achievement unlocked: ${achievement}!`, 'success');
                  playSound('achievement');
                }}
              />
            </TabsContent>

            <TabsContent value="offers" className="mt-0">
              <Promotions nearbyPromotions={nearbyPromotions} />
            </TabsContent>
            
            <TabsContent value="checkout" className="mt-0">
              <Checkout cartSummary={cartSummary} sessionId={sessionId} />
            </TabsContent>
          </div>

          {/* Bottom Navigation */}
          <TabsList className="fixed bottom-0 left-0 right-0 h-auto bg-white border-t shadow-lg grid grid-cols-7 rounded-none">
            <TabsTrigger value="map" className="flex-col py-2 space-y-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Map</span>
            </TabsTrigger>
            
            <TabsTrigger value="scan" className="flex-col py-2 space-y-1">
              <Scan className="h-4 w-4" />
              <span className="text-xs">Scan</span>
            </TabsTrigger>

            <TabsTrigger value="search" className="flex-col py-2 space-y-1">
              <Search className="h-4 w-4" />
              <span className="text-xs">Browse</span>
            </TabsTrigger>

            <TabsTrigger value="game" className="flex-col py-2 space-y-1">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Game</span>
            </TabsTrigger>
            
            <TabsTrigger value="cart" className="flex-col py-2 space-y-1 relative">
              <CartIcon className="h-4 w-4" />
              <span className="text-xs">Cart</span>
              {cartSummary.itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                  {cartSummary.itemCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="offers" className="flex-col py-2 space-y-1">
              <Tag className="h-4 w-4" />
              <span className="text-xs">Offers</span>
            </TabsTrigger>
            
            <TabsTrigger value="checkout" className="flex-col py-2 space-y-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Pay</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-20 right-6 lg:bottom-6 space-y-3 z-40">
        <Button 
          size="icon"
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 shadow-lg pulse-on-hover"
          onClick={() => {
            addNotification('Emergency assistance requested', 'warning');
            playSound('emergency');
            toast({
              title: "Emergency Alert",
              description: "Store staff has been notified",
              variant: "destructive",
            });
          }}
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
        
        <Button 
          size="icon"
          className="bg-[var(--turquoise)] hover:bg-cyan-600 text-white rounded-full w-14 h-14 shadow-lg pulse-on-hover"
          onClick={() => openDialog('voice')}
        >
          <Mic className="h-6 w-6" />
        </Button>

        <Button 
          size="icon"
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-14 h-14 shadow-lg pulse-on-hover"
          onClick={() => openDialog('analytics')}
        >
          <TrendingUp className="h-6 w-6" />
        </Button>

        <Button 
          size="icon"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg pulse-on-hover"
          onClick={() => {
            addNotification('Daily deals unlocked!', 'success');
            openDialog('promotions');
          }}
        >
          <Gift className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <Dialog open={activeDialog === 'scanner'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Barcode Scanner</DialogTitle>
          </DialogHeader>
          <BarcodeScanner onProductScanned={addScannedProduct} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'scale'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Digital Weighing Scale</DialogTitle>
          </DialogHeader>
          <WeighingScale onProductWeighed={addWeighedProduct} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'search'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Search</DialogTitle>
          </DialogHeader>
          <ProductSearch onProductSelected={addScannedProduct} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'promotions'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Current Promotions</DialogTitle>
          </DialogHeader>
          <Promotions nearbyPromotions={nearbyPromotions} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'voice'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Search</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <Mic className="h-10 w-10 text-white" />
            </div>
            <p className="text-center text-gray-600">
              Say the product name or ask for assistance
              <br />
              <span className="text-sm font-devanagari">उत्पाद का नाम बोलें या सहायता मांगें</span>
            </p>
            <Button onClick={closeDialog}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === 'analytics'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Shopping Analytics</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Store Activity
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Carts:</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peak Section:</span>
                  <span className="font-bold">Fresh Produce</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Cart Value:</span>
                  <span className="font-bold">₹845</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Your Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Scanned:</span>
                  <span className="font-bold">{cartSummary.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time in Store:</span>
                  <span className="font-bold">12 mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings Today:</span>
                  <span className="font-bold text-green-600">₹{cartSummary.discount.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
