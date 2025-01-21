"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import TopQuestions from "@/components/TopQuestions";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Conference Q&A</h1>
        <TopQuestions />
      </main>
    </div>
  );
}
