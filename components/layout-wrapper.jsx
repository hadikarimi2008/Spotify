"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Container from "@/components/container";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/signup";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <Container>
      <Header />
      {children}
    </Container>
  );
}

