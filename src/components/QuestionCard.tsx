import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface QuestionCardProps {
  question: string;
  index: number;
}

const QuestionCard = ({ question, index }: QuestionCardProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const pageNumber = question.match(/\(Pg\.No: \d+\)/)?.[0] || "";
  
  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 group animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            Question {index + 1}
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {pageNumber}
        </span>
      </div>
      <p className="mt-1 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
        {question}
      </p>
    </Card>
  );
};

export default QuestionCard;