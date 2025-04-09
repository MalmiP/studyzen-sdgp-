"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";

export default function ClientSidebar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Hide sidebar on login (and signup if needed) pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  if (!isAuthenticated) return null;
  return <Sidebar />;
}