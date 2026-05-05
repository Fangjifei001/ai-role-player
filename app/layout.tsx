import type { Metadata } from "next";
import "antd/dist/reset.css";
import AntdThemeProvider from "./antd-theme-provider";
import "./globals.css";
import RuntimeBootstrap from "./runtime-bootstrap";

export const metadata: Metadata = {
  title: "AI Role Player - Voice-Based Customer Sales Skills",
  description:
    "Voice-first sales role-play training with scenario/persona configuration and coaching feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AntdThemeProvider>
          <RuntimeBootstrap />
          {children}
        </AntdThemeProvider>
      </body>
    </html>
  );
}
