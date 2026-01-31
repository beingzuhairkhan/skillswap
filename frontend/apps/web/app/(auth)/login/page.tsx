"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import signupImage from "../../../public/signup-image.png"
import { useForm } from "react-hook-form"
import { GithubIcon } from "../../../components/svgIcon/github"
import { GoogleIcon } from "../../../components/svgIcon/google"
import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast"
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios"

interface IUserLogin {
  email: string
  password: string
}

const LoginPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserLogin>()
  const { login } = useAuth()
  const router = useRouter();
  const onSubmit = async (data: IUserLogin) => {
    try {
      setIsLoading(true);
      const response = await login(data.email, data.password);
      if (response) {
        toast.success("User Login Successfully");
        router.push("/"); // Redirect after login
      } else {
        toast.error(response || "Login failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to login');
      } else {
        toast.error('Failed to login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mt-20 mx-auto md:p-4 p-8">
      {/* Banner */}
      <div>
        <Image
          src={signupImage}
          alt="Login banner"
          className="rounded-[20px] w-full h-[250px] object-cover object-[center_38%]"
        />
      </div>

      <h1 className="text-center py-6 text-[28px] font-semibold text-gray-800">
        Welcome back to <i>SKILLSWAP</i>
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-sm"
      >
        {/* Email */}
        <div>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="Enter your email"
            className={`w-full bg-gray-50 border rounded-md p-3 text-gray-800 
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500
            border-gray-300
            ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            id="password"
            type="password"
            {...register("password", { required: "Password is required" })}
            placeholder="Enter your password"
            className={`w-full bg-gray-50 border rounded-md p-3 text-gray-800
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500
      border-gray-300
      ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
          <div className="text-right mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl">
            <ReCAPTCHA
              sitekey="6Lc-3fcrAAAAAKOctjYBuJVd5ERuLKsyi_DChQuV"
              onChange={(value: any) => setToken(value)}
              theme="light"
            />
          </div>
        </div>


        {/* Submit 6Lc-3fcrAAAAAMbmVm1KRSpQwdzg9X2ZUM8Gp_uP */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-neutral-900 text-white font-medium py-3 rounded-md transition duration-200
    ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-black"}
  `}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-600 mt-3">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center my-6">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-3 text-gray-500 text-sm">or continue with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* OAuth Buttons */}
      <div className="max-w-xl mx-auto flex gap-3 flex-col sm:flex-row">
        {/* Google */}
        <button
          type="button"
          onClick={() =>
            (window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`)
          }
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 py-3 rounded-md transition duration-200"
        >
          <GoogleIcon />
          Google
        </button>

        {/* GitHub */}
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900/90 text-white hover:bg-gray-900 py-3 rounded-md transition duration-200"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github`;
          }}
        >
          <GithubIcon />
          GitHub
        </button>

      </div>
    </div>
  )
}

export default LoginPage
