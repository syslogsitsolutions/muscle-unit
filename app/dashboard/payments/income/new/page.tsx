"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { toast } from "sonner";

const formSchema = z.object({
  memberName: z.string().min(1, "Member name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  method: z.string().min(1, "Payment method is required"),
  type: z.string().min(1, "Payment type is required"),
  membershipPlan: z.string().optional(),
  notes: z.string().optional(),
});

// Thermal printer utility functions
const generateThermalReceipt = (paymentData: any) => {
  const now = new Date();
  const receiptId = `RCP-${Date.now()}`;

  // ESC/POS commands for 58mm thermal printer
  const ESC = "\x1b";
  const GS = "\x1d";

  // Control commands
  const INIT = ESC + "@"; // Initialize printer
  const CENTER = ESC + "a" + "\x01"; // Center alignment
  const LEFT = ESC + "a" + "\x00"; // Left alignment
  const BOLD_ON = ESC + "E" + "\x01"; // Bold on
  const BOLD_OFF = ESC + "E" + "\x00"; // Bold off
  const DOUBLE_HEIGHT = GS + "!" + "\x01"; // Double height
  const NORMAL_SIZE = GS + "!" + "\x00"; // Normal size
  const CUT = GS + "V" + "\x42" + "\x00"; // Cut paper
  const LINE_FEED = "\n";
  const SEPARATOR = "--------------------------------";

  let receipt = INIT;

  // Header
  receipt += CENTER + BOLD_ON + DOUBLE_HEIGHT;
  receipt += "FITNESS GYM" + LINE_FEED;
  receipt += NORMAL_SIZE + BOLD_OFF;
  receipt += "123 Fitness Street" + LINE_FEED;
  receipt += "Your City, State 12345" + LINE_FEED;
  receipt += "Tel: (555) 123-4567" + LINE_FEED;
  receipt += LEFT + LINE_FEED;

  // Receipt details
  receipt += SEPARATOR + LINE_FEED;
  receipt += BOLD_ON + "PAYMENT RECEIPT" + BOLD_OFF + LINE_FEED;
  receipt += SEPARATOR + LINE_FEED;

  receipt += `Receipt ID: ${receiptId}` + LINE_FEED;
  receipt += `Date: ${now.toLocaleDateString()}` + LINE_FEED;
  receipt += `Time: ${now.toLocaleTimeString()}` + LINE_FEED;
  receipt += LINE_FEED;

  // Payment details
  receipt += BOLD_ON + "PAYMENT DETAILS:" + BOLD_OFF + LINE_FEED;
  receipt += `Member: ${paymentData.memberName}` + LINE_FEED;
  receipt += `Amount: $${paymentData.amount}` + LINE_FEED;
  receipt += `Method: ${paymentData.method}` + LINE_FEED;
  receipt += `Type: ${paymentData.type}` + LINE_FEED;

  if (paymentData.membershipPlan) {
    receipt += `Plan: ${paymentData.membershipPlan}` + LINE_FEED;
  }

  if (paymentData.notes) {
    receipt += `Notes: ${paymentData.notes}` + LINE_FEED;
  }

  receipt += LINE_FEED;
  receipt += SEPARATOR + LINE_FEED;
  receipt += CENTER + BOLD_ON;
  receipt += `TOTAL: $${paymentData.amount}` + LINE_FEED;
  receipt += BOLD_OFF + LEFT + LINE_FEED;

  // Footer
  receipt += CENTER;
  receipt += "Thank you for your payment!" + LINE_FEED;
  receipt += "Keep this receipt for your records" + LINE_FEED;
  receipt += LINE_FEED + LINE_FEED;
  receipt += LEFT;

  // Cut paper
  receipt += CUT;

  return receipt;
};

const printThermalReceipt = async (receiptData: string) => {
  try {
    // Check if Web Serial API is supported
    if (!("serial" in navigator)) {
      throw new Error(
        "Web Serial API not supported. Please use Chrome/Edge browser."
      );
    }

    // Request access to serial port (thermal printer)
    const port = await (navigator as any).serial.requestPort({
      filters: [
        { usbVendorId: 0x0416 }, // Common thermal printer vendor IDs
        { usbVendorId: 0x04b8 }, // Epson
        { usbVendorId: 0x154f }, // Citizen
      ],
    });

    // Open the port
    await port.open({ baudRate: 9600 });

    // Get writer
    const writer = port.writable.getWriter();

    // Convert receipt data to bytes
    const data = new TextEncoder().encode(receiptData);

    // Write to printer
    await writer.write(data);

    // Close writer and port
    writer.releaseLock();
    await port.close();

    return true;
  } catch (error: any) {
    console.error("Printing error:", error);

    // Fallback: Create printable window for manual printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                width: 58mm; 
                margin: 0; 
                padding: 10px;
                background: white;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .separator { border-top: 1px dashed #000; margin: 5px 0; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="center bold" style="font-size: 16px;">FITNESS GYM</div>
            <div class="center">123 Fitness Street</div>
            <div class="center">Your City, State 12345</div>
            <div class="center">Tel: (555) 123-4567</div>
            <br>
            <div class="separator"></div>
            <div class="center bold">PAYMENT RECEIPT</div>
            <div class="separator"></div>
            <div>Receipt ID: RCP-${Date.now()}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Time: ${new Date().toLocaleTimeString()}</div>
            <br>
            <div class="bold">PAYMENT DETAILS:</div>
            <div>Member: ${receiptData.split("Member: ")[1]?.split("\n")[0] || "N/A"}</div>
            <div>Amount: ${receiptData.split("Amount: ")[1]?.split("\n")[0] || "N/A"}</div>
            <div>Method: ${receiptData.split("Method: ")[1]?.split("\n")[0] || "N/A"}</div>
            <div>Type: ${receiptData.split("Type: ")[1]?.split("\n")[0] || "N/A"}</div>
            <br>
            <div class="separator"></div>
            <div class="center bold" style="font-size: 14px;">TOTAL: ${receiptData.split("TOTAL: ")[1]?.split("\n")[0] || "N/A"}</div>
            <div class="separator"></div>
            <br>
            <div class="center">Thank you for your payment!</div>
            <div class="center">Keep this receipt for your records</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }

    throw new Error(`Printer not available. ${error.message}`);
  }
};

export default function NewPaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberName: "",
      amount: "",
      method: "",
      type: "",
      membershipPlan: "",
      notes: "",
    },
  });

  async function onSubmit(
    values: z.infer<typeof formSchema>,
    shouldPrint: boolean = false
  ) {
    setIsLoading(true);
    if (shouldPrint) setIsPrinting(true);

    try {
      // Here you would typically make an API call to create the payment
      console.log(values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Payment recorded successfully!");

      // Print receipt if requested
      if (shouldPrint) {
        try {
          const receiptData = generateThermalReceipt(values);
          await printThermalReceipt(receiptData);
          toast.success("Receipt printed successfully!");
        } catch (printError: any) {
          toast.error(`Printing failed: ${printError.message}`);
        }
      }

      router.push("/dashboard/payments");
    } catch (error) {
      toast.error("Failed to record payment");
      console.error("Failed to create payment:", error);
    } finally {
      setIsLoading(false);
      setIsPrinting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/payments">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Record Payment</h2>
          <p className="text-muted-foreground">
            Create a new payment record in the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Enter the payment information below.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit((values) => onSubmit(values, false))();
            }}
          >
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="memberName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the payment amount in USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <SelectItem value="card">
                            Credit/Debit Card
                          </SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank transfer">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="online">Online Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="membership">Membership</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="membershipPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Plan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select membership plan (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Premium Monthly">
                          Premium Monthly
                        </SelectItem>
                        <SelectItem value="Premium Annual">
                          Premium Annual
                        </SelectItem>
                        <SelectItem value="Standard Monthly">
                          Standard Monthly
                        </SelectItem>
                        <SelectItem value="Standard Annual">
                          Standard Annual
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only required for membership payments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add any additional notes (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/payments")}
                disabled={isLoading || isPrinting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isPrinting}
                variant="default"
              >
                {isLoading ? "Recording..." : "Record Payment"}
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const isValid = await form.trigger();
                  if (isValid) {
                    const values = form.getValues();
                    onSubmit(values, true);
                  }
                }}
                disabled={isLoading || isPrinting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? "Printing..." : "Pay & Print"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
