import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ui/toast";
import { WebSocketProvider } from "@/lib/socket-provider";
import { NotificationWebSocketProvider } from "@/lib/notification-socket-provider";
import { ChatBubble } from "@/components/layout/chat-bubble";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synergazing",
  description: "Find Your Team, Synergize Your Idea!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ToastProvider>
          <WebSocketProvider>
            <NotificationWebSocketProvider>
              {children}
              <ChatBubble />
              <Toaster />
            </NotificationWebSocketProvider>
          </WebSocketProvider>
        </ToastProvider>
      </body>
    </html>
  );
}