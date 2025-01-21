"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Header from "@/components/Header";
import QuestionForm from "@/components/QuestionForm";
import UserQuestionsSheet from "@/components/UserQuestionsSheet";
import type { Question } from "@/type/Question";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import type { User as UserType } from "@/types/User";
import useSWR from "swr";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [votedQuestions, setVotedQuestions] = useState<number[]>([]);
  const [latestChangedQuestion, setLatestChangedQuestion] = useState<
    number | null
  >(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const router = useRouter();

  // Add this line to reference the user
  const currentUser = user;

  // Fetch questions using SWR
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data } = useSWR(
    "https://cim.baliyoventures.com/api/running-session/questions/",
    fetcher,
    {
      refreshInterval: 2000,
    }
  );

  useEffect(() => {
    if (data) {
      setSessionTitle(data.session_title || "Current Session");
      const userOwnQuestions = currentUser
        ? data.results.filter((q: Question) => q.name === currentUser.name)
        : []; // Handle case when currentUser is null

      const otherQuestions = currentUser
        ? data.results.filter((q: Question) => q.name !== currentUser.name)
        : []; // Handle case when currentUser is null

      // Filter out voted questions
      const unvotedQuestions = otherQuestions.filter(
        (q: Question) => !votedQuestions.includes(q.id)
      );
      const sortedQuestions = [
        ...unvotedQuestions,
        ...otherQuestions.filter((q: Question) =>
          votedQuestions.includes(q.id)
        ),
      ];

      setQuestions(sortedQuestions);
      setUserQuestions(userOwnQuestions);
    }
  }, [data, currentUser, votedQuestions]);

  // Load voted questions from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const storedVotedQuestions = JSON.parse(
      localStorage.getItem("votedQuestions") || "[]"
    );
    setVotedQuestions(storedVotedQuestions);
  }, [router]);

  const handleAddQuestion = async (newQuestion: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    try {
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
        setQuestions((prevQuestions) => [addedQuestion, ...prevQuestions]);
        Swal.fire({
          icon: "success",
          title: "Question Added",
          text: "Your question has been added successfully!",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: errorData.error || "Failed to add question",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error adding question",
        footer: `${error}`,
      });
    }
  };

  const handleVote = async (id: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Check if user has already voted
    if (votedQuestions.includes(id)) {
      Swal.fire({
        icon: "warning",
        title: "Already Voted",
        text: "You have already voted for this question.",
      });
      return;
    }

    // Check if user is voting for their own question
    const questionToVote = questions.find((q) => q.id === id);
    if (questionToVote && questionToVote.name === user.name) {
      Swal.fire({
        icon: "error",
        title: "Cannot Vote",
        text: "You cannot vote for your own question.",
      });
      return;
    }

    try {
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

      const responseData = await response.json();

      if (response.ok) {
        // Update questions with new vote count
        const updatedQuestions = questions.map((q) =>
          q.id === id ? { ...q, vote_count: q.vote_count + 1 } : q
        );

        // Separate voted and unvoted questions
        const unvotedQuestions = updatedQuestions.filter(
          (q) => !votedQuestions.includes(q.id)
        );

        const votedQuestionsData = updatedQuestions.filter((q) =>
          votedQuestions.includes(q.id)
        );

        // Combine questions: unvoted first, then voted
        setQuestions([...unvotedQuestions, ...votedQuestionsData]);

        // Update voted questions
        const newVotedQuestions = [...votedQuestions, id];
        setVotedQuestions(newVotedQuestions);
        localStorage.setItem(
          "votedQuestions",
          JSON.stringify(newVotedQuestions)
        );

        // Set latest changed question for animation
        setLatestChangedQuestion(id);
        setTimeout(() => setLatestChangedQuestion(null), 5000);

        Swal.fire({
          icon: "success",
          title: "Voted!",
          text: "Your vote has been recorded.",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: responseData.error || "Failed to vote",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error voting",
        footer: `${error}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Conference Q&A</h1>
          <h2 className="text-xl font-semibold mt-2 text-gray-600">
            {sessionTitle}
          </h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
                <span className="sr-only">My Questions</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <UserQuestionsSheet
                questions={userQuestions}
                onVote={handleVote}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {questions.map((question, index) => {
              const isLatestChanged = question.id === latestChangedQuestion;
              const hasVoted = votedQuestions.includes(question.id);

              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isLatestChanged ? [1, 1.02, 1] : 1,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    layout: { duration: 0.3 },
                  }}
                  className={`
                    bg-white rounded-lg shadow-md p-4 
                    ${
                      isLatestChanged
                        ? "border-2 border-blue-500 animate-pulse"
                        : ""
                    }
                    ${hasVoted ? "bg-blue-50" : ""}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow mr-4">
                      <p className="text-gray-800">{question.question_text}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        Asked by {question.name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.span
                        key={`votes-${question.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-lg font-semibold text-blue-600"
                      >
                        {question.vote_count}
                      </motion.span>
                      <button
                        onClick={() => handleVote(question.id)}
                        disabled={hasVoted}
                        className={`
                          flex items-center space-x-1 px-2 py-1 rounded
                          ${
                            hasVoted
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }
                        `}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Vote</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
      <QuestionForm onAddQuestion={handleAddQuestion} />
    </div>
  );
}
