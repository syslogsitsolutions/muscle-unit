"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useGetAllMembership } from "@/hooks/use-membership-type";
import { useCreateMember } from "@/hooks/use-member";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const paymentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

// Updated schema with proper Date handling
const formSchema = z.object({
  memberId: z.string().min(1, "Member ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date of birth.",
  }),
  gender: z.enum(["male", "female", "other"]),
  emergencyContact: z.object({
    phone: z.string().optional(),
  }),
  membershipType: z.string().min(1, "Membership type is required."),
  healthInfo: z.object({
    medicalConditions: z.string().optional(),
    notes: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    bloodType: z.string().optional(),
  }),
  occupation: z.string().optional(),
  profileImage: z.string().optional(),
  // Changed to Date objects for better handling
  membershipValidFrom: z.date().optional(),
  membershipValidTo: z.date().optional(),
  paymentStatus: z.enum(["pending", "completed"]),
  paymentMethod: z.enum(["cash", "online", "other"]).default("online"),
});

type NewMemberFormData = z.infer<typeof formSchema>;

export default function NewMemberPage() {
  const router = useRouter();
  const createMember = useCreateMember();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: membershipTypes = [],
    isLoading: isMembershipLoading,
    isError,
  } = useGetAllMembership();

  const form = useForm<NewMemberFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      gender: "male",
      occupation: "",
      emergencyContact: {
        phone: "",
      },
      healthInfo: {
        medicalConditions: "",
        notes: "",
        weight: "",
        height: "",
        bloodType: "",
      },
      membershipType: "",
      profileImage: "",
      membershipValidFrom: undefined,
      membershipValidTo: undefined,
      paymentStatus: "completed",
      paymentMethod: "online",
    },
  });

  const selectedMembershipId = form.watch("membershipType");
  const selectedMembershipValidFrom = form.watch("membershipValidFrom");

  // Set default membership type when data loads
  useEffect(() => {
    if (membershipTypes.length > 0 && !form.getValues("membershipType")) {
      form.setValue("membershipType", membershipTypes[0]._id);
    }
  }, [membershipTypes, form]);

  // Generate next member ID
  useEffect(() => {
    const fetchNextMemberId = async () => {
      try {
        const res = await axios.post("/api/members/next-id");
        if (res.status === 200) {
          form.setValue("memberId", res.data.memberId);
        } else {
          toast.error(res.data.error || "Failed to fetch member ID");
        }
      } catch (err) {
        console.error("Error generating member ID:", err);
        toast.error("Error generating member ID");
      }
    };

    fetchNextMemberId();
  }, [form]);

  // Calculate membership dates when membership type changes
  useEffect(() => {
    if (!selectedMembershipId || membershipTypes.length === 0) return;

    const selectedMembership = membershipTypes.find(
      (type: any) => type._id === selectedMembershipId
    );

    if (!selectedMembership) return;

    const today = new Date();
    const validToDate = addDays(today, selectedMembership.duration);

    // Set both dates when membership type changes
    form.setValue("membershipValidFrom", today);
    form.setValue("membershipValidTo", validToDate);
  }, [selectedMembershipId, membershipTypes, form]);

  // Recalculate end date when start date changes
  useEffect(() => {
    if (!selectedMembershipValidFrom || !selectedMembershipId) return;

    const selectedMembership = membershipTypes.find(
      (type: any) => type._id === selectedMembershipId
    );

    if (!selectedMembership) return;

    const validToDate = addDays(
      selectedMembershipValidFrom,
      selectedMembership.duration
    );
    form.setValue("membershipValidTo", validToDate);
  }, [
    selectedMembershipValidFrom,
    selectedMembershipId,
    membershipTypes,
    form,
  ]);

  async function onSubmit(values: NewMemberFormData) {
    setIsLoading(true);
    try {
      // Convert dates to ISO strings for API submission
      const submitData = {
        ...values,
        membershipValidFrom: values.membershipValidFrom?.toISOString(),
        membershipValidTo: values.membershipValidTo?.toISOString(),
      };

      await createMember.mutateAsync(submitData);
      toast.success("Member added successfully!");
      router.push("/dashboard/members");
      form.reset();
    } catch (error) {
      toast.error("Failed to add member");
      console.error("Failed to add member:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const isFormLoading = isLoading || createMember.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Member</h2>
          <p className="text-muted-foreground">
            Create a new membership for your gym
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Member Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
              <CardDescription>
                Enter the details of the new member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        disabled={isFormLoading}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member ID</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Smith"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isFormLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0000000000"
                          {...field}
                          maxLength={10}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.smith@example.com"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St, Anytown, USA"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0000000000"
                          {...field}
                          maxLength={10}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Engineer"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>
                Enter the health information of the new member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="healthInfo.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="60 kg"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="healthInfo.height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="170 cm"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="healthInfo.bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A+"
                          {...field}
                          disabled={isFormLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="healthInfo.medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Asthma, Allergies"
                        {...field}
                        disabled={isFormLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthInfo.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any additional notes"
                        {...field}
                        disabled={isFormLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter the payment information for the new member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isFormLoading || isMembershipLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a membership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membershipTypes.map((type: any) => (
                            <SelectItem key={type._id} value={type._id}>
                              <div className="flex gap-2 items-center text-sm">
                                <span className="font-medium">{type.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {type.duration} days • ₹{type.offerPrice}
                                  {type.actualPrice > type.offerPrice && (
                                    <span className="line-through ml-1 text-destructive">
                                      ₹{type.actualPrice}
                                    </span>
                                  )}
                                </span>
                              </div>
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
                  name="membershipValidFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Valid From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={!selectedMembershipId || isFormLoading}
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="membershipValidTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Valid To</FormLabel>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled
                        >
                          {field.value
                            ? format(field.value, "dd/MM/yyyy")
                            : "Auto-calculated"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                      <FormDescription>
                        Automatically calculated based on membership type and
                        start date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isFormLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentStatusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("paymentStatus") === "completed" && (
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isFormLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethodOptions.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isFormLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading ? "Creating..." : "Create Member"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
