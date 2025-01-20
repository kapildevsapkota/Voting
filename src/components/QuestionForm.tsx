"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

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
    <div className="mb-8 flex justify-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-1/2 py-10 text-2xl font-bold flex justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
            <PlusCircle className="w-8 h-8" />
            Add Your Question
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Ask a Question</DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Type your question here..."
              required
            />
            <Button type="submit" className="w-full">
              Submit Question
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
