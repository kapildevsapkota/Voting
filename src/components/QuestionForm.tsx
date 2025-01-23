"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


interface QuestionFormProps {
  onAddQuestion: (question: string) => void;
}

export default function QuestionForm({ onAddQuestion }: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAddQuestion(question);
      setQuestion("");
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button
              className="w-full py-8 text-lg font-bold 
                         bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700 
                         transition-all duration-300 
                         flex items-center justify-center gap-3 
                         shadow-2xl hover:shadow-purple-500/50"
            >
              <PlusCircle className="w-6 h-6" />
              Add Your Question
            </Button>
          </motion.div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-3xl font-bold">
                Ask a Question
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                Share your thoughts with the conference community
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full min-h-[150px] text-lg border-2 border-gray-300 
                         rounded-xl focus:border-purple-500 
                         focus:ring-2 focus:ring-purple-200 
                         transition-all duration-300 
                         resize-none"
              required
            />

            <AnimatePresence>
              {question.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Button
                    type="submit"
                    className="w-full py-3 text-lg font-bold 
                               bg-gradient-to-r from-blue-600 to-indigo-600 
                               hover:from-blue-700 hover:to-indigo-700 
                               transition-all duration-300 
                               shadow-xl hover:shadow-blue-500/50"
                  >
                    Submit Question
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
