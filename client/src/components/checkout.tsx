import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { PAYMENT_METHODS } from '@/lib/constants';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote, 
  Shield, 
  CheckCircle2, 
  QrCode,
  Clock,
  Receipt,
  Star
} from 'lucide-react';

interface CheckoutProps {
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

export default function Checkout({ cartSummary, sessionId }: CheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();
  const { clearCart } = useCart({ sessionId });

  const paymentMethodIcons = {
    upi: <Smartphone className="h-5 w-5" />,
    card: <CreditCard className="h-5 w-5" />,
    wallet: <Wallet className="h-5 w-5" />,
    cash: <Banknote className="h-5 w-5" />
  };

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, transactionId: `TXN_${Date.now()}` };
    },
    onSuccess: async (data) => {
      setPaymentSuccess(true);
      await clearCart();
      toast({
        title: "Payment Successful",
        description: `Transaction ID: ${data.transactionId}`,
      });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Please try again or choose a different payment method",
        variant: "destructive",
      });
    }
  });

  const handlePayment = async () => {
    if (cartSummary.items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (selectedPaymentMethod === 'upi' && !upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const paymentData = {
      sessionId,
      paymentMethod: selectedPaymentMethod,
      amount: cartSummary.total,
      items: cartSummary.items,
      upiId: selectedPaymentMethod === 'upi' ? upiId : undefined
    };

    await processPaymentMutation.mutateAsync(paymentData);
    setIsProcessing(false);
  };

  if (paymentSuccess) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Thank you for your purchase</p>
            <p className="text-sm text-gray-500 font-devanagari">खरीदारी के लिए धन्यवाद</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Amount Paid:</span>
              <span className="font-bold text-green-800">₹{cartSummary.total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Payment Method:</span>
              <span className="text-sm text-green-800 capitalize">{selectedPaymentMethod}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-secondary hover:bg-green-700 touch-feedback"
              onClick={() => window.location.reload()}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Start New Shopping
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full touch-feedback"
              onClick={() => setPaymentSuccess(false)}
            >
              View Receipt
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-400" />
              <span>Rate your experience</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Self-Checkout</h3>
        <Badge variant="outline" className="text-secondary">
          <Shield className="w-3 h-3 mr-1" />
          Secure
        </Badge>
      </div>

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Items ({cartSummary.itemCount}):</span>
            <span>₹{cartSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%):</span>
            <span>₹{cartSummary.tax.toFixed(2)}</span>
          </div>
          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₹{cartSummary.discount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">₹{cartSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Payment Method / भुगतान का तरीका
        </Label>
        
        <RadioGroup 
          value={selectedPaymentMethod} 
          onValueChange={setSelectedPaymentMethod}
          className="space-y-3"
        >
          {PAYMENT_METHODS.map((method) => (
            <div key={method.id} className="flex items-center space-x-3">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label 
                htmlFor={method.id}
                className={`
                  flex-1 flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all touch-feedback
                  ${selectedPaymentMethod === method.id 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`p-2 rounded-lg mr-3 ${
                  selectedPaymentMethod === method.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {paymentMethodIcons[method.id as keyof typeof paymentMethodIcons]}
                </div>
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-xs text-gray-500">
                    {method.id === 'upi' && 'PhonePe, GPay, Paytm'}
                    {method.id === 'card' && 'Credit/Debit Cards'}
                    {method.id === 'wallet' && 'Digital Wallets'}
                    {method.id === 'cash' && 'Pay at Counter'}
                  </p>
                </div>
                {selectedPaymentMethod === method.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* UPI ID Input */}
      {selectedPaymentMethod === 'upi' && (
        <div className="mb-6">
          <Label htmlFor="upi-id" className="text-sm font-medium text-gray-700 mb-2 block">
            UPI ID
          </Label>
          <Input
            id="upi-id"
            placeholder="yourname@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="touch-feedback"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your UPI ID (e.g., 9876543210@paytm)
          </p>
        </div>
      )}

      {/* Payment Methods Info */}
      {selectedPaymentMethod === 'card' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Card Payment</span>
          </div>
          <p className="text-xs text-blue-700">
            You will be redirected to secure payment gateway to enter card details
          </p>
        </div>
      )}

      {selectedPaymentMethod === 'wallet' && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Digital Wallet</span>
          </div>
          <p className="text-xs text-purple-700">
            Available: Paytm, Amazon Pay, FreeCharge, MobiKwik
          </p>
        </div>
      )}

      {selectedPaymentMethod === 'cash' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Banknote className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Cash Payment</span>
          </div>
          <p className="text-xs text-green-700">
            Proceed to billing counter with your cart items for cash payment
          </p>
        </div>
      )}

      {/* Express Checkout Options */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <QrCode className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-800">Express Checkout</span>
          </div>
          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
            Save Time
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs touch-feedback"
            disabled
          >
            <QrCode className="h-3 w-3 mr-1" />
            Scan to Pay
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs touch-feedback"
            disabled
          >
            <Clock className="h-3 w-3 mr-1" />
            Quick Pay
          </Button>
        </div>
      </div>
      
      {/* Checkout Button */}
      <Button 
        onClick={handlePayment}
        disabled={cartSummary.items.length === 0 || isProcessing}
        className="w-full bg-secondary hover:bg-green-700 text-lg font-bold py-4 touch-feedback"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Pay ₹{cartSummary.total.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Note */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <Shield className="h-4 w-4 text-green-500 mr-2" />
          <span>Secure payment processing with end-to-end encryption</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 font-devanagari">
          एंड-टू-एंड एन्क्रिप्शन के साथ सुरक्षित भुगतान प्रसंस्करण
        </p>
      </div>

      {/* Additional Features */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs touch-feedback"
          onClick={() => toast({ title: "Feature Coming Soon", description: "Digital receipt will be available soon" })}
        >
          <Receipt className="h-3 w-3 mr-1" />
          Digital Receipt
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs touch-feedback"
          onClick={() => toast({ title: "Loyalty Points", description: "You'll earn 10 points for this purchase" })}
        >
          <Star className="h-3 w-3 mr-1" />
          Loyalty Points
        </Button>
      </div>
    </Card>
  );
}
