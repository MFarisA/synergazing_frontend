import Navbar from "@/components/layout/navbar";


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

    </div>
  );
}
