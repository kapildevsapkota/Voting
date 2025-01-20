"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import { Question } from "@/type/Question";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);
  const handleAddQuestion = async (newQuestion: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const response = await fetch(
      "https://cim.baliyoventures.com/api/questions/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_text: newQuestion,
          vote_count: 0,
          name: user.name,
          phone_number: user.phone_number,
        }),
      }
    );
    if (response.ok) {
      const addedQuestion = await response.json();
      setQuestions([...questions, addedQuestion]);
      alert("Your question has been added!");
    } else {
      console.error("Failed to add question");
    }
  };

  const handleVote = async (id: number) => {
    const votedQuestions = JSON.parse(
      localStorage.getItem("votedQuestions") || "[]"
    );
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (votedQuestions.includes(id)) {
      alert("You have already voted for this question.");
      return;
    }

    const questionToVote = questions.find((q) => q.id === id);
    if (questionToVote && questionToVote.name === user.name) {
      alert("You cannot vote for your own question.");
      return;
    }

    const response = await fetch(
      `https://cim.baliyoventures.com/api/questions/${id}/vote/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          phone_number: user.phone_number,
        }),
      }
    );

    console.log("Vote Response Status:", response.status);
    const responseBody = await response.json();
    console.log("Vote Response Body:", responseBody);

    if (response.ok) {
      setQuestions(
        questions.map((q) =>
          q.id === id ? { ...q, vote_count: q.vote_count + 1 } : q
        )
      );

      votedQuestions.push(id);
      localStorage.setItem("votedQuestions", JSON.stringify(votedQuestions));
    } else {
      console.error("Failed to vote", responseBody);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Conference Q&A</h1>
        <QuestionForm onAddQuestion={handleAddQuestion} />
        <QuestionList onVote={handleVote} />
      </main>
    </div>
  );
}
