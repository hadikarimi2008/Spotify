/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Container from "@/components/container";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/signup";

  if (isLoginPage) {
    return <main id="main" role="main">{children}</main>;
  }

  return (
    <Container>
      <Header />
      <main id="main" role="main">
        {children}
      </main>
    </Container>
  );
}

