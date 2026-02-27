import { apiSlice } from "./apiSlice";

export type ClientContact = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  contactType?: string; // "Primary" | "Billing" | "Technical"
};

export type ClientApi = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: boolean;
  // Extended fields
  logo?: string;
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
  creditLimit?: string;
  billingNotes?: string;
  enablePortalAccess?: boolean;
  sendNotifications?: boolean;
  sendMonthlyReports?: boolean;
  autoSendInvoices?: boolean;
  ndaSigned?: boolean;
  clientSince?: string;
  accountManagerId?: string;
  internalNotes?: string;
  isDraft?: boolean;
  contacts?: ClientContact[];
  createdAt: string;
  updatedAt: string;
};

export type CreateClientDto = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  logo?: string;
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
  creditLimit?: string;
  billingNotes?: string;
  enablePortalAccess?: boolean;
  sendNotifications?: boolean;
  sendMonthlyReports?: boolean;
  autoSendInvoices?: boolean;
  ndaSigned?: boolean;
  clientSince?: string;
  accountManagerId?: string;
  internalNotes?: string;
  isDraft?: boolean;
  contacts?: ClientContact[];
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
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
} = clientApiSlice;
