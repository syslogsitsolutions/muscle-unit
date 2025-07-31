"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CreditCard, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import formatCurrency from "@/utils/format-currency";
import { useCreateMembershipPayment } from "@/hooks/use-membership";
import { PAYMENT_METHODS } from "@/constants/payment";

const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  method: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership: {
    _id: string;
    memberDetails: {
      memberId: string;
      name: string;
      phone: string;
    };
    membershipTypeDetails: {
      name: string;
    };
    amount: number;
    amountPaid: number;
    startDate: string;
    endDate: string;
  };
  onPaymentSuccess?: () => void;
}

export default function QuickPaymentModal({
  isOpen,
  onClose,
  membership,
  onPaymentSuccess,
}: QuickPaymentModalProps) {
  console.log("membershipmodal", membership);

  const [isLoading, setIsLoading] = useState(false);
  const createMembershipPayment = useCreateMembershipPayment();

  const remainingBalance = membership.amount - membership.amountPaid;

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance.toString(),
      method: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsLoading(true);
    try {
      const paymentData = {
        amount: parseFloat(values.amount),
        method: values.method,
        notes: values.notes,
      };

      // API call to record payment
      await createMembershipPayment.mutateAsync({
        id: membership._id,
        data: paymentData,
      });

      toast.success("Payment recorded successfully!");
      form.reset();
      onClose();
      onPaymentSuccess?.();
    } catch (error) {
      toast.error("Failed to record payment");
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Quick Payment
          </DialogTitle>
          <DialogDescription>
            Record payment for <strong>{membership.memberDetails.name}</strong>
            's membership
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member ID:</span>
            <span className="font-medium">
              {membership.memberDetails.memberId}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan:</span>
            <span>{membership.membershipTypeDetails.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount:</span>
            <span>{formatCurrency(membership.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid:</span>
            <span className="text-green-600">
              {formatCurrency(membership.amountPaid)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-medium border-t pt-2">
            <span>Remaining Balance:</span>
            <span className="text-red-600 flex items-center gap-1">
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      max={remainingBalance}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this payment..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
