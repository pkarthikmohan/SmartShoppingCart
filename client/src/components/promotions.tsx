import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Gift, Tag, Clock, Percent, ShoppingBag, Star, Zap } from 'lucide-react';
import type { Promotion } from '@shared/schema';

interface PromotionsProps {
  nearbyPromotions: string[];
}

export default function Promotions({ nearbyPromotions }: PromotionsProps) {
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

  // Fetch active promotions
  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['/api/promotions'],
  });

  const handleApplyPromotion = (promotion: Promotion) => {
    toast({
      title: "Promotion Applied",
      description: `${promotion.title} has been applied to your cart`,
    });
  };

  const getPromotionIcon = (discountType: string) => {
    switch (discountType) {
      case 'percentage':
        return <Percent className="h-5 w-5" />;
      case 'bogo':
        return <ShoppingBag className="h-5 w-5" />;
      case 'fixed':
        return <Tag className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Ending soon';
  };

  const getProgressPercentage = (validFrom: string, validUntil: string) => {
    const now = new Date();
    const start = new Date(validFrom);
    const end = new Date(validUntil);
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-bold">Loading Promotions...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="gradient-primary p-2 rounded-lg">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Promotions & Offers</h3>
          <p className="text-sm text-gray-600">Save more on your shopping</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="active" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Active
          </TabsTrigger>
          <TabsTrigger value="nearby" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            Nearby
          </TabsTrigger>
          <TabsTrigger value="personal" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            For You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {promotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active promotions</p>
              <p className="text-xs font-devanagari">कोई सक्रिय प्रमोशन नहीं</p>
            </div>
          ) : (
            promotions.map((promotion) => {
              const timeRemaining = getTimeRemaining(promotion.validUntil);
              const progress = getProgressPercentage(promotion.validFrom, promotion.validUntil);
              const isExpiringSoon = progress > 80;
              
              return (
                <div 
                  key={promotion.id} 
                  className={`
                    relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-200 touch-feedback
                    ${promotion.discountType === 'percentage' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : ''}
                    ${promotion.discountType === 'bogo' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : ''}
                    ${promotion.discountType === 'fixed' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' : ''}
                    hover:shadow-lg
                  `}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 opacity-10">
                    {getPromotionIcon(promotion.discountType)}
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPromotionIcon(promotion.discountType)}
                        <h4 className="font-bold text-gray-900">{promotion.title}</h4>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            Ending Soon
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{promotion.description}</p>
                      
                      {/* Discount Details */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="text-lg font-bold text-primary">
                          {promotion.discountType === 'percentage' && `${promotion.discountValue}% OFF`}
                          {promotion.discountType === 'fixed' && `₹${promotion.discountValue} OFF`}
                          {promotion.discountType === 'bogo' && 'BUY 2 GET 1'}
                        </div>
                        
                        {promotion.minPurchase && (
                          <div className="text-xs text-gray-600">
                            Min: ₹{parseFloat(promotion.minPurchase).toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {timeRemaining}
                          </span>
                          <span className="text-xs text-gray-600">{progress.toFixed(0)}% elapsed</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={`h-2 ${isExpiringSoon ? 'bg-red-100' : 'bg-gray-200'}`}
                        />
                      </div>
                      
                      {/* Categories */}
                      {promotion.applicableCategories && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {promotion.applicableCategories.slice(0, 3).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {promotion.applicableCategories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{promotion.applicableCategories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleApplyPromotion(promotion)}
                      size="sm"
                      className="bg-secondary hover:bg-green-700 touch-feedback"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="nearby" className="space-y-4">
          {nearbyPromotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No nearby promotions</p>
              <p className="text-xs font-devanagari">कोई आस-पास का प्रमोशन नहीं</p>
            </div>
          ) : (
            nearbyPromotions.map((promo, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 touch-feedback"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary p-2 rounded-full">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{promo}</p>
                      <p className="text-sm text-gray-600">Available in your current section</p>
                      <p className="text-xs text-gray-500 font-devanagari">आपके वर्तमान सेक्शन में उपलब्ध</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="touch-feedback">
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Personalized offers coming soon</p>
            <p className="text-xs font-devanagari">व्यक्तिगत ऑफर जल्द आ रहे हैं</p>
            <p className="text-xs text-gray-400 mt-2">Based on your shopping history and preferences</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Promotion Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Gift className="h-4 w-4 text-yellow-600" />
          <h5 className="text-sm font-bold text-yellow-800">Pro Tips</h5>
        </div>
        <div className="text-xs text-yellow-700 space-y-1">
          <p>• Combine multiple offers to maximize savings</p>
          <p>• Check back regularly for new location-based deals</p>
          <p>• Share promotions with family for family pack discounts</p>
          <p className="font-devanagari">• अधिकतम बचत के लिए कई ऑफ़र को मिलाएं</p>
        </div>
      </div>
    </Card>
  );
}
