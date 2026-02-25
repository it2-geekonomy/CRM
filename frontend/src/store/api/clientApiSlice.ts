import { apiSlice } from "./apiSlice";

export type ClientApi = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClientsResponse = ClientApi[];
type ClientsApiResponse = ClientApi[] | { data?: ClientApi[] };

export const clientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<ClientsResponse, void>({
      query: () => ({ url: "/clients" }),
      transformResponse: (response: ClientsApiResponse): ClientsResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Project", id: "CLIENTS" }],
    }),
  }),
});

export const { useGetClientsQuery } = clientApiSlice;
