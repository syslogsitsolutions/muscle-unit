"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CalendarIcon } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ImageUpload } from "@/components/ui/image-upload";
import { useGetAllMembership } from "@/hooks/use-membership-type";
import { cn } from "@/lib/utils";
import { addDays, format, parseISO } from "date-fns";
import { Spinner } from "@/components/ui/loading";

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
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date of birth.",
  }),
  gender: z.enum(["male", "female", "other"]),
  emergencyContact: z.object({
    phone: z.string().optional(),
  }),
  occupation: z.string().optional(),
  membershipType: z.string().min(1, "Membership type is required."),
  healthInfo: z.object({
    medicalConditions: z.string().optional(),
    notes: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    bloodType: z.string().optional(),
  }),
  profileImage: z.string().optional(),
  // Changed to Date objects for better handling
  membershipValidFrom: z.date().optional(),
  membershipValidTo: z.date().optional(),
  paymentStatus: z.enum(["pending", "completed"]).optional(),
  paymentMethod: z
    .enum(["cash", "online", "other"])
    .default("online")
    .optional(),
});

type EditMemberFormData = z.infer<typeof formSchema>;

interface MemberData {
  _id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  occupation?: string;
  emergencyContact: {
    phone: string;
  };
  healthInfo: {
    medicalConditions?: string;
    notes?: string;
    weight?: string;
    height?: string;
    bloodType?: string;
  };
  profileImage?: string;
  paymentStatus: "pending" | "completed";
  paymentMethod: "cash" | "online" | "other";
  membershipId: {
    _id: string;
    startDate: string;
    endDate: string;
    membershipType: {
      _id: string;
      name: string;
      duration: number;
      actualPrice: number;
      offerPrice: number;
    };
  };
}

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingMember, setFetchingMember] = useState(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [originalMembershipType, setOriginalMembershipType] =
    useState<string>("");

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
        phone: "",
      },
      occupation: "",
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
      paymentStatus: "pending",
      paymentMethod: "online",
    },
  });

  const selectedMembershipId = form.watch("membershipType");
  const selectedMembershipValidFrom = form.watch("membershipValidFrom");
  const paymentStatus = form.watch("paymentStatus");

  // Fetch member data
  useEffect(() => {
    async function fetchMemberData() {
      if (!id) return;

      try {
        setFetchingMember(true);
        const res = await fetch(`/api/members/${id}`);
        const data = await res.json();

        if (res.ok) {
          const memberData: MemberData = data;

          // Store original membership type for comparison
          setOriginalMembershipType(memberData.membershipId.membershipType._id);

          // Format data for form with proper Date objects
          const formattedData = {
            memberId: memberData.memberId,
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone,
            address: memberData.address,
            gender: memberData.gender,
            emergencyContact: {
              phone: memberData.emergencyContact.phone || "",
            },
            healthInfo: {
              medicalConditions: memberData.healthInfo.medicalConditions || "",
              notes: memberData.healthInfo.notes || "",
              weight: memberData.healthInfo.weight || "",
              height: memberData.healthInfo.height || "",
              bloodType: memberData.healthInfo.bloodType || "",
            },
            paymentStatus: memberData.paymentStatus,
            paymentMethod: memberData.paymentMethod,
            profileImage: memberData.profileImage || "",
            dateOfBirth: memberData.dateOfBirth
              ? new Date(memberData.dateOfBirth).toISOString().split("T")[0]
              : "",
            // Convert to Date objects
            membershipValidFrom: memberData.membershipId.startDate
              ? new Date(memberData.membershipId.startDate)
              : undefined,
            membershipValidTo: memberData.membershipId.endDate
              ? new Date(memberData.membershipId.endDate)
              : undefined,
            membershipType: memberData.membershipId.membershipType._id,
          };

          form.reset(formattedData);
          setMember(memberData);
        } else {
          toast.error(data.error || "Failed to fetch member data");
          router.push("/dashboard/members");
        }
      } catch (err) {
        console.error("Error fetching member data:", err);
        toast.error("Error fetching member data");
        router.push("/dashboard/members");
      } finally {
        setFetchingMember(false);
      }
    }

    fetchMemberData();
  }, [id, form, router]);

  // Calculate membership dates when membership type changes (only if different from original)
  useEffect(() => {
    if (!selectedMembershipId || membershipTypes.length === 0 || !member)
      return;

    // Only recalculate if membership type has changed
    if (selectedMembershipId === originalMembershipType) return;

    const selectedMembership = membershipTypes.find(
      (type: any) => type._id === selectedMembershipId
    );

    if (!selectedMembership) return;

    // When membership type changes, set new dates from today
    const today = new Date();
    const validToDate = addDays(today, selectedMembership.duration);

    form.setValue("membershipValidFrom", today);
    form.setValue("membershipValidTo", validToDate);
  }, [
    selectedMembershipId,
    membershipTypes,
    member,
    originalMembershipType,
    form,
  ]);

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

  async function onSubmit(values: EditMemberFormData) {
    setIsLoading(true);
    try {
      // Convert dates to ISO strings for API submission
      const submitData = {
        ...values,
        membershipValidFrom: values.membershipValidFrom?.toISOString(),
        membershipValidTo: values.membershipValidTo?.toISOString(),
      };

      const res = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        toast.success("Member updated successfully!");
        router.push("/dashboard/members");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update member");
      }
    } catch (error) {
      console.error("Failed to update member:", error);
      toast.error("Error updating member");
    } finally {
      setIsLoading(false);
    }
  }

  const isFormLoading = isLoading || fetchingMember || isMembershipLoading;
  const isMembershipChanged = selectedMembershipId !== originalMembershipType;

  if (fetchingMember || isMembershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-destructive">Member not found</div>
      </div>
    );
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Member Information Card */}
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
                        <Input
                          placeholder="John Smith"
                          {...field}
                          disabled={isLoading}
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
                        value={field.value}
                        disabled={isLoading}
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
                        <Input type="date" {...field} disabled={isLoading} />
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Occupation */}
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
                          disabled={isLoading}
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
                        <Input
                          placeholder="60 kg"
                          {...field}
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        value={field.value}
                        disabled={isLoading}
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
                              disabled={isLoading}
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
                      {/* {isMembershipChanged ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={isLoading}
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
                      ) : (
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            disabled
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "No date selected"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      )}
                      {!isMembershipChanged && (
                        <FormDescription>
                          Current membership dates are preserved
                        </FormDescription>
                      )} */}
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
                        {isMembershipChanged
                          ? "Automatically calculated based on membership type and start date"
                          : "Current membership end date"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Show payment fields only if membership type has changed */}
              {isMembershipChanged && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentStatusOptions.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {paymentStatus === "completed" && (
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoading}
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
              )}

              {isMembershipChanged && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> You have changed the membership type.
                    This will create a new membership period starting from the
                    selected date. Please ensure payment details are updated
                    accordingly.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button
                type="button"
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
