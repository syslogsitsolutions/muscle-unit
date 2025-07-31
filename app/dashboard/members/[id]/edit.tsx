"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useGetAllMembership } from "@/hooks/use-membership-type";

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
  address: z.string().min(5, "Address must be at least 5 characters."),
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
  membershipType: z.string().min(1, "Membership type is required."),
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

type EditMemberFormData = z.infer<typeof formSchema>;

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingMember, setFetchingMember] = useState(true);

  const { data: membershipTypes = [], isLoading: isMembershipLoading } =
    useGetAllMembership();

  const form = useForm<EditMemberFormData>({
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
      membershipType: "",
      profileImage: "",
      membershipValidFrom: "",
      membershipValidTo: "",
      paymentStatus: "completed",
      paymentMethod: "online",
    },
  });

  const selectedMembershipId = form.watch("membershipType");

  useEffect(() => {
    async function fetchMemberData() {
      try {
        setFetchingMember(true);
        const res = await fetch(`/api/members/${id}`);
        const data = await res.json();
        if (res.ok) {
          // Format date fields
          const formattedData = {
            ...data,
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split("T")[0]
              : "",
            membershipValidFrom: data.membershipValidFrom
              ? new Date(data.membershipValidFrom).toISOString().split("T")[0]
              : "",
            membershipValidTo: data.membershipValidTo
              ? new Date(data.membershipValidTo).toISOString().split("T")[0]
              : "",
          };
          form.reset(formattedData);
        } else {
          toast.error(data.error || "Failed to fetch member data");
          router.push("/dashboard/members");
        }
      } catch (err) {
        toast.error("Error fetching member data");
        router.push("/dashboard/members");
      } finally {
        setFetchingMember(false);
      }
    }

    if (id) {
      fetchMemberData();
    }
  }, [id, form, router]);

  useEffect(() => {
    if (!selectedMembershipId || membershipTypes.length === 0) return;

    const selectedMembership = membershipTypes.find(
      (type: any) => type._id === selectedMembershipId
    );

    if (!selectedMembership) return;

    const today = new Date();
    const validFrom = today.toISOString().split("T")[0];
    const validToDate = new Date(today);
    validToDate.setDate(today.getDate() + selectedMembership.duration);
    const validTo = validToDate.toISOString().split("T")[0];

    form.setValue("membershipValidFrom", validFrom);
    form.setValue("membershipValidTo", validTo);
  }, [selectedMembershipId, membershipTypes, form]);

  async function onSubmit(values: EditMemberFormData) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success("Member updated successfully!");
        router.push("/dashboard/members");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update member");
      }
    } catch (error) {
      toast.error("Error updating member");
      console.error("Failed to update member:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (fetchingMember || isMembershipLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Member</h2>
          <p className="text-muted-foreground">
            Update member details for your gym
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
              <CardDescription>
                Update the details of the member
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
                Update the health information of the member
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
                Update the payment information for the member
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
                        defaultValue={field.value}
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
                      <FormControl>
                        <Input type="date" {...field} readOnly />
                      </FormControl>
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
                        <Input type="date" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Member"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
