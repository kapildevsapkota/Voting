"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopQuestions from "@/components/TopQuestions";
import Image from "next/image";

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
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Conference Q&A</h1>
        <div className="flex gap-6">
          <div className="w-2/3">
            <TopQuestions />
          </div>
          <div className="w-1/3 sticky top-0 h-96 ">
            <div className="bg-white p-6 rounded-lg  shadow-md h-full">
              <Image
                src="/qr.png"
                alt="QR Code"
                width={300}
                height={300}
                className="w-full h-auto"
              />
              <p className="text-center font-bold text-4xl mt-4 ">
                Scan QR code to ask questions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
