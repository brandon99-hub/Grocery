import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Package, Clock, CheckCircle, Truck, MapPin } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  "out-for-delivery": { label: "Out for Delivery", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: Package },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/products">
              <Button className="grocery-button">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Order #{order.id}
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {format(new Date(order.createdAt), 'PPP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          Ksh {parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items Preview */}
                    <div className="mb-4">
                      <div className="flex space-x-3 overflow-x-auto pb-2">
                        {order.orderItems?.slice(0, 4).map((item: any) => (
                          <div key={item.id} className="flex-shrink-0 text-center">
                            <img
                              src={item.product.imageUrl || `https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=100&h=100`}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg mb-1"
                            />
                            <p className="text-xs text-gray-600 truncate w-12">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ×{item.quantity}
                            </p>
                          </div>
                        ))}
                        {order.orderItems?.length > 4 && (
                          <div className="flex-shrink-0 w-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                              <span className="text-xs text-gray-500">
                                +{order.orderItems.length - 4}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery Address</p>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    {/* Estimated Delivery */}
                    {order.estimatedDelivery && (
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(order.estimatedDelivery), 'PPp')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          Track Order
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="ghost" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
