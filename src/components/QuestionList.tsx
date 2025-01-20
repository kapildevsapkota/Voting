"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { ThumbsUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  name: string;
  phone_number: string;
  question_text: string;
  vote_count: number;
}

interface QuestionListProps {
  onVote: (id: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function QuestionList({ onVote }: QuestionListProps) {
  const { data, error } = useSWR(
    "https://cim.baliyoventures.com/api/questions/",
    fetcher
  );

  const [votedQuestions, setVotedQuestions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const storedVotedQuestions = JSON.parse(
      localStorage.getItem("votedQuestions") || "[]"
    );
    setVotedQuestions(storedVotedQuestions);
  }, []);

  useEffect(() => {
    if (data) {
      const questions: Question[] = Array.isArray(data)
        ? data
        : data.results || [];
      setFilteredQuestions(
        questions.filter((q) =>
          q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [data, searchTerm]);

  if (error) return <div>Error loading questions.</div>;
  if (!data) return <div>Loading questions...</div>;

  return (
    <div className="mt-12 bg-gray-50 p-8 rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">All Questions</h2>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <AnimatePresence>
        {filteredQuestions.length > 0 ? (
          <motion.ul className="space-y-4">
            {filteredQuestions.map((question: Question, index: number) => (
              <motion.li
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="flex-grow mr-4 text-gray-700">
                      {question.question_text}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-blue-600">
                        {question.vote_count}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVote(question.id)}
                        className={`flex items-center space-x-1 ${
                          votedQuestions.includes(question.id)
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-blue-50 hover:bg-blue-100"
                        }`}
                        disabled={votedQuestions.includes(question.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>
                          {votedQuestions.includes(question.id)
                            ? "Voted"
                            : "Vote"}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 mt-8"
          >
            No questions found matching your search.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
