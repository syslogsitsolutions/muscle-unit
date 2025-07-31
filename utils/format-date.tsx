import { format } from "date-fns";

export const formatDate = (dateString?: string, formatString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return format(date, formatString || "dd-MMM-yyyy");
};

export const formatDateTime = (dateString?: string, formatString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return format(date, formatString || "dd-MM-yyyy HH:mm:ss");
};
