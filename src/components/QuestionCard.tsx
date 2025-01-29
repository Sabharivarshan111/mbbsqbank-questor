import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Question } from "./QuestionBank";

interface QuestionCardProps {
  question: string;
  index: number;
}

const QuestionCard = ({ question, index }: QuestionCardProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const pageNumberMatch = question.match(/\(Pg\.No: ([^)]+)\)/);
  const pageNumbers = pageNumberMatch ? pageNumberMatch[1] : "";

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
              className="h-5 w-5"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.replace(/\(Pg\.No: [^)]+\)/, '')}
            </p>
            {pageNumbers && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Page: {pageNumbers}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;