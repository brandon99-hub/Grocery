import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { 
  ShoppingBasket, 
  Truck, 
  Leaf, 
  Shield, 
  MapPin,
  Star,
  Clock,
  Users
} from "lucide-react";
import ProductCard from "@/components/product-card";

export default function Landing() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const categoryIcons = {
    "Vegetables": "🥕",
    "Fruits": "🍎", 
    "Dairy": "🧀",
    "Bakery": "🍞",
    "Meat & Fish": "🐟",
    "Snacks": "🍪"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="grocery-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Fresh Groceries<br />
                <span className="text-accent">Delivered Fast</span>
              </h1>
              <p className="text-xl mb-8 text-green-100">
                Get your daily essentials delivered to your doorstep in 30 minutes. 
                Shop from the best local stores with unbeatable freshness guarantee.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start Shopping
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Fresh vegetables display" 
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                />
                <img 
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Fresh fruits arrangement" 
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our wide selection of fresh groceries organized by category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories?.map((category: any) => (
              <Card key={category.id} className="grocery-card cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="grocery-category-icon bg-green-50 text-primary group-hover:bg-primary group-hover:text-white">
                    <span className="text-2xl">{categoryIcons[category.name as keyof typeof categoryIcons] || "🛒"}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">120+ items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Fresh Deals</h2>
              <p className="text-gray-600">Hand-picked fresh items with great discounts</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All →
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="grocery-card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GrocerSwift?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of grocery shopping with our innovative features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <Truck className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">30-Min Delivery</h3>
              <p className="text-gray-600">
                Get your groceries delivered to your doorstep in 30 minutes or less. Fresh, fast, and reliable.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <Leaf className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fresh Guarantee</h3>
              <p className="text-gray-600">
                100% fresh guarantee on all produce. Not satisfied? We'll replace it for free.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <Shield className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Checkout</h3>
              <p className="text-gray-600">
                Shop with confidence using our secure payment system with multiple payment options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to get fresh groceries delivered to your door
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse & Select</h3>
              <p className="text-gray-600 mb-4">
                Browse through thousands of fresh products and add them to your cart
              </p>
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Grocery shopping cart with fresh items" 
                className="rounded-lg shadow-md w-full h-32 object-cover"
              />
            </div>

            <div className="text-center relative">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Schedule & Pay</h3>
              <p className="text-gray-600 mb-4">
                Choose your delivery time and pay securely through multiple payment options
              </p>
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Mobile grocery shopping app interface" 
                className="rounded-lg shadow-md w-full h-32 object-cover"
              />
            </div>

            <div className="text-center relative">
              <div className="bg-accent rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600 mb-4">
                Our delivery partners bring your groceries fresh to your doorstep
              </p>
              <img 
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Delivery truck for grocery delivery service" 
                className="rounded-lg shadow-md w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 grocery-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Experience Fresh Grocery Delivery?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of satisfied customers who trust GrocerSwift for their daily essentials
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your First Order
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Download App
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
