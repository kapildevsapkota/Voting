"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {  useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, user, checkAuthStatus } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuth = await checkAuthStatus();

        if (!isAuth) {
          router.push("/adminlogin");
        }
      } catch  {
        router.push("/adminlogin");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  // Show loading state or nothing while checking authentication
  if (isLoading) {
    return null; // Or you could return a loading spinner
  }

  // If not authenticated, don't render anything
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <header className="bg-white  p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold"></h1>
        <div className="flex items-center space-x-4">
          <span>{user?.email}</span>
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
