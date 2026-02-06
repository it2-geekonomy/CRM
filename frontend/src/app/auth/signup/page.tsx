"use client";

import { useGetRolesQuery, useSignupMutation } from "@/store/api/authApiSlice";
import type { SignupFormValues } from "@/yup/signupValidationSchema";
import { signupValidationSchema } from "@/yup/signupValidationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [signup] = useSignupMutation();
  const { data: allRoles = [], isLoading: rolesLoading, error: rolesError } = useGetRolesQuery();
  const signupRoles = [
    { name: "student", label: "Student" },
    { name: "teacher", label: "Teacher" },
  ] as const;
  const roleOptions = signupRoles.map(({ name, label }) => {
    const role = allRoles.find((r) => r.name === name);
    return { name, id: role?.id ?? "", label, ready: !!role };
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupValidationSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    if (!data.roleId) {
      setErrorMessage("Please select a role");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      await signup({
        email: data.email,
        password: data.password,
        roleId: data.roleId,
      }).unwrap();
      router.push("/auth/login");
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string } };
      const msg =
        e?.data?.message ||
        (e?.status === 401 ? "Authorization token missing." : "Something went wrong. Please try again.");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4.5rem)]">
      <div
        className="hidden sm:flex flex-1 bg-gradient-to-br from-[#242D3D] to-[#354053] items-center justify-center"
        aria-hidden
      >
        <div className="text-white/80 text-center px-8">
          <h2 className="text-2xl font-semibold mb-2">Course Portal</h2>
          <p className="text-sm">Create an account to get started.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center bg-white px-5 md:px-10 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Sign Up</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="roleId"
              {...register("roleId")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242D3D] focus:border-[#242D3D] outline-none bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={rolesLoading}
            >
              <option value="">Select a role</option>
              {roleOptions.map((opt) => (
                <option key={opt.name} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
            )}
            {rolesError && !rolesLoading && (
              <p className="mt-1 text-sm text-amber-600">
                Unable to load roles. Please refresh the page or try again later.
              </p>
            )}
          </div>

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
              autoComplete="new-password"
              {...register("password")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242D3D] focus:border-[#242D3D] outline-none"
              placeholder="At least 6 characters"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#242D3D] focus:border-[#242D3D] outline-none"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
            {loading ? "Creating account…" : "Sign Up"}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#242D3D] font-medium hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
