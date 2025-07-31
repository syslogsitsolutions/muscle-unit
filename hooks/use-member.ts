import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Params {
  page: number;
  limit: number;
  search: string;
}

export function useMembers({ page, limit, search }: Params) {
  return useQuery({
    queryKey: ["members", page, limit, search],
    queryFn: async () => {
      const res = await axios.get("/api/members", {
        params: { page, limit, search },
      });
      return res.data;
    },
  });
}

export function useCreateMember() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/members", data);
      return response.data;
    },
  });
}

export function useUpdateMember() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/api/members/${id}`, data);
      return response.data;
    },
  });
}

export function useDeleteMember() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/members/${id}`);
      return response.data;
    },
  });
}

export function useGetMember(id: string) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const res = await axios.get(`/api/members/${id}`);
      return res.data;
    },
  });
}
