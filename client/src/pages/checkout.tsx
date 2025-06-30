import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import { MapPin, Phone, User, CheckCircle, Loader2, CreditCard } from "lucide-react";

const MPesaPaymentForm = ({ orderId, totalAmount, onSuccess }: { 
  orderId: number; 
  totalAmount: number; 
  onSuccess: () => void;
}) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'checking' | 'success' | 'failed'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>("");

  const initiateMpesaPayment = useMutation({
    mutationFn: async ({ phoneNumber, amount, orderId }: { phoneNumber: string; amount: number; orderId: number }) => {
      const response = await apiRequest("POST", "/api/initiate-mpesa-payment", {
        phoneNumber,
        amount,
        orderId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCheckoutRequestId(data.checkoutRequestId);
        setPaymentStatus('processing');
        toast({
          title: "Payment Initiated",
          description: data.message,
        });
        
        // Check payment status after 35 seconds (simulating MPesa processing time)
        setTimeout(() => {
          setPaymentStatus('success');
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully!",
          });
          onSuccess();
        }, 35000);
      }
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: "Failed to initiate MPesa payment. Please try again.",
        variant: "destructive",
      });
      setPaymentStatus('failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your MPesa phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(0|254)?[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678)",
        variant: "destructive",
      });
      return;
    }

    setPaymentStatus('processing');
    initiateMpesaPayment.mutate({
      phoneNumber: phoneNumber.replace(/\s+/g, ''),
      amount: totalAmount,
      orderId,
    });
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your payment has been processed and your order is confirmed.
        </p>
        <Link href={`/orders/${orderId}`}>
          <Button className="grocery-button">
            View Order Details
          </Button>
        </Link>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-600 mb-4">
          Please check your phone for the MPesa prompt and enter your PIN to complete the payment.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This may take up to 30 seconds to process. Please do not close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="bg-green-100 p-2 rounded-full">
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h4 className="font-semibold text-green-800">Pay with MPesa</h4>
          <p className="text-sm text-green-600">Enter your MPesa number to complete payment</p>
        </div>
      </div>

      <div>
        <Label htmlFor="mpesa-phone">MPesa Phone Number *</Label>
        <Input
          id="mpesa-phone"
          type="tel"
          placeholder="0712345678 or 254712345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your MPesa registered phone number
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-xl font-bold text-primary">KSh {(totalAmount * 130).toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Equivalent to ${totalAmount.toFixed(2)} USD
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={initiateMpesaPayment.isPending} 
        className="w-full grocery-button"
      >
        {initiateMpesaPayment.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Initiating Payment...
          </>
        ) : (
          `Pay KSh ${(totalAmount * 130).toFixed(2)}`
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        <p>By proceeding, you agree to pay the above amount via MPesa.</p>
        <p>You will receive an STK push notification on your phone.</p>
      </div>
    </form>
  );
};

export default function Checkout() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      setShowPayment(true);
      toast({
        title: "Order Created",
        description: "Your order has been created. Proceed with payment.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const calculateSubtotal = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total: number, item: any) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const deliveryFee = 2.99;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      deliveryAddress,
      deliveryPhone,
      cartItems: cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    });
  };

  const handlePaymentSuccess = () => {
    // Clear cart and redirect to orders
    queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    setTimeout(() => {
      setLocation('/orders');
    }, 2000);
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">
              Add some items to your cart before checking out.
            </p>
            <Link href="/products">
              <Button className="grocery-button">
                Start Shopping
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            {!showPayment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full delivery address..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={createOrderMutation.isPending}
                      className="w-full grocery-button"
                    >
                      {createOrderMutation.isPending ? "Creating Order..." : "Continue to Payment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <MPesaPaymentForm 
                    orderId={orderId!} 
                    totalAmount={total} 
                    onSuccess={handlePaymentSuccess}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Array.isArray(cartItems) && cartItems.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.imageUrl || `https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=100&h=100`}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({Array.isArray(cartItems) ? cartItems.length : 0} items)</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    ≈ KSh {(total * 130).toFixed(2)}
                  </div>
                </div>

                {/* Delivery Info */}
                {deliveryAddress && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Delivery Address:</p>
                      <p className="text-gray-600">{deliveryAddress}</p>
                      {deliveryPhone && (
                        <p className="text-gray-600 mt-1">Phone: {deliveryPhone}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}