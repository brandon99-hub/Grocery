import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBasket, 
  Search, 
  MapPin, 
  ShoppingCart, 
  User,
  Menu,
  X
} from "lucide-react";
import CartSlideOver from "@/components/cart-slide-over";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItemsCount, isCartOpen, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleLogin = () => {
    window.location.href = "/auth";
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={isAuthenticated ? "/" : "/"}>
              <div className="flex items-center cursor-pointer">
                <div className="bg-primary rounded-lg p-2 mr-3">
                  <ShoppingBasket className="text-white h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-gray-900">GrocerSwift</span>
              </div>
            </Link>

            {/* Search Bar (Desktop) */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for groceries, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4"
                  />
                </form>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Location (Desktop) */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">Nairobi</span>
                </div>
              )}

              {/* Cart Button */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground h-5 w-5 text-xs flex items-center justify-center rounded-full">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="text-white h-4 w-4" />
                    </div>
                    <span className="hidden sm:block text-sm">
                      {(user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                  
                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="py-1">
                          <Link href="/orders">
                            <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                              My Orders
                            </div>
                          </Link>
                          <Link href="/orders">
                            <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                              Order History
                            </div>
                          </Link>
                          {(user as any)?.isAdmin && (
                            <>
                              <div className="border-t border-gray-100"></div>
                              <Link href="/admin">
                                <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                  Admin Dashboard
                                </div>
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button onClick={handleLogin} className="grocery-button">
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {isAuthenticated && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4"
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <Link href="/">
                <div className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                  Home
                </div>
              </Link>
              <Link href="/products">
                <div className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                  Products
                </div>
              </Link>
              <Link href="/orders">
                <div className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                  Orders
                </div>
              </Link>
              {(user as any)?.isAdmin && (
                <Link href="/admin">
                  <div className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    Admin
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Slide Over */}
      <CartSlideOver />
    </>
  );
}
