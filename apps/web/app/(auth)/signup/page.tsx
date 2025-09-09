"use client"

import React from "react"
import signupImage from "../../../public/signup-image.png"
import Image from "next/image"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import { useForm } from "react-hook-form"
import { GithubIcon } from "../../../components/svgIcon/github"
import { GoogleIcon } from "../../../components/svgIcon/google"
import Link from "next/link"

interface IUserSignup {
  username: string
  email: string
  password: string
}

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserSignup>()

  const onSubmit = (data: IUserSignup) => console.log(data)

  return (
    <div className="max-w-6xl mt-20 mx-auto items-center md:p-4 p-8">
      {/* Banner */}
      <div>
        <Image
          src={signupImage}
          alt="signup image"
          className="rounded-[20px] w-full h-[250px] object-cover object-[center_38%]"
        />
      </div>

      <h1 className="text-center p-5 text-[28px] font-semibold text-gray-800">
        Welcome to <i>SKILLSWAP</i>
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 max-w-xl mx-auto bg-white rounded-2xl p-6 "
      >
        {/* Username */}
        <div>
          <Input
            type="text"
            {...register("username", { required: "Username is required" })}
            placeholder="Username"
            className="bg-gray-50 border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="Email"
            className="bg-gray-50 border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 text-gray-800"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <Input
            type="password"
            {...register("password", { required: "Password is required" })}
            placeholder="Password"
            className="bg-gray-50 border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-neutral-900 hover:bg-black text-white font-medium py-3 rounded-md transition duration-200"
        >
          Sign Up
        </Button>

        {/* Already have account */}
        <p className="text-center text-sm text-gray-600 mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center text-center my-6">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-3 text-gray-500 text-sm">or continue with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* OAuth Buttons */}
      <div className="max-w-xl mx-auto py-6 flex gap-3 flex-col sm:flex-row">
        {/* Google */}
        <Button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 py-3 rounded-md transition duration-200"
        >
          <GoogleIcon />
          Google
        </Button>

        {/* GitHub */}
        <Button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900/90 text-white hover:bg-gray-900 py-3 rounded-md transition duration-200"
        >
          <GithubIcon />
          GitHub
        </Button>
      </div>
    </div>
  )
}

export default SignUp
