"use client";

import { useLoginMutation } from "@/store/api/authApiSlice";
import { useLazyGetStudentProfileMeQuery } from "@/store/api/studentApiSlice";
import { useLazyGetTeacherProfileMeQuery } from "@/store/api/teacherApiSlice";
import { loginSuccess, setProfileId } from "@/store/features/auth/authSlice";
import type { LoginFormValues } from "@/yup/loginValidationSchema";
import { loginValidationSchema } from "@/yup/loginValidationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login] = useLoginMutation();
  const [getStudentProfileMe] = useLazyGetStudentProfileMeQuery();
  const [getTeacherProfileMe] = useLazyGetTeacherProfileMeQuery();

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

      // Admin: go to admin dashboard
      if (role === "admin") {
        router.push("/admin/dashboard");
        return;
      }

      // Teacher: profile-gated — no profile → create first; else go to teacher dashboard
      if (role === "teacher") {
        try {
          const profile = await getTeacherProfileMe().unwrap();
          const profileId = (profile as { id?: string })?.id;
          if (profileId) dispatch(setProfileId(profileId));
          router.push("/teacher/dashboard");
        } catch (e) {
          if ((e as { status?: number })?.status === 404) {
            router.push("/teacher/profile/create");
          } else {
            setErrorMessage(
              (e as { data?: { message?: string } })?.data?.message || "Something went wrong. Please try again."
            );
          }
        }
        return;
      }

      // Student: profile-gated — no profile → create first; else go to student dashboard
      if (role === "student") {
        try {
          const profile = await getStudentProfileMe().unwrap();
          const profileId = (profile as { id?: string })?.id;
          if (profileId) dispatch(setProfileId(profileId));
          router.push("/student/dashboard");
        } catch (e) {
          if ((e as { status?: number })?.status === 404) {
            router.push("/student/profile/create");
          } else {
            setErrorMessage(
              (e as { data?: { message?: string } })?.data?.message || "Something went wrong. Please try again."
            );
          }
        }
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
      {/* Left: placeholder (image or gradient) */}
      <div
        className="hidden sm:flex flex-1 bg-gradient-to-br from-[#242D3D] to-[#354053] items-center justify-center"
        aria-hidden
      >
        <div className="text-white/80 text-center px-8">
          <h2 className="text-2xl font-semibold mb-2">Course Portal</h2>
          <p className="text-sm">Sign in to manage your courses and learning.</p>
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
            If you&apos;re not an existing user{" "}
            <Link href="/auth/signup" className="text-[#242D3D] font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
