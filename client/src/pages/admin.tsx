import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Redirect non-admin users
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsProductDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product created successfully",
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
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsProductDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
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
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
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
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
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
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      originalPrice: formData.get('originalPrice') || undefined,
      imageUrl: formData.get('imageUrl'),
      category: parseInt(formData.get('category') as string),
      stockCount: parseInt(formData.get('stockCount') as string),
      unit: formData.get('unit'),
      weight: formData.get('weight'),
      isFeatured: formData.get('isFeatured') === 'on',
      discount: parseInt(formData.get('discount') as string) || 0,
    };

    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    "out-for-delivery": "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your grocery store operations</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">Ksh {stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), 'PPp')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Ksh {parseFloat(order.totalAmount).toFixed(2)}</p>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="grocery-button" onClick={() => setSelectedProduct(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={selectedProduct?.name || ''}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select name="category" defaultValue={selectedProduct?.category?.toString() || ''} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={selectedProduct?.description || ''}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={selectedProduct?.price || ''}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price</Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          defaultValue={selectedProduct?.originalPrice || ''}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        defaultValue={selectedProduct?.imageUrl || ''}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="stockCount">Stock Count</Label>
                        <Input
                          id="stockCount"
                          name="stockCount"
                          type="number"
                          defaultValue={selectedProduct?.stockCount || '0'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          name="unit"
                          defaultValue={selectedProduct?.unit || 'piece'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          name="weight"
                          defaultValue={selectedProduct?.weight || ''}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="discount">Discount %</Label>
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={selectedProduct?.discount || '0'}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          defaultChecked={selectedProduct?.isFeatured || false}
                          className="rounded"
                        />
                        <Label htmlFor="isFeatured">Featured Product</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProductDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="grocery-button"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      >
                        {selectedProduct ? 'Update' : 'Create'} Product
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="flex items-center space-x-3">
                          <img
                            src={product.imageUrl || `https://images.unsplash.com/photo-1546470427-e5727173b5be?auto=format&fit=crop&w=100&h=100`}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.isFeatured && (
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {categories?.find((cat: any) => cat.id === product.category)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>Ksh {parseFloat(product.price).toFixed(2)}</TableCell>
                        <TableCell>{product.stockCount}</TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? "default" : "destructive"}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsProductDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Order Management</h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.userId}</TableCell>
                        <TableCell>{order.orderItems?.length || 0} items</TableCell>
                        <TableCell>Ksh {parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatusMutation.mutate({ id: order.id, status: value })}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart className="mx-auto h-24 w-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-500">
                Detailed analytics and reporting features will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
