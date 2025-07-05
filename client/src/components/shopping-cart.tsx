import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ShoppingCart as CartIcon } from 'lucide-react';
import type { Product } from '@shared/schema';

interface ShoppingCartProps {
  cartSummary: {
    items: any[];
    itemCount: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  sessionId: string;
}

export default function ShoppingCart({ cartSummary, sessionId }: ShoppingCartProps) {
  const { updateQuantity, removeItem, isUpdatingItem, isRemovingItem } = useCart({ sessionId });
  
  // Fetch products to get product details for cart items
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const getProductDetails = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  const handleQuantityChange = async (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: number) => {
    await removeItem(itemId);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
        <Badge className="bg-primary text-white">
          {cartSummary.itemCount} items
        </Badge>
      </div>
      
      {/* Cart Items */}
      <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
        {cartSummary.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CartIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm font-devanagari">आपकी कार्ट खाली है</p>
            <p className="text-xs mt-2">Start scanning or searching for products to add them to your cart</p>
          </div>
        ) : (
          cartSummary.items.map((item) => {
            const product = getProductDetails(item.productId);
            const quantity = parseFloat(item.quantity);
            const isWeighted = !!item.weight;
            
            return (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cart-item-enter">
                <img 
                  src={product?.imageUrl || '/placeholder-product.jpg'} 
                  alt={product?.name || 'Product'}
                  className="w-16 h-16 object-cover rounded" 
                />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {product?.name || 'Unknown Product'}
                  </p>
                  {product?.nameHindi && (
                    <p className="text-xs text-gray-600 font-devanagari truncate">
                      {product.nameHindi}
                    </p>
                  )}
                  {product?.brand && (
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  )}
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    {isWeighted ? (
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {parseFloat(item.weight).toFixed(3)} kg
                        </Badge>
                        <span className="text-xs text-gray-500">
                          @ ₹{parseFloat(item.unitPrice).toFixed(0)}/kg
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 touch-feedback"
                          onClick={() => handleQuantityChange(item.id, quantity, -1)}
                          disabled={isUpdatingItem}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {Math.round(quantity)}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 touch-feedback"
                          onClick={() => handleQuantityChange(item.id, quantity, 1)}
                          disabled={isUpdatingItem}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-primary text-lg">
                    ₹{parseFloat(item.totalPrice).toFixed(2)}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1 touch-feedback"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isRemovingItem}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Cart Summary */}
      {cartSummary.items.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{cartSummary.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (GST 5%):</span>
              <span className="font-medium">₹{cartSummary.tax.toFixed(2)}</span>
            </div>
            
            {cartSummary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-₹{cartSummary.discount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Total:</span>
              <span>₹{cartSummary.total.toFixed(2)}</span>
            </div>
            
            {/* Savings Summary */}
            {cartSummary.discount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 font-medium">
                    You're saving ₹{cartSummary.discount.toFixed(2)}!
                  </span>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {((cartSummary.discount / cartSummary.subtotal) * 100).toFixed(0)}% OFF
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Minimum order message */}
            {cartSummary.subtotal < 500 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  Add ₹{(500 - cartSummary.subtotal).toFixed(2)} more to get 15% discount!
                </p>
                <p className="text-xs text-yellow-600 font-devanagari">
                  15% छूट पाने के लिए ₹{(500 - cartSummary.subtotal).toFixed(2)} और जोड़ें!
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
