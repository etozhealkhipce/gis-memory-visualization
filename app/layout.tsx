import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ghost Memory Lab | ASI06: Memory & Context Poisoning",
  description: "Interactive demonstration of memory poisoning in LLM agents - Ghost in the Shell inspired cyberbrain interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
