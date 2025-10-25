
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "../components/header/Header";
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "../contexts/AuthContext";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Skillswap",
  description: "Peer to Peer Learning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Header />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              // style: {
              //   background: 'var(--toast-bg)',
              //   color: 'var(--toast-color)',
              //   border: '1px solid var(--toast-border)',
              // },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
