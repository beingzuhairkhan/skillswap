'use client';

import { Header } from "../components/header/Header";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../contexts/AuthContext";
import { SearchProvider } from "./SearchContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SearchProvider>
        <Header />
        {children}
      </SearchProvider>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  );
}
