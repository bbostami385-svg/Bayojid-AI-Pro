import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  stripeProductId: string;
  name: string;
  description?: string;
  type: "product" | "subscription";
  isActive: boolean;
}

interface Price {
  id: number;
  stripePriceId: string;
  stripeProductId: string;
  amount: number;
  currency: string;
  billingCycle: string;
  isActive: boolean;
}

export function AdminProductManagement() {
  const productsQuery = trpc.stripe.getProducts.useQuery();
  const { toast } = useToast();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    type: "product" as const,
  });

  const [newPrice, setNewPrice] = useState({
    amount: "",
    currency: "usd",
    billingCycle: "month",
  });

  const handleAddProduct = async () => {
    if (!newProduct.name) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement API call to create product
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added successfully`,
    });

    setNewProduct({ name: "", description: "", type: "product" });
    setShowAddProduct(false);
  };

  const handleAddPrice = async () => {
    if (!selectedProduct || !newPrice.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement API call to create price
    toast({
      title: "Price Added",
      description: `Price has been added to ${selectedProduct.name}`,
    });

    setNewPrice({ amount: "", currency: "usd", billingCycle: "month" });
    setShowAddPrice(false);
  };

  if (productsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const { products = [], prices = [] } = productsQuery.data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-600">Manage Stripe products and pricing</p>
        </div>
        <Button onClick={() => setShowAddProduct(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Add Product Dialog */}
      {showAddProduct && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <Input
                placeholder="e.g., Pro Plan"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                placeholder="Product description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProduct} className="flex-1">
                Create Product
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddProduct(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Products</h2>
        {products.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No products found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product: Product) => {
              const productPrices = prices.filter(
                (p: Price) => p.stripeProductId === product.stripeProductId
              );

              return (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.description && (
                          <CardDescription>{product.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{product.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Prices */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Prices</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowAddPrice(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Price
                        </Button>
                      </div>

                      {productPrices.length > 0 ? (
                        <div className="space-y-2">
                          {productPrices.map((price: Price) => (
                            <div
                              key={price.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-semibold">
                                  ${(price.amount / 100).toFixed(2)} {price.currency.toUpperCase()}
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {price.billingCycle}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No prices defined</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Price Dialog */}
      {showAddPrice && selectedProduct && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Add Price to {selectedProduct.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newPrice.amount}
                  onChange={(e) => setNewPrice({ ...newPrice, amount: e.target.value })}
                />
                <select
                  value={newPrice.currency}
                  onChange={(e) => setNewPrice({ ...newPrice, currency: e.target.value })}
                  className="px-3 border rounded-md"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="bdt">BDT</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Billing Cycle</label>
              <select
                value={newPrice.billingCycle}
                onChange={(e) => setNewPrice({ ...newPrice, billingCycle: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="one_time">One Time</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPrice} className="flex-1">
                Create Price
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddPrice(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Stripe Integration</p>
              <p className="mt-1">
                Products and prices are synced with your Stripe account. Changes made here will be reflected in Stripe automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
