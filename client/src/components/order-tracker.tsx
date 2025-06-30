import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Phone, 
  MessageCircle,
  Navigation,
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: number;
  status: string;
  trackingNumber?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  createdAt: string;
  totalAmount: string;
}

interface OrderTrackerProps {
  order: Order;
  className?: string;
}

const orderStatuses = [
  { key: "pending", label: "Order Placed", icon: Package, description: "Your order has been received" },
  { key: "processing", label: "Preparing Order", icon: Package, description: "We're picking your items" },
  { key: "out-for-delivery", label: "Out for Delivery", icon: Truck, description: "On the way to you" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, description: "Order completed" }
];

export default function OrderTracker({ order, className = "" }: OrderTrackerProps) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const statusIndex = orderStatuses.findIndex(s => s.key === order.status);
    setCurrentStatusIndex(statusIndex >= 0 ? statusIndex : 0);
    setProgress(statusIndex >= 0 ? ((statusIndex + 1) / orderStatuses.length) * 100 : 25);
  }, [order.status]);

  const getStatusColor = (index: number) => {
    if (index < currentStatusIndex) return "text-green-600";
    if (index === currentStatusIndex) return "text-blue-600";
    return "text-gray-400";
  };

  const getStatusBgColor = (index: number) => {
    if (index < currentStatusIndex) return "bg-green-100 border-green-300";
    if (index === currentStatusIndex) return "bg-blue-100 border-blue-300";
    return "bg-gray-100 border-gray-300";
  };

  const formatEstimatedDelivery = () => {
    if (!order.estimatedDelivery) return null;
    return format(new Date(order.estimatedDelivery), "PPP 'at' p");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order #{order.id}
            </CardTitle>
            <CardDescription>
              Placed on {format(new Date(order.createdAt), "PPP")}
            </CardDescription>
          </div>
          <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
            {orderStatuses.find(s => s.key === order.status)?.label || order.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Order Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          {orderStatuses.map((status, index) => {
            const Icon = status.icon;
            const isActive = index === currentStatusIndex;
            const isCompleted = index < currentStatusIndex;
            
            return (
              <div key={status.key} className="flex items-start gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${getStatusBgColor(index)}
                `}>
                  <Icon className={`h-4 w-4 ${getStatusColor(index)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${getStatusColor(index)}`}>
                    {status.label}
                    {isActive && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Current
                      </Badge>
                    )}
                    {isCompleted && (
                      <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {status.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Delivery Information */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Details
          </h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Address:</span>
              <p className="text-gray-600 mt-1">{order.deliveryAddress}</p>
            </div>
            
            {order.deliveryInstructions && (
              <div>
                <span className="font-medium">Instructions:</span>
                <p className="text-gray-600 mt-1">{order.deliveryInstructions}</p>
              </div>
            )}

            {order.estimatedDelivery && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-blue-800">Estimated Delivery:</span>
                  <p className="text-blue-700">{formatEstimatedDelivery()}</p>
                </div>
              </div>
            )}

            {order.trackingNumber && (
              <div>
                <span className="font-medium">Tracking Number:</span>
                <p className="text-gray-600 mt-1 font-mono">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Person Information */}
        {order.deliveryPersonName && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Delivery Person
              </h4>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{order.deliveryPersonName}</p>
                    {order.deliveryPersonPhone && (
                      <p className="text-sm text-gray-600">{order.deliveryPersonPhone}</p>
                    )}
                  </div>
                </div>
                
                {order.deliveryPersonPhone && order.status === "out-for-delivery" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Live Tracking (for out-for-delivery status) */}
        {order.status === "out-for-delivery" && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Live Tracking
              </h4>
              
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <Navigation className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  Real-time tracking will be available when your order is out for delivery
                </p>
                <Button variant="outline" size="sm">
                  <Navigation className="h-4 w-4 mr-1" />
                  Track on Map
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Order Summary */}
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">KSh {(parseFloat(order.totalAmount) * 150).toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            View Receipt
          </Button>
          {order.status === "delivered" && (
            <Button variant="outline" className="flex-1">
              Rate Order
            </Button>
          )}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button variant="outline" className="flex-1">
              Modify Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}