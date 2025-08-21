import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Login or Register to Synergazing",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}