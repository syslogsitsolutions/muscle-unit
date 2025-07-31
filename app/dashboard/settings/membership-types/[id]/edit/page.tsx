"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUpdateMembership } from "@/hooks/use-membership-type";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    duration: z.number().min(1, "Duration is required"),
    actualPrice: z.preprocess(
      (val) => Number(val),
      z.number().min(1, "Actual price must be greater than 0")
    ),
    admissionFee: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Admission fee must be 0 or more")
    ),
    features: z.string().min(1, "Features are required"),
    isActive: z.boolean().default(true),
    offerPrice: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Offer price must be 0 or more")
    ),
  })
  .refine((data) => data.offerPrice <= data.actualPrice, {
    message: "Offer price must be less than or equal to actual price",
    path: ["offerPrice"],
  });

export default function EditMembershipPage() {
  const router = useRouter();
  const params = useParams();
  const membershipId = params.id;
  console.log("membershipId", membershipId);

  const [isLoading, setIsLoading] = useState(false);
  const editMembership = useUpdateMembership();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      actualPrice: 0,
      admissionFee: 0,
      features: "",
      isActive: true,
      offerPrice: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!membershipId) {
      toast.error("Membership ID not found.");
      return;
    }
    setIsLoading(true);
    try {
      await editMembership.mutateAsync({ id: membershipId, data: values });
      toast.success("Membership plan updated successfully!");
      router.push("/dashboard/memberships");
    } catch (error) {
      toast.error("Failed to update membership plan");
      console.error("Failed to create membership plan:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const { data: membershipData, isLoading: isFetching } = useQuery({
    queryKey: ["membership", membershipId],
    queryFn: async () => {
      const res = await axios.get(`/api/membership-type/${membershipId}`);
      return res.data;
    },
    enabled: !!membershipId, // only fetch if id exists
  });
  console.log("membershipData", membershipData);

  useEffect(() => {
    if (membershipData) {
      form.reset({
        name: membershipData.name,
        description: membershipData.description,
        duration: membershipData.duration,
        actualPrice: membershipData.actualPrice,
        offerPrice: membershipData.offerPrice,
        admissionFee: membershipData.admissionFee,
        features: membershipData.features,
        isActive: membershipData.isActive,
      });
    }
  }, [form, membershipData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Plan</h2>
          <p className="text-muted-foreground">
            Create a new membership plan for your gym
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
          <CardDescription>
            Enter the details of the new membership plan
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Monthly" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full access to all facilities with premium benefits"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days the membership is valid for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="99.99"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Price membership fee in INR
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Form Field for offer price */}
                <FormField
                  control={form.control}
                  name="offerPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="49.99"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Offer price membership fee in INR
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admissionFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="50.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        One-time admission fee in INR
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="24/7 Access, Personal Trainer, Group Classes, Spa Access"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter features separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this membership plan available for purchase
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || editMembership.isPending}
              >
                {isLoading || editMembership.isPending
                  ? "Updating..."
                  : "Update Plan"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
