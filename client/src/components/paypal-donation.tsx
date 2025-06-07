import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useLanguage } from "@/lib/i18n";

interface PayPalDonationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default function PayPalDonation({ onSuccess, onCancel, onError }: PayPalDonationProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [paypalCheckoutSession, setPaypalCheckoutSession] = useState<any>(null);
  const { toast } = useToast();
  // const { t } = useLanguage();

  const predefinedAmounts = [5, 10, 25, 50];

  const createOrder = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    console.log("Creating order with amount:", { selectedAmount, customAmount, finalAmount: amount });
    
    if (!amount || amount < 1) {
      console.error("Amount validation failed:", { amount, selectedAmount, customAmount });
      toast({
        title: "Donation Failed",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: "USD",
          intent: "CAPTURE"
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const output = await response.json();
      return { orderId: output.id };
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Donation Failed",
        description: "Failed to create payment order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const captureOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error capturing order:", error);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      setIsLoading(true);
      const orderData = await captureOrder(data.orderId);
      console.log("Capture result", orderData);
      
      toast({
        title: "Donation Successful",
        description: "Thank you for your support!",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Payment approval failed:", error);
      toast({
        title: "Donation Failed",
        description: "Payment processing failed",
        variant: "destructive",
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onCancelPayment = async (data: any) => {
    console.log("Payment cancelled", data);
    toast({
      title: "Payment Cancelled",
      description: "Payment was cancelled by user",
      variant: "default",
    });
    onCancel?.();
  };

  const onErrorPayment = async (error: any) => {
    console.error("Payment error", error);
    toast({
      title: "Donation Failed",
      description: "Payment processing error",
      variant: "destructive",
    });
    onError?.(error);
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = "https://www.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
      }
    };

    loadPayPalSDK();
  }, []);

  const initPayPal = async () => {
    console.log("Initializing PayPal...");
    try {
      console.log("Fetching client token...");
      const clientToken: string = await fetch("/api/paypal/setup")
        .then((res) => {
          console.log("PayPal setup response:", res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Client token received:", data);
          return data.clientToken;
        });

      console.log("Creating PayPal SDK instance...");
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });
      console.log("SDK instance created:", sdkInstance);

      console.log("Creating PayPal checkout session...");
      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel: onCancelPayment,
        onError: onErrorPayment,
      });
      console.log("PayPal checkout session created:", paypalCheckout);
      setPaypalCheckoutSession(paypalCheckout);

      const onClick = async () => {
        const amount = selectedAmount || parseFloat(customAmount);
        if (!amount || amount < 1) {
          toast({
            title: "Donation Failed",
            description: "Please enter a valid amount",
            variant: "destructive",
          });
          return;
        }

        console.log("PayPal button clicked!");
        try {
          setIsLoading(true);
          const checkoutOptionsPromise = createOrder();
          console.log("Checkout options promise:", checkoutOptionsPromise);
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error("PayPal onClick error:", e);
          setIsLoading(false);
        }
      };

      console.log("Looking for PayPal button...");
      const paypalButton = document.getElementById("paypal-donation-button");
      console.log("PayPal button found:", paypalButton);
      if (paypalButton) {
        console.log("Adding click event listener to PayPal button");
        paypalButton.addEventListener("click", onClick);
      } else {
        console.error("PayPal button not found in DOM");
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error("PayPal initialization error:", e);
      toast({
        title: "Donation Failed",
        description: "Failed to initialize PayPal",
        variant: "destructive",
      });
    }
  };

  const handleAmountSelect = (amount: number) => {
    console.log("Amount selected:", amount);
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getCurrentAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const handlePayPalClick = async () => {
    if (getCurrentAmount() < 1 || isLoading) {
      return;
    }

    if (!paypalCheckoutSession) {
      console.error("PayPal checkout session not available");
      toast({
        title: "Donation Failed",
        description: "PayPal not initialized",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("PayPal button clicked!");
      console.log("Creating order with amount:", getCurrentAmount());
      
      const checkoutOptionsPromise = createOrder();
      console.log("Checkout options promise:", checkoutOptionsPromise);
      
      await paypalCheckoutSession.start(
        { paymentFlow: "auto" },
        checkoutOptionsPromise,
      );
    } catch (e) {
      console.error("PayPal checkout error:", e);
      toast({
        title: "Donation Failed",
        description: "Failed to start PayPal checkout",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Support Project
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Predefined Amounts */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select donation amount:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => handleAmountSelect(amount)}
                className="h-12 text-sm"
                disabled={isLoading}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {amount} USD
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Custom amount:
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="pl-10"
              min="1"
              step="0.01"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Amount Display */}
        {getCurrentAmount() > 0 && (
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Badge variant="secondary" className="text-base px-3 py-1">
              Donation Amount: ${getCurrentAmount().toFixed(2)}
            </Badge>
          </div>
        )}

        {/* PayPal Button */}
        <div className="pt-2">
          <Button
            id="paypal-donation-button"
            onClick={handlePayPalClick}
            disabled={isLoading || getCurrentAmount() < 1}
            className="w-full h-12 bg-[#0070ba] hover:bg-[#005ea6] text-white font-medium"
          >
            {isLoading ? 'Processing...' : 'Donate via PayPal'}
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center">
          Thank you for supporting our project!
        </p>
      </CardContent>
    </Card>
  );
}