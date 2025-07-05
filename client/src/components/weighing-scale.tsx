import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Weight, Leaf, CheckCircle } from 'lucide-react';
import type { Product } from '@shared/schema';

interface WeighingScaleProps {
  onProductWeighed: (product: Product, weight: number) => void;
}

export default function WeighingScale({ onProductWeighed }: WeighingScaleProps) {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isWeighing, setIsWeighing] = useState(false);
  const { toast } = useToast();

  // Fetch weighable products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    select: (data) => data.filter(product => product.isWeighable),
  });

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  // Simulate weight changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isWeighing) {
        // Simulate fluctuating weight
        const baseWeight = 2.45;
        const variation = (Math.random() - 0.5) * 0.1;
        setCurrentWeight(Math.max(0, baseWeight + variation));
      } else {
        // Gradual weight changes when items are placed/removed
        setCurrentWeight(prev => {
          const target = Math.random() > 0.7 ? Math.random() * 5 : prev;
          return prev + (target - prev) * 0.1;
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isWeighing]);

  const startWeighing = () => {
    setIsWeighing(true);
    setTimeout(() => {
      setIsWeighing(false);
      toast({
        title: "Weight Recorded",
        description: `Final weight: ${currentWeight.toFixed(3)} kg`,
      });
    }, 3000);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || currentWeight <= 0) {
      toast({
        title: "Error",
        description: "Please select a product and ensure weight is recorded",
        variant: "destructive",
      });
      return;
    }

    onProductWeighed(selectedProduct, currentWeight);
    toast({
      title: "Added to Cart",
      description: `${selectedProduct.name} (${currentWeight.toFixed(3)} kg) added to cart`,
    });
    
    // Reset after adding
    setCurrentWeight(0);
    setSelectedProductId('');
  };

  const totalPrice = selectedProduct ? parseFloat(selectedProduct.price) * currentWeight : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Digital Scale</h3>
        <Badge variant={isWeighing ? "default" : "outline"}>
          <Weight className="w-3 h-3 mr-1" />
          {isWeighing ? 'Weighing...' : 'Ready'}
        </Badge>
      </div>
      
      {/* Scale Display */}
      <div className="bg-gray-900 text-green-400 p-6 rounded-xl text-center mb-6 font-mono">
        <div className={`text-4xl font-bold mb-2 ${isWeighing ? 'animate-pulse' : ''}`}>
          {currentWeight.toFixed(3)}
        </div>
        <div className="text-lg">kg</div>
        <div className="text-sm text-gray-400 mt-2">
          Place items on scale / स्केल पर वस्तुएं रखें
        </div>
        {isWeighing && (
          <div className="text-xs text-yellow-400 mt-1 animate-pulse">
            Stabilizing weight...
          </div>
        )}
      </div>
      
      {/* Product Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="product-select" className="text-sm font-medium text-gray-700">
            Select Product / उत्पाद चुनें
          </Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select item to weigh..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span>{product.name} - ₹{parseFloat(product.price).toLocaleString()}/{product.unit}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Weight Calculation */}
        {selectedProduct && currentWeight > 0 && (
          <div className="bg-accent bg-opacity-20 p-4 rounded-lg border border-accent border-opacity-30">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Product:</span>
                <span className="font-medium">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Weight:</span>
                <span className="font-bold">{currentWeight.toFixed(3)} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Rate:</span>
                <span className="font-bold">₹{parseFloat(selectedProduct.price).toLocaleString()}/{selectedProduct.unit}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {selectedProduct.nameHindi && (
                <div className="text-sm text-gray-600 font-devanagari text-center">
                  {selectedProduct.nameHindi}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={startWeighing}
          disabled={isWeighing || currentWeight <= 0}
          className="w-full bg-accent hover:bg-yellow-500 text-gray-900 touch-feedback"
          size="lg"
        >
          {isWeighing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
              Stabilizing Weight...
            </>
          ) : (
            <>
              <Weight className="w-5 h-5 mr-2" />
              Record Weight
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleAddToCart}
          disabled={!selectedProduct || currentWeight <= 0 || isWeighing}
          className="w-full bg-secondary hover:bg-green-700 touch-feedback"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Add to Cart / कार्ट में जोड़ें
        </Button>
      </div>

      {/* Fresh Product Indicators */}
      {selectedProduct && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700 font-medium">Fresh Product</span>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Today's Harvest
            </Badge>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Quality guaranteed • Farm fresh • Pesticide tested
          </p>
        </div>
      )}

      {/* Weight Guidelines */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Weight Guidelines</h5>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Place items gently on the scale platform</p>
          <p>• Wait for weight to stabilize before recording</p>
          <p>• Remove all items to reset to zero</p>
          <p className="font-devanagari">• स्केल प्लेटफॉर्म पर वस्तुओं को धीरे से रखें</p>
        </div>
      </div>
    </Card>
  );
}
