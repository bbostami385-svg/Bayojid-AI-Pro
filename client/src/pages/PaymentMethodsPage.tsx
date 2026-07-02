import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Trash2, Plus, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PaymentMethodsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [methodType, setMethodType] = useState<"card" | "bkash" | "nagad" | "rocket" | "bank_transfer">("card");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const methodsQuery = trpc.payment.getPaymentMethods.useQuery();
  const addMethodMutation = trpc.payment.addPaymentMethod.useMutation();
  const deleteMethodMutation = trpc.payment.deletePaymentMethod.useMutation();

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData(e.currentTarget as HTMLFormElement);

      await addMethodMutation.mutateAsync({
        type: methodType,
        isDefault,
        cardLastFour: formData.get("cardLastFour") as string,
        cardBrand: formData.get("cardBrand") as string,
        cardExpiry: formData.get("cardExpiry") as string,
        phoneNumber: formData.get("phoneNumber") as string,
        bankName: formData.get("bankName") as string,
        accountNumber: formData.get("accountNumber") as string,
        accountHolder: formData.get("accountHolder") as string,
      });

      setShowAddForm(false);
      methodsQuery.refetch();
    } catch (error) {
      console.error("Error adding payment method:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: number) => {
    try {
      await deleteMethodMutation.mutateAsync({ methodId });
      methodsQuery.refetch();
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  const methods = methodsQuery.data || [];

  const getMethodIcon = (type: string) => {
    const icons: Record<string, string> = {
      card: "💳",
      bkash: "📱",
      nagad: "📱",
      rocket: "🚀",
      bank_transfer: "🏦",
    };
    return icons[type] || "💰";
  };

  const getMethodLabel = (type: string) => {
    const labels: Record<string, string> = {
      card: "Credit/Debit Card",
      bkash: "bKash",
      nagad: "Nagad",
      rocket: "Rocket",
      bank_transfer: "Bank Transfer",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Methods</h1>
            <p className="text-slate-400">Manage your saved payment methods</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>

        {/* Add Payment Method Form */}
        {showAddForm && (
          <Card className="bg-slate-800 border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Add New Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMethod} className="space-y-6">
                {/* Payment Method Type */}
                <div>
                  <Label className="text-white mb-3 block">Payment Method Type</Label>
                  <RadioGroup value={methodType} onValueChange={(value: any) => setMethodType(value)}>
                    <div className="grid grid-cols-2 gap-4">
                      {["card", "bkash", "nagad", "rocket", "bank_transfer"].map((type) => (
                        <div
                          key={type}
                          className="flex items-center space-x-2 p-3 border border-slate-700 rounded-lg hover:border-purple-500 cursor-pointer"
                        >
                          <RadioGroupItem value={type} id={type} className="text-purple-500" />
                          <Label htmlFor={type} className="cursor-pointer text-white">
                            {getMethodIcon(type)} {getMethodLabel(type)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Fields */}
                {methodType === "card" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Card Last 4 Digits</Label>
                      <Input
                        name="cardLastFour"
                        placeholder="1234"
                        maxLength={4}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Card Brand</Label>
                      <Input
                        name="cardBrand"
                        placeholder="Visa"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-white mb-2 block">Expiry Date</Label>
                      <Input
                        name="cardExpiry"
                        placeholder="MM/YY"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Banking Fields */}
                {["bkash", "nagad", "rocket"].includes(methodType) && (
                  <div>
                    <Label className="text-white mb-2 block">Phone Number</Label>
                    <Input
                      name="phoneNumber"
                      placeholder="01700000000"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                )}

                {/* Bank Transfer Fields */}
                {methodType === "bank_transfer" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">Bank Name</Label>
                      <Input
                        name="bankName"
                        placeholder="Bank Name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Account Number</Label>
                      <Input
                        name="accountNumber"
                        placeholder="Account Number"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Account Holder Name</Label>
                      <Input
                        name="accountHolder"
                        placeholder="Account Holder Name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Default Method Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                  />
                  <Label htmlFor="isDefault" className="text-white cursor-pointer">
                    Set as default payment method
                  </Label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Method"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {methods.length === 0 ? (
            <Card className="bg-slate-800 border-purple-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-slate-400 mb-4">No payment methods saved yet</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add Your First Payment Method
                </Button>
              </CardContent>
            </Card>
          ) : (
            methods.map((method) => (
              <Card
                key={method.id}
                className={`bg-slate-800 border-2 transition-all ${
                  method.isDefault ? "border-purple-500" : "border-slate-700"
                }`}
              >
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{getMethodIcon(method.type)}</span>
                      <div>
                        <h3 className="text-white font-semibold">
                          {getMethodLabel(method.type)}
                          {method.isDefault && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              <Check className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {method.type === "card"
                            ? `${method.cardBrand} ending in ${method.cardLastFour}`
                            : method.type === "bank_transfer"
                            ? `${method.bankName} - ${method.accountNumber}`
                            : method.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteMethod(method.id)}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
