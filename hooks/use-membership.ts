import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface GetMembershipsQueryParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useGetMemberships({
  page,
  limit,
  search,
  status,
  sortBy = "delayedDays",
  sortOrder = "asc",
}: GetMembershipsQueryParams) {
  return useQuery({
    queryKey: ["memberships", page, limit, search, status, sortBy, sortOrder],
    queryFn: async () => {
      const res = await axios.get("/api/memberships", {
        params: { page, limit, search, status, sortBy, sortOrder },
      });
      return res.data;
    },
  });
}

export function useCreateMembershipPayment() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log("id", id);

      const response = await axios.post(`/api/memberships/${id}/payment`, data);
      console.log("response", response);

      return response.data;
    },
  });
}

export function useGetMembershipStats() {
  return useQuery({
    queryKey: ["membership-stats"],
    queryFn: async () => {
      const res = await axios.get("/api/memberships/reports");
      return res.data;
    },
  });
}

export function useResetMembership() {
  return useMutation({
    mutationFn: async ({ 
      id, 
      action, 
      notes 
    }: { 
      id: string; 
      action: "cancel" | "suspend" | "restart"; 
      notes?: string;
    }) => {
      const response = await axios.post(`/api/memberships/${id}/reset`, {
        action,
        notes,
      });
      return response.data;
    },
  });
}
