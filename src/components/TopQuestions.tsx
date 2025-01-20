"use client";

import { useState } from "react";
import useSWR from "swr";
import { ThumbsUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Question {
  id: number;
  name: string;
  phone_number: string;
  question_text: string;
  vote_count: number;
}

interface TopQuestionsProps {
  questions: Question[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopQuestions({ questions }: TopQuestionsProps) {
  const { data, error } = useSWR(
    "https://cim.baliyoventures.com/api/top-questions/",
    fetcher,
    { refreshInterval: 2000 }
  );

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  if (error) return <div>Error loading top questions.</div>;
  if (!data) return <div>Loading top questions...</div>;

  const topQuestions = data?.results || questions;
  const combinedQuestions = [...topQuestions, ...questions];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl shadow-lg mb-12">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center">
        <Award className="mr-2" /> Top Questions
      </h2>
      <div className="space-y-4">
        {combinedQuestions.map((question: Question, index: number) => (
          <motion.div
            key={`${question.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white bg-opacity-90 backdrop-blur-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-grow mr-4">
                    <p className="font-medium text-gray-800 mb-2">
                      {expandedQuestion === question.id
                        ? question.question_text
                        : `${question.question_text.slice(0, 100)}${
                            question.question_text.length > 100 ? "..." : ""
                          }`}
                    </p>
                    {question.question_text.length > 100 && (
                      <Button
                        variant="link"
                        onClick={() =>
                          setExpandedQuestion(
                            expandedQuestion === question.id
                              ? null
                              : question.id
                          )
                        }
                        className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                      >
                        {expandedQuestion === question.id
                          ? "Show less"
                          : "Read more"}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-blue-600">
                      {question.vote_count}
                    </span>
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
        ))}
      </div>
    </div>
  );
}
