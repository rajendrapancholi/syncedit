import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/shared/providers/Providers";
import AuthInit from "@/features/auth/authInit";

export const metadata: Metadata = {
  title: "SyncEdit",
  description: "SyncEdit code Streamer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
