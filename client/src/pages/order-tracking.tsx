import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OrderTracker from "@/components/order-tracker";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

export default function OrderTracking() {
  const [match, params] = useRoute("/orders/:id");
  const { isAuthenticated } = useAuth();
  const orderId = params?.id;

  const { data: order, isLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: isAuthenticated && !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-500 mb-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/orders">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Order Tracker Component */}
        <OrderTracker order={order} />
      </div>
      
      <Footer />
    </div>
  );
}