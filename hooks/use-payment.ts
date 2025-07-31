import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface GetPaymentsQueryParams {
  page: number;
  limit: number;
  search: string;
}

export function useGetPayments({
  page,
  limit,
  search,
}: GetPaymentsQueryParams) {
  return useQuery({
    queryKey: ["payments", page, limit, search],
    queryFn: async () => {
      const res = await axios.get("/api/payments", {
        params: { page, limit, search },
      });
      return res.data;
    },
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post("/api/payment", data);
      return response.data;
    },
  });
}
