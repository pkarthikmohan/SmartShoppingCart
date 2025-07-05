import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Scan, Camera, CheckCircle } from 'lucide-react';
import type { Product } from '@shared/schema';

interface BarcodeScannerProps {
  onProductScanned: (product: Product) => void;
}

export default function BarcodeScanner({ onProductScanned }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<Product[]>([]);
  const { toast } = useToast();

  // Fetch product by barcode
  const { data: scannedProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['/api/products/barcode', scannedBarcode],
    enabled: !!scannedBarcode,
  });

  // Get all products for recent scans simulation
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Simulate barcode scanning
  const simulateBarcodeScan = () => {
    if (products.length === 0) return;
    
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      if (randomProduct.barcode) {
        setScannedBarcode(randomProduct.barcode);
        toast({
          title: "Product Scanned",
          description: `Found: ${randomProduct.name}`,
        });
      }
      setIsScanning(false);
    }, 2000);
  };

  // Update recent scans when product is found
  useEffect(() => {
    if (scannedProduct) {
      setRecentScans(prev => {
        const filtered = prev.filter(p => p.id !== scannedProduct.id);
        return [scannedProduct, ...filtered].slice(0, 3);
      });
    }
  }, [scannedProduct]);

  // Initialize with some sample recent scans
  useEffect(() => {
    if (products.length > 0 && recentScans.length === 0) {
      setRecentScans(products.slice(0, 3));
    }
  }, [products, recentScans.length]);

  const handleAddToCart = (product: Product) => {
    onProductScanned(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Barcode Scanner</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-sm text-secondary">
            {isScanning ? 'Scanning...' : 'Ready'}
          </span>
        </div>
      </div>
      
      {/* Scanner Viewfinder */}
      <div className="relative scanner-viewfinder rounded-xl overflow-hidden h-64 mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="border-2 border-primary w-48 h-24 relative">
            {/* Scanner frame corners */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
            
            {/* Scanning Line Animation */}
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-bounce-gentle"></div>
            )}
          </div>
        </div>
        
        {/* Camera Icon */}
        <div className="absolute top-4 right-4">
          <Camera className="h-6 w-6 text-white opacity-75" />
        </div>
        
        {/* Overlay Instructions */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-sm">Position barcode within the frame</p>
          <p className="text-gray-300 text-xs font-devanagari">बारकोड को फ्रेम के अंदर रखें</p>
        </div>
      </div>

      {/* Scan Button */}
      <div className="mb-6">
        <Button 
          onClick={simulateBarcodeScan}
          disabled={isScanning || products.length === 0}
          className="w-full bg-secondary hover:bg-green-700 touch-feedback"
          size="lg"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="w-5 h-5 mr-2" />
              Start Scanner
            </>
          )}
        </Button>
      </div>
      
      {/* Scanned Product Result */}
      {isLoadingProduct && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      )}

      {scannedProduct && !isLoadingProduct && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-slide-up">
          <div className="flex items-center space-x-3">
            <img 
              src={scannedProduct.imageUrl || '/placeholder-product.jpg'} 
              alt={scannedProduct.name}
              className="w-16 h-16 object-cover rounded" 
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{scannedProduct.name}</p>
              {scannedProduct.nameHindi && (
                <p className="text-sm text-gray-600 font-devanagari">{scannedProduct.nameHindi}</p>
              )}
              <p className="text-lg font-bold text-primary">₹{parseFloat(scannedProduct.price).toLocaleString()}</p>
              {scannedProduct.brand && (
                <p className="text-xs text-gray-500">{scannedProduct.brand}</p>
              )}
            </div>
            <Button 
              onClick={() => handleAddToCart(scannedProduct)}
              className="bg-secondary hover:bg-green-700 touch-feedback"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}
      
      {/* Recent Scans */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Recent Scans</h4>
        {recentScans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Scan className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent scans</p>
            <p className="text-xs font-devanagari">कोई हाल की स्कैन नहीं</p>
          </div>
        ) : (
          recentScans.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <img 
                  src={product.imageUrl || '/placeholder-product.jpg'} 
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded" 
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  {product.nameHindi && (
                    <p className="text-xs text-gray-600 font-devanagari">{product.nameHindi}</p>
                  )}
                  <p className="text-sm font-bold text-primary">₹{parseFloat(product.price).toLocaleString()}</p>
                  {product.stockQuantity <= 5 && (
                    <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => handleAddToCart(product)}
                size="sm"
                className="bg-secondary hover:bg-green-700 touch-feedback"
              >
                Add
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
