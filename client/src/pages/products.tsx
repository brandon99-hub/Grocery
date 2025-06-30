import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import ProductCard from "@/components/product-card";
import { useToast } from "@/hooks/use-toast";

// Types for API responses
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl?: string;
  category: number;
  inStock: boolean;
  unit: string;
  weight?: string;
  isFeatured: boolean;
  discount?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

// Filters interface
interface ProductFilters {
  search: string;
  categoryId: number | null;
  priceRange: [number, number];
  sortBy: 'name' | 'price-low' | 'price-high' | 'featured';
  viewMode: 'grid' | 'list';
}

export default function Products() {
  const { toast } = useToast();
  
  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    categoryId: null,
    priceRange: [0, 50],
    sortBy: 'featured',
    viewMode: 'grid'
  });

  // Fetch products with filters
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['/api/products', filters.categoryId, filters.search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('category', filters.categoryId.toString());
      if (filters.search) params.append('search', filters.search);
      
      return fetch(`/api/products?${params}`).then(res => res.json());
    }
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories']
  });

  // Find current category
  const currentCategory = categories.find((cat: Category) => cat.id === filters.categoryId);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sort products
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'featured':
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [products, filters.priceRange, filters.sortBy]);

  // Handle filter changes
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: null,
      priceRange: [0, 50],
      sortBy: 'featured',
      viewMode: filters.viewMode // Keep view mode
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.categoryId,
    ...(filters.priceRange[0] > 0 || filters.priceRange[1] < 50 ? ['price'] : [])
  ].filter(Boolean).length;

  if(isProductsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentCategory ? currentCategory.name : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedProducts.length} products found
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('viewMode', 'grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={filters.viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('viewMode', 'list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.categoryId?.toString() || ''}
          onValueChange={(value) => updateFilter('categoryId', value ? parseInt(value) : null)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category: Category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price-low">Price Low-High</SelectItem>
            <SelectItem value="price-high">Price High-Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Refine your product search with advanced filtering options.
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="mt-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>KSh {(filters.priceRange[0] * 150).toLocaleString()}</span>
                    <span>KSh {(filters.priceRange[1] * 150).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                disabled={activeFiltersCount === 0}
              >
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.search && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('search', '')}>
              Search: {filters.search} ×
            </Badge>
          )}
          {currentCategory && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('categoryId', null)}>
              Category: {currentCategory.name} ×
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 50) && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => updateFilter('priceRange', [0, 50])}
            >
              Price: KSh {(filters.priceRange[0] * 150).toLocaleString()}-{(filters.priceRange[1] * 150).toLocaleString()} ×
            </Badge>
          )}
        </div>
      )}

      {/* Products Grid/List */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or clearing filters.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={
          filters.viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredAndSortedProducts.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                imageUrl: product.imageUrl,
                unit: product.unit,
                weight: product.weight,
                discount: product.discount,
                inStock: product.inStock
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}