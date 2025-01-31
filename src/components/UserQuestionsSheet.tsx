"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/type/Question";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface UserQuestionsSheetProps {
  questions: Question[];
}

export default function UserQuestionsSheet({
  questions,
}: UserQuestionsSheetProps) {
  return (
    <div className="p-4">
      <SheetHeader className="mb-4">
        <SheetTitle>My Questions</SheetTitle>
      </SheetHeader>

      {questions.length === 0 ? (
        <p className="text-center text-gray-500">No questions yet</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                }}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow mr-4">
                    <p className="text-gray-800">{question.question_text}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      Created on{" "}
                      {new Date(question.created_at || "").toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-blue-600">
                      {question.vote_count}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
