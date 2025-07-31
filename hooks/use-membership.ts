import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface GetMembershipsQueryParams {
  page: number;
  limit: number;
  search: string;
  status: string;
}

export function useGetMemberships({
  page,
  limit,
  search,
  status,
}: GetMembershipsQueryParams) {
  return useQuery({
    queryKey: ["memberships", page, limit, search, status],
    queryFn: async () => {
      const res = await axios.get("/api/memberships", {
        params: { page, limit, search, status },
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
