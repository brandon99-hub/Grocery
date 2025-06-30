import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface CartContextType {
  cartItems: any[] | undefined;
  cartItemsCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const cartItemsCount = cartItems?.length || 0;
  
  const cartTotal = cartItems?.reduce((total: number, item: any) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0) || 0;

  // Close cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
    }
  }, [isAuthenticated]);

  const value: CartContextType = {
    cartItems,
    cartItemsCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    isLoading: isLoading && isAuthenticated,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
