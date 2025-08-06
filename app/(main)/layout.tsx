import Navbar from "@/components/layout/navbar";
import { ChatBubble } from "@/components/layout/chat-bubble"; // 1. Impor komponen

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Gunakan div sebagai pembungkus utama jika perlu styling
    <div className="relative"> 
      <Navbar />
      <main>{children}</main>
      <ChatBubble /> {/* 2. Letakkan komponen di sini */}
    </div>
  );
}
