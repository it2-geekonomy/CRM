import { apiSlice } from "./apiSlice";

export type Role = { id: string; name: string; createdAt: string; updatedAt: string };

export type LoginCredentials = { email: string; password: string };

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

/** Sign up uses POST /users. Backend: CreateUserDto { email, password, roleId? } */
export type SignupCredentials = { email: string; password: string; roleId?: string };

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<unknown, SignupCredentials>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
    }),
    getRoles: builder.query<Role[], void>({
      query: () => ({ url: "/roles" }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetRolesQuery } = authApiSlice;
