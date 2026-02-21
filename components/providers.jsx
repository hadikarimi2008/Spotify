/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}


