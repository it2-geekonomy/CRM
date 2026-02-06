"use client";

import { useLoginMutation } from "@/store/api/authApiSlice";
import { loginSuccess } from "@/store/features/auth/authSlice";
import type { LoginFormValues } from "@/yup/loginValidationSchema";
import { loginValidationSchema } from "@/yup/loginValidationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await login({ email: data.email, password: data.password }).unwrap();
      dispatch(loginSuccess({ currentUser: response, isAuthenticated: true }));
      const role = response.user?.role;

      // Admin or Employee: go to admin dashboard (employee dashboard can be added later)
      if (role === "admin" || role === "employee") {
        router.push("/admin/dashboard");
        return;
      }

      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4.5rem)]">
      {/* Left: branding */}
      <div
        className="hidden sm:flex flex-1 bg-gradient-to-br from-[#242D3D] to-[#354053] items-center justify-center"
        aria-hidden
      >
        <div className="text-white/80 text-center px-8">
          <h2 className="text-2xl font-semibold mb-2">CRM</h2>
          <p className="text-sm">Sign in to manage departments and employees.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white px-5 md:px-10 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Log In</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242D3D] focus:border-[#242D3D] outline-none"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242D3D] focus:border-[#242D3D] outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-[#242D3D] text-white font-medium hover:bg-[#1a222c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Employees are added by your admin. Contact them for access.
          </p>
        </form>
      </div>
    </div>
  );
}
