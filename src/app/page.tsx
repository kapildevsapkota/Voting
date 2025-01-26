"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import QuestionForm from "@/components/QuestionForm";
import UserQuestionsSheet from "@/components/UserQuestionsSheet";
import type { Question } from "@/type/Question";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import type { User as UserType } from "@/types/User";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [votedQuestions, setVotedQuestions] = useState<number[]>([]);
  const [latestChangedQuestion, setLatestChangedQuestion] = useState<
    number | null
  >(null);
  const [user, setUser] = useState<UserType | null>(null);

  const router = useRouter();

  const currentUser = user;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          "https://cim.baliyoventures.com/api/running-session/questions/"
        );
        const data = await response.json();

        const userOwnQuestions = currentUser
          ? data.results.filter((q: Question) => q.name === currentUser.name)
          : [];

        const otherQuestions = currentUser
          ? data.results.filter((q: Question) => q.name !== currentUser.name)
          : [];

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
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();

    const pollInterval = setInterval(fetchQuestions, 3000);

    return () => clearInterval(pollInterval);
  }, [currentUser, votedQuestions]);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(
          "https://cim.baliyoventures.com/api/running-sessions/"
        );
        const data = await response.json();
        if (data.results.length > 0) {
          setSessionTitle(data.results[0].session.title);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSessionData();

    const pollInterval = setInterval(fetchSessionData, 3000);

    return () => clearInterval(pollInterval);
  }, []);

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

    if (votedQuestions.includes(id)) {
      Swal.fire({
        icon: "warning",
        title: "Already Voted",
        text: "You have already voted for this question.",
      });
      return;
    }

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
        const updatedQuestions = questions.map((q) =>
          q.id === id ? { ...q, vote_count: q.vote_count + 1 } : q
        );

        const unvotedQuestions = updatedQuestions.filter(
          (q) => !votedQuestions.includes(q.id)
        );

        const votedQuestionsData = updatedQuestions.filter((q) =>
          votedQuestions.includes(q.id)
        );

        setQuestions([...unvotedQuestions, ...votedQuestionsData]);

        const newVotedQuestions = [...votedQuestions, id];
        setVotedQuestions(newVotedQuestions);
        localStorage.setItem(
          "votedQuestions",
          JSON.stringify(newVotedQuestions)
        );

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
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              Conference Q&A
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold mt-2 text-gray-600 text-center sm:text-left">
              {sessionTitle}
            </h2>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed top-10 right-4 z-10 sm:relative sm:bottom-0"
              >
                <User className="h-4 w-4" />
                <span className="sr-only">My Questions</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[60vh]">
              <UserQuestionsSheet questions={userQuestions} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {questions.map((question, index) => {
              const isLatestChanged = question.id === latestChangedQuestion;
              const hasVoted = votedQuestions.includes(question.id);
              const isOwnQuestion =
                currentUser && question.name === currentUser.name;

              return (
                <motion.div
                  key={question.id}
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
                    ${isOwnQuestion ? "bg-green-50" : ""}
                  `}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="text-gray-800 break-words">
                        {question.question_text}
                      </p>
                      <div className="text-sm text-gray-500 mt-2">
                        Asked by {question.name}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-start">
                      <motion.span
                        key={`votes-${question.id}-${question.vote_count}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-lg font-semibold text-blue-600"
                      >
                        {question.vote_count}
                      </motion.span>
                      {!isOwnQuestion && (
                        <Button
                          onClick={() => handleVote(question.id)}
                          disabled={Boolean(hasVoted)}
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
                        </Button>
                      )}
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
