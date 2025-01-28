"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { ThumbsUp, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  name: string;
  phone_number: string;
  question_text: string;
  vote_count: number;
  timestamp?: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();

  // Sort the results array
  return {
    ...data,
    results: data.results.sort(
      (a: Question, b: Question) => b.vote_count - a.vote_count
    ),
  };
};

export default function TopQuestions() {
  
  const [previousQuestions, setPreviousQuestions] = useState<Question[]>([]);
  const [latestChangedQuestion, setLatestChangedQuestion] = useState<
    number | null
  >(null);

  // Use SWR with a 3-second refresh interval
  const { data, error } = useSWR<{ results: Question[] }>(
    "https://cim.baliyoventures.com/api/top-questions/",
    fetcher,
    {
      refreshInterval: 3000, // 3 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Track vote changes
  useEffect(() => {
    if (!data?.results || !previousQuestions.length) return;

    // Find the question with the most recent vote change
    const changedQuestion = data.results.find((newQ) => {
      const oldQ = previousQuestions.find((q) => q.id === newQ.id);
      return oldQ && oldQ.vote_count !== newQ.vote_count;
    });

    if (changedQuestion) {
      setLatestChangedQuestion(changedQuestion.id);

      // Reset the latest changed question after 5 seconds
      const timer = setTimeout(() => {
        setLatestChangedQuestion(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [data?.results, previousQuestions]);

  // Update previous questions separately
  useEffect(() => {
    if (data?.results) {
      setPreviousQuestions(data.results);
    }
  }, [data?.results]);

  if (error) return <div>Error loading top questions.</div>;
  if (!data) return <div>Loading top questions...</div>;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl shadow-lg mb-12">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center">
        <Award className="mr-2" /> Top Questions
      </h2>
      <div className="space-y-4">
        <AnimatePresence>
          {data.results.map((question, index) => {
            const isLatestChanged = question.id === latestChangedQuestion;

            return (
              <motion.div
                key={question.id}
                layout // Enable layout animations
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isLatestChanged ? [1, 1.02, 1] : 1, // Pulse effect
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  layout: { duration: 0.3 }, // Smooth layout transitions
                }}
                className={`relative ${isLatestChanged ? "z-10" : "z-0"}`}
              >
                {isLatestChanged && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Sparkles className="text-yellow-300 animate-pulse" />
                  </motion.div>
                )}
                <Card
                  className={`
                    bg-white bg-opacity-90 backdrop-blur-lg 
                    hover:shadow-xl transition-shadow duration-300
                    ${
                      isLatestChanged
                        ? "border-2 border-yellow-400 animate-pulse"
                        : ""
                    }
                  `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow mr-4">
                        <p className="font-medium text-gray-800 mb-2">
                          {question.question_text}
                        </p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 bg-blue-50 hover:bg-blue-100"
                          disabled
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Votes</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
