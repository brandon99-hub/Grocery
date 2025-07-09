import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Minus, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price: string;
    originalPrice?: string;
    imageUrl?: string;
    unit?: string;
    weight?: string;
    discount?: number;
    inStock?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Success",
        description: `Added ${product.name} to cart`,
      });
      setQuantity(1);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to sign in to add items to cart",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate({ productId: product.id, quantity });
  };

  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : product.discount;

  return (
    <Card className="grocery-card group overflow-hidden">
      <div className="relative">
        <img
          src={product.imageUrl || `https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=400&h=300`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            {discountPercent}% OFF
          </Badge>
        )}

        {/* Hot Deal Badge */}
        {product.discount && product.discount >= 20 && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white">
            HOT DEAL
          </Badge>
        )}

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </Button>

        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500">
            {product.weight || product.unit || 'Each'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Ksh {price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.inStock !== false && (
            <div className="flex items-center space-x-2">
              {/* Quantity Selector (for logged in users) */}
              {isAuthenticated && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || product.inStock === false}
                className="grocery-button h-8 px-3 text-sm"
              >
                {addToCartMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Product Description (if available) */}
        {product.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
