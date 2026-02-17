import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import StoreProvider from "./StoreProvider";
import { CurrentLayout } from "@/layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "CRM",
  description: "CRM",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <StoreProvider>
          <CurrentLayout>{children}</CurrentLayout>
          <ToastContainer position="top-right" autoClose={3000} />
        </StoreProvider>
      </body>
    </html>
  );
}
