import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  MapPin, 
  Phone, 
  User,
  Clock
} from "lucide-react";
import { format } from "date-fns";

const trackingSteps = [
  { key: 'pending', label: 'Order Placed', icon: CheckCircle },
  { key: 'processing', label: 'Preparing', icon: Package },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTracking() {
  const [match, params] = useRoute("/orders/:id");
  const { isAuthenticated } = useAuth();
  const orderId = params?.id;

  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', orderId],
    enabled: isAuthenticated && !!orderId,
  });

  const getCurrentStepIndex = (status: string) => {
    const statusMap = {
      'pending': 0,
      'processing': 1,
      'out-for-delivery': 2,
      'delivered': 3,
      'cancelled': -1
    };
    return statusMap[status as keyof typeof statusMap] ?? 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
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
            <p className="text-gray-500">The order you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
              <p className="text-gray-600">
                Order #{order.id} • 
                {order.estimatedDelivery && !isDelivered && (
                  <span> Estimated delivery: {format(new Date(order.estimatedDelivery), 'p')}</span>
                )}
                {isDelivered && order.deliveredAt && (
                  <span> Delivered: {format(new Date(order.deliveredAt), 'PPp')}</span>
                )}
              </p>
            </div>
            
            {/* Progress Steps */}
            {!isCancelled && (
              <div className="relative mb-12">
                <div className="flex items-center justify-between">
                  {trackingSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center relative">
                        <div className={`rounded-full p-3 mb-2 ${
                          isCompleted 
                            ? 'bg-primary text-white' 
                            : isCurrent && !isDelivered
                            ? 'bg-primary text-white animate-pulse'
                            : 'bg-gray-300 text-white'
                        }`}>
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                        {isCompleted && (
                          <span className="text-xs text-gray-500 mt-1">
                            {format(new Date(order.createdAt), 'p')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 -z-10 mx-8">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Cancelled Status */}
            {isCancelled && (
              <div className="text-center mb-8">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Order Cancelled
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Address</p>
                  <p className="text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>
              {order.deliveryPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Number</p>
                    <p className="text-gray-600">{order.deliveryPhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-gray-900">Order Placed</p>
                  <p className="text-gray-600">{format(new Date(order.createdAt), 'PPp')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {order.orderItems?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.imageUrl || `https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=100&h=100`}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ${(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee || '0')).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">${parseFloat(order.deliveryFee || '0').toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Support */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Need help with your order?</p>
            <div className="flex justify-center space-x-4">
              <Button className="grocery-button">
                Contact Support
              </Button>
              {order.status === 'out-for-delivery' && (
                <Button variant="outline">
                  Call Driver
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
