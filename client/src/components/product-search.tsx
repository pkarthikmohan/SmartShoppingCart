import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/constants';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Star, 
  Package, 
  Leaf,
  CheckCircle,
  X
} from 'lucide-react';
import type { Product } from '@shared/schema';

interface ProductSearchProps {
  onProductSelected: (product: Product) => void;
}

export default function ProductSearch({ onProductSelected }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all products
  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Search products when query changes
  const { data: searchResults = [], isLoading: isSearching } = useQuery<Product[]>({
    queryKey: ['/api/products/search', debouncedQuery],
    enabled: debouncedQuery.length > 0,
  });

  // Get products by category
  const { data: categoryProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products/category', selectedCategory],
    enabled: selectedCategory !== 'all' && !debouncedQuery,
  });

  // Determine which products to show
  const getFilteredProducts = () => {
    let products = [];
    
    if (debouncedQuery) {
      products = searchResults;
    } else if (selectedCategory === 'all') {
      products = allProducts;
    } else {
      products = categoryProducts;
    }

    // Sort products
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'stock':
          return b.stockQuantity - a.stockQuantity;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  };

  const filteredProducts = getFilteredProducts();

  const handleProductSelect = (product: Product) => {
    onProductSelected(product);
    toast({
      title: "Product Selected",
      description: `${product.name} has been added to your cart`,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedCategory('all');
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div 
      className={`
        bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg 
        transition-all duration-200 touch-feedback cursor-pointer
        ${viewMode === 'list' ? 'flex' : ''}
      `}
      onClick={() => handleProductSelect(product)}
    >
      <img 
        src={product.imageUrl || '/placeholder-product.jpg'} 
        alt={product.name}
        className={`
          object-cover bg-gray-100
          ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-32'}
        `}
      />
      
      <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
            {product.name}
          </h4>
          {product.stockQuantity <= 5 && (
            <Badge variant="destructive" className="text-xs ml-2">
              Low Stock
            </Badge>
          )}
        </div>
        
        {product.nameHindi && (
          <p className="text-xs text-gray-600 font-devanagari mb-2 line-clamp-1">
            {product.nameHindi}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-primary">
            ₹{parseFloat(product.price).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">
            per {product.unit}
          </span>
        </div>
        
        {product.brand && (
          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {product.isWeighable && (
              <Badge variant="outline" className="text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                Fresh
              </Badge>
            )}
            {product.stockQuantity > 0 && (
              <Badge variant="outline" className="text-xs text-green-600">
                <Package className="w-3 h-3 mr-1" />
                In Stock
              </Badge>
            )}
          </div>
          
          <Button 
            size="sm" 
            className="bg-secondary hover:bg-green-700 text-xs touch-feedback"
            onClick={(e) => {
              e.stopPropagation();
              handleProductSelect(product);
            }}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-primary p-2 rounded-lg">
          <Search className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Product Search</h3>
          <p className="text-sm text-gray-600">Find products quickly</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products... / उत्पाद खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 touch-feedback"
        />
        {searchQuery && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between mb-4">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="vegetables" className="text-xs">Veg</TabsTrigger>
            <TabsTrigger value="fruits" className="text-xs">Fruits</TabsTrigger>
            <TabsTrigger value="grains" className="text-xs">Grains</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="touch-feedback"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSortBy(sortBy === 'name' ? 'price' : 'name')}
            className="touch-feedback"
          >
            <SortAsc className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 6).map((category) => (
            <Button
              key={category.id}
              size="sm"
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs touch-feedback"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {/* Search Stats */}
        {(debouncedQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {isSearching || isLoading ? 'Searching...' : `${filteredProducts.length} products found`}
            </span>
            {(debouncedQuery || selectedCategory !== 'all') && (
              <Button size="sm" variant="ghost" onClick={clearSearch} className="text-xs">
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isSearching) && (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`${viewMode === 'list' ? 'flex' : ''}`}>
                <Skeleton className={`${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-32'} mb-3`} />
                <div className={`${viewMode === 'list' ? 'flex-1 ml-3' : ''} space-y-2`}>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid/List */}
        {!isLoading && !isSearching && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm font-devanagari">कोई उत्पाद नहीं मिला</p>
                {debouncedQuery && (
                  <p className="text-xs mt-2">Try searching with different keywords</p>
                )}
              </div>
            ) : (
              <div className={`
                grid gap-4 
                ${viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
                }
              `}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Popular Searches */}
        {!debouncedQuery && selectedCategory === 'all' && !isLoading && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Popular Searches
            </h5>
            <div className="flex flex-wrap gap-2">
              {['Rice', 'Dal', 'Oil', 'Tomatoes', 'Onions', 'Milk', 'Spices'].map((term) => (
                <Button
                  key={term}
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchQuery(term)}
                  className="text-xs touch-feedback"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Quick Filters
          </h5>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortBy('price')}
              className="text-xs touch-feedback"
            >
              Low to High Price
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortBy('stock')}
              className="text-xs touch-feedback"
            >
              In Stock First
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
