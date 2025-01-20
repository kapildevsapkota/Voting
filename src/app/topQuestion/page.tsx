"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

import TopQuestions from "@/components/TopQuestions";
import { Question } from "@/type/Question";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();

  // Example function to update questions
  const fetchQuestions = async () => {
    const response = await fetch("/api/questions"); // Replace with your API endpoint
    const data = await response.json();
    setQuestions(data); // Update questions with fetched data
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
    fetchQuestions(); // Call the function to fetch questions on component mount
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Conference Q&A</h1>
        <TopQuestions questions={questions} />
      </main>
    </div>
  );
}
