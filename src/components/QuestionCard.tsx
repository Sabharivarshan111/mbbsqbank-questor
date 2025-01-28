import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionCardProps {
  question: string;
  index: number;
  isCompleted: boolean;
  onToggleCompletion: () => void;
}

const QuestionCard = ({ question, index, isCompleted, onToggleCompletion }: QuestionCardProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={onToggleCompletion}
              className="mt-1"
            />
          </div>
          <div className="flex-grow">
            <p className="text-sm md:text-base whitespace-pre-wrap">{question}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;