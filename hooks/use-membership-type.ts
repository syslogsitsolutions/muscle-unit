import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCreateMembership() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/membership-type", data);
      return response.data;
    },
  });
}

export function useUpdateMembership() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/api/membership-type/${id}`, data);
      return response.data;
    },
  });
}

export function useDeleteMembership() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/membership-type/${id}`);
      return response.data;
    },
  });
}

export function useGetAllMembership() {
  return useQuery({
    queryKey: ["membership-types"],
    queryFn: async () => {
      const response = await axios.get("/api/membership-type");
      return response.data;
    },
  });
}
