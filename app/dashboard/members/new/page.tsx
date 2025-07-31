"use client";

// Removed useState, will use isLoading from useMutation
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
import { toast } from "sonner"; // For notifications
import { useEffect, useState } from "react";
import { useGetAllMembership } from "@/hooks/use-membership-type";
import { useCreateMember } from "@/hooks/use-member";

const paymentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  memberId: z.string().min(1, "Member ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address must be at least 5 characters."), // Added from model
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date of birth.",
  }),
  gender: z.enum(["male", "female", "other"]),
  emergencyContact: z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    relationship: z
      .string()
      .min(2, "Relationship must be at least 2 characters."),
    phone: z.string().min(10, "Phone number must be at least 10 digits."),
  }),
  membershipType: z.string().min(1, "Membership type is required."), // Will be ObjectId string
  healthInfo: z.object({
    medicalConditions: z.string().optional(),
    notes: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    bloodType: z.string().optional(),
  }),
  profileImage: z.string().optional(),
  membershipValidFrom: z.string().optional(),
  membershipValidTo: z.string().optional(),
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
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      healthInfo: {
        medicalConditions: "",
        notes: "",
        weight: "",
        height: "",
        bloodType: "",
      },
      membershipType: membershipTypes[0]?._id || "",
      profileImage: "",
      membershipValidFrom: "",
      membershipValidTo: "",
      paymentStatus: "completed",
      paymentMethod: "online",
    },
  });
  const selectedMembershipId = form.watch("membershipType");

  async function onSubmit(values: NewMemberFormData) {
    console.log("values", values);
    setIsLoading(true);
    try {
      await createMember.mutateAsync(values);
      toast.success("Member added successfully!");
      router.push("/dashboard/members");
    } catch (error) {
      toast.error(`Failed to add member`);
      console.error("Failed to add member:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchNextMemberId = async () => {
      try {
        const res = await fetch("/api/members/next-id");
        const data = await res.json();
        if (res.ok) {
          form.setValue("memberId", data.memberId);
        } else {
          toast.error(data.error || "Failed to fetch member ID");
        }
      } catch (err) {
        toast.error("Error generating member ID");
      }
    };

    fetchNextMemberId();
  }, [form]);

  useEffect(() => {
    if (!selectedMembershipId || membershipTypes.length === 0) return;

    const selectedMembership = membershipTypes.find(
      (type) => type._id === selectedMembershipId
    );

    if (!selectedMembership) return;

    const today = new Date();
    const validFrom = today.toISOString().split("T")[0]; // format: YYYY-MM-DD
    const validToDate = new Date(today);
    validToDate.setDate(today.getDate() + selectedMembership.duration);
    const validTo = validToDate.toISOString().split("T")[0];

    form.setValue("membershipValidFrom", validFrom);
    form.setValue("membershipValidTo", validTo);
  }, [selectedMembershipId, membershipTypes, form]);

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        disabled={isLoading}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
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
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 0000000000"
                          {...field}
                          maxLength={10}
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="emergencyContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Emergency Contact Relationship */}
                <FormField
                  control={form.control}
                  name="emergencyContact.relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Relationship</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Emergency Contact Phone */}
                <FormField
                  control={form.control}
                  name="emergencyContact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 0000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <br />
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>
                Enter the health information of the new member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="healthInfo.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="60 kg" {...field} />
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
                        <Input placeholder="170 cm" {...field} />
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
                        <Input placeholder="A+" {...field} />
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
                      <Input placeholder="e.g., Asthma, Allergies" {...field} />
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
                      <Input placeholder="Any additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <br />
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter the payment information for the new member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Membership Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="membershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a membership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {membershipTypes.map((type) => (
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
                {/* Membership valid from */}
                <FormField
                  control={form.control}
                  name="membershipValidFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Valid From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Membership valid to */}
                <FormField
                  control={form.control}
                  name="membershipValidTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Valid To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Payment Status */}
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                {/* Payment Method only show if payment status is completed */}
                {form.getValues().paymentStatus === "completed" && (
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                variant="outline"
                onClick={() => router.back()}
                disabled={createMember.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMember.isPending}>
                {createMember.isPending ? "Creating..." : "Create Member"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
