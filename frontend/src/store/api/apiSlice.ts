import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",

  prepareHeaders: (headers) => {
    if (typeof window === "undefined") return headers;
    const raw = localStorage.getItem("currentUser");
    const currentUser = raw ? (JSON.parse(raw) as { accessToken?: string }) : null;
    const token = currentUser?.accessToken ?? null;
    if (token) {
      headers.set("Authorization", token);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Auth", "User"],
  endpoints: () => ({}),
});
