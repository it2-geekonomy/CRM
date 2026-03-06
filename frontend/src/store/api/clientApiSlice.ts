import { apiSlice } from "./apiSlice";

export type ClientContact = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string; // Job title (e.g., "CEO")
  role?: string; // Contact role (e.g., "Primary", "Billing", "Technical")
  // Note: Backend uses "role" for contact type, "title" for job title
};

export type ClientApi = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: boolean;
  // Extended fields
  logo?: string;
  logoUrl?: string; // Backend may return logoUrl instead of logo
  clientCode?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  taxId?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  currency?: string;
  paymentMethod?: string;
  creditLimit?: number; // Backend returns number
  billingNotes?: string;
  clientSince?: string;
  salesManagerId?: string; // Backend uses salesManagerId
  salesManager?: {
    id: string;
    name: string;
    designation?: string;
  }; // Backend may return populated salesManager relation
  internalNotes?: string;
  contacts?: Array<{
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    role?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CreateClientDto = {
  name: string;
  email: string; // Required by backend
  phone?: string;
  logo?: string; // Base64 string or file
  clientCode?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  taxId?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  currency?: string;
  paymentMethod?: string;
  creditLimit?: number; // Backend expects number, not string
  billingNotes?: string;
  clientSince?: string;
  salesManagerId?: string; // Backend expects salesManagerId, not accountManagerId
  internalNotes?: string;
  status?: boolean; // Backend uses status instead of isDraft
  contacts?: Array<{
    name?: string;
    title?: string; // Job title
    email?: string; // Must be valid email if provided
    phone?: string;
    role?: string; // Contact type: "Primary", "Billing", "Technical"
  }>;
};

export type UpdateClientDto = Partial<CreateClientDto>;

export type ClientsResponse = ClientApi[];
type ClientsApiResponse = ClientApi[] | { data?: ClientApi[] };
type ClientApiResponse = ClientApi | { data?: ClientApi };

export const clientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<ClientsResponse, void>({
      query: () => ({ url: "/clients" }),
      transformResponse: (response: ClientsApiResponse): ClientsResponse =>
        Array.isArray(response) ? response : response?.data ?? [],
      providesTags: [{ type: "Project", id: "CLIENTS" }],
    }),
    getClient: builder.query<ClientApi, string>({
      query: (id) => ({ url: `/clients/${id}` }),
      transformResponse: (response: ClientApiResponse): ClientApi =>
        (response as any)?.data ?? response,
      providesTags: (result, error, id) => [{ type: "Project", id: `CLIENT-${id}` }],
    }),
    createClient: builder.mutation<ClientApi, CreateClientDto>({
      query: (body) => ({
        url: "/clients",
        method: "POST",
        body,
      }),
      transformResponse: (response: ClientApiResponse): ClientApi =>
        (response as any)?.data ?? response,
      invalidatesTags: [{ type: "Project", id: "CLIENTS" }],
    }),
    updateClient: builder.mutation<ClientApi, { id: string; data: UpdateClientDto }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ClientApiResponse): ClientApi =>
        (response as any)?.data ?? response,
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id: "CLIENTS" },
        { type: "Project", id: `CLIENT-${id}` },
      ],
    }),
    deleteClient: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Project", id: "CLIENTS" },
        { type: "Project", id: `CLIENT-${id}` },
      ],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApiSlice;
