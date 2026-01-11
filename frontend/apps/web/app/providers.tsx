"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../contexts/AuthContext";
import { Header } from "../components/header/Header";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Header />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{ duration: 4000 }}
      />
    </AuthProvider>
  );
}
