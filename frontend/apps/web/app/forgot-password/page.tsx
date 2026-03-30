'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { userDataAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const steps = ["Enter email", "Verify OTP", "Reset Password"]

  const handleSendOtp = async () => {
    if (!email) return alert('Please enter your email');
    setLoading(true);
    try {
      await userDataAPI.forgotPasswordEmail(email);
      setStep(2);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp) return alert('Please enter the OTP');
    // Add actual OTP verification here via API if available
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return alert('Please fill both password fields')
    if (newPassword !== confirmPassword) return alert('Passwords do not match')

    setLoading(true)
    try {
      await userDataAPI.confirmPassword({
        emailId: email,
        otp,
        password: newPassword,
        confirmPassword,
    })
      toast.success('Password reset successfully!')
      // Reset all fields
      setStep(1)
      setEmail('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      alert(error?.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="p-6 mt-20 max-w-xl mx-auto text-center">
      <h1 className="text-[32px] font-semibold text-gray-800 mb-8">Forgot Password</h1>
      
      <div className="flex items-center justify-between mb-10">
        {steps.map((label, index) => {
          const currentStep = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step > currentStep;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                  ${isCompleted ? "bg-green-500 text-white border-green-500" :
                    isActive ? "bg-black text-white border-gray-500" :
                    "bg-gray-200 text-gray-600 border-gray-300"}
                `}
              >
                {isCompleted ? "✓" : currentStep}
              </div>
              <p className={`mt-2 text-sm ${isActive ? "font-medium text-black" : "text-gray-500"}`}>
                {label}
              </p>
            </div>
          )
        })}
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        {step === 1 && (
          <div>
            <p className="mb-4 text-gray-600">Enter your registered email address.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-black hover:bg-gray-700 text-white py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Redirect to{" "}
              <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 text-gray-600">Enter the OTP sent to your email.</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-black hover:bg-gray-700 text-white py-2 rounded-md"
            >
              Verify OTP
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-4 text-gray-600">Set your new password.</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleResetPassword}
              className="w-full bg-black hover:bg-gray-700 text-white py-2 rounded-md"
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword;