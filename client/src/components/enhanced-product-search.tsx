import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Star, 
  Package, 
  Leaf,
  ShoppingCart,
  Plus,
  Heart,
  Info,
  ArrowLeft
} from 'lucide-react';
import type { Product } from '@shared/schema';

interface EnhancedProductSearchProps {
  onProductSelected: (product: Product) => void;
}

export default function EnhancedProductSearch({ onProductSelected }: EnhancedProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategoryView, setShowCategoryView] = useState(false);
  const [activeCategoryProducts, setActiveCategoryProducts] = useState<Product[]>([]);
  const [activeCategoryName, setActiveCategoryName] = useState('');
  const { toast } = useToast();

  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get category data with product counts
  const categoryData = [
    { id: 'rice', name: 'Rice & Grains', nameHindi: 'चावल और अनाज', icon: '🌾', color: 'bg-yellow-100' },
    { id: 'oils', name: 'Cooking Oils', nameHindi: 'खाना पकाने का तेल', icon: '🫒', color: 'bg-orange-100' },
    { id: 'vegetables', name: 'Fresh Vegetables', nameHindi: 'ताजी सब्जियाँ', icon: '🥬', color: 'bg-green-100' },
    { id: 'fruits', name: 'Fresh Fruits', nameHindi: 'ताजे फल', icon: '🍎', color: 'bg-red-100' },
    { id: 'spices', name: 'Spices & Masala', nameHindi: 'मसाले', icon: '🌶️', color: 'bg-red-100' },
    { id: 'dairy', name: 'Dairy Products', nameHindi: 'डेयरी उत्पाद', icon: '🥛', color: 'bg-blue-100' },
    { id: 'snacks', name: 'Snacks & Sweets', nameHindi: 'नाश्ता और मिठाई', icon: '🍪', color: 'bg-purple-100' }
  ];

  // Get products by category
  const getProductsByCategory = (category: string) => {
    if (!products) return [];
    return products.filter(product => product.category === category);
  };

  // Handle category click to show all products
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    const categoryProducts = getProductsByCategory(categoryId);
    setActiveCategoryProducts(categoryProducts);
    setActiveCategoryName(categoryName);
    setShowCategoryView(true);
    
    toast({
      title: `${categoryName} Products`,
      description: `Found ${categoryProducts.length} products in this category`,
    });
  };

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameHindi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'stock':
        return b.stockQuantity - a.stockQuantity;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleProductSelect = (product: Product) => {
    onProductSelected(product);
    toast({
      title: "Product Added",
      description: `${product.name} added to cart`,
    });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer group" 
          onClick={() => handleProductSelect(product)}>
      <div className="space-y-3">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
            {product.isWeighable && (
              <Badge variant="outline" className="text-xs">Weighable</Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-600 font-devanagari">{product.nameHindi}</p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-primary">₹{parseFloat(product.price).toFixed(2)}</span>
                <span className="text-xs text-gray-500">/ {product.unit}</span>
              </div>
              {product.brand && (
                <p className="text-xs text-gray-500">{product.brand}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Badge variant={product.stockQuantity > 20 ? "default" : "destructive"} className="text-xs">
                {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
            variant="outline"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );

  const CategoryCard = ({ category }: { category: any }) => {
    const productCount = getProductsByCategory(category.id).length;
    
    return (
      <Card 
        className={`p-4 ${category.color} hover:shadow-lg transition-shadow cursor-pointer group`}
        onClick={() => handleCategoryClick(category.id, category.name)}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-3xl">{category.icon}</div>
            <Badge className="bg-white text-gray-700">{productCount} items</Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600 font-devanagari">{category.nameHindi}</p>
          </div>
          
          <Button 
            size="sm" 
            className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
            variant="outline"
          >
            View All {productCount} Products
          </Button>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products... / उत्पाद खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
              <SelectItem value="stock">In Stock</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category View Dialog */}
      <Dialog open={showCategoryView} onOpenChange={setShowCategoryView}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCategoryView(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <DialogTitle>{activeCategoryName} - All Products ({activeCategoryProducts.length} items)</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {activeCategoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Browse Categories</TabsTrigger>
          <TabsTrigger value="search">Search Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryData.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {sortedProducts.length} products found
            </p>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryData.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}