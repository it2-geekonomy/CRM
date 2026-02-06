"use client";

import { useLoginMutation } from "@/store/api/authApiSlice";
import { loginSuccess } from "@/store/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";
import type { LoginFormValues } from "@/yup/loginValidationSchema";
import { loginValidationSchema } from "@/yup/loginValidationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage("");
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      }).unwrap();
      dispatch(
        loginSuccess({
          currentUser: response,
          isAuthenticated: true,
        })
      );
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string } };
      const msg =
        e?.data?.message ||
        (e?.status === 401 ? "Invalid email or password." : "Something went wrong. Please try again.");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex items-center justify-center">
      <div className="w-full max-w-[1400px] px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SECTION */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white text-xl font-bold">
                G
              </div>
              <span className="text-2xl font-semibold text-gray-900">
                Geekonomy
              </span>
            </div>

            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              EMPLOYEE PORTAL
            </span>

            {/* Heading */}
            <h1 className="text-5xl font-semibold text-gray-900 leading-tight">
              Welcome to Your{" "}
              <span className="text-green-600">Workspace</span>
            </h1>

            <p className="text-lg text-gray-600 mt-6 max-w-xl">
              Access your dashboard, manage tasks, track time, and
              collaborate with your team—all in one powerful platform
              designed for productivity.
            </p>

            {/* Feature Cards */}
            <div className="mt-10 space-y-4 max-w-xl">
              {[
                {
                  title: "Unified Dashboard",
                  desc: "All your projects, tasks, and deadlines in one view",
                  icon: "📊",
                },
                {
                  title: "Time Tracking",
                  desc: "Track billable hours effortlessly with smart timers",
                  icon: "⏱️",
                },
                {
                  title: "Team Collaboration",
                  desc: "Seamless communication and project coordination",
                  icon: "👥",
                },
                {
                  title: "Performance Insights",
                  desc: "Real-time analytics and productivity reports",
                  icon: "📈",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SECTION – LOGIN CARD */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Employee Login
              </h2>
              <p className="text-gray-500 text-center mt-2">
                Sign in to access your workspace
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 flex flex-col gap-4"
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email Id"
                    {...register("email")}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Password"
                      {...register("password")}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                    <button type="button" className="text-sm text-green-600 hover:underline">
                      Forgot password?
                    </button>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-600 text-center">{errorMessage}</p>
                )}

                {/* Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-base transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in…" : "Sign In to Dashboard →"}
                </button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-4">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-green-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400">
                  OR CONTINUE WITH
                </span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* SSO Buttons */}
              <button
                type="button"
                className="w-full border border-gray-200 bg-white py-3.5 rounded-xl flex items-center justify-center gap-3 text-gray-800 font-medium transition-colors hover:bg-gray-50 hover:border-gray-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Workspace
              </button>

              <button
                type="button"
                className="w-full border border-gray-200 bg-white py-3.5 rounded-xl flex items-center justify-center gap-3 text-gray-800 font-medium mt-3 transition-colors hover:bg-green-50 hover:border-green-500"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                  <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft 365
              </button>

              {/* Help */}
              <p className="text-center text-sm text-gray-500 mt-8">
                Need help accessing your account?{" "}
                <span className="text-green-600 cursor-pointer hover:underline">
                  Contact IT Support →
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
