import Link from "next/link";
import { Zap } from "lucide-react";

export function PageFooter() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold">Synergazing</span>
      </div>
      <p className="text-xs text-gray-500 sm:ml-4">
        © 2025 Synergazing. Platform kolaborasi untuk mahasiswa Indonesia.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4 text-gray-500"
        >
          Kebijakan Privasi
        </Link>
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4 text-gray-500"
        >
          Syarat Layanan
        </Link>
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4 text-gray-500"
        >
          Kontak
        </Link>
      </nav>
    </footer>
  );
}