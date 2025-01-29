import { FileText } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QuestionCard from "./QuestionCard";
import { SubTopicContent } from "./QuestionBank";

interface TypeAccordionProps {
  typeKey: string;
  type: SubTopicContent;
}

const TypeAccordion = ({ typeKey, type }: TypeAccordionProps) => {
  console.log("TypeAccordion rendering with type:", type); // Debug log

  return (
    <AccordionItem 
      value={typeKey}
      className="animate-fade-in transition-all duration-300"
    >
      <AccordionTrigger className="hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg px-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
          <h5 className="text-lg font-medium">{type.name}</h5>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 px-4">
          {type.questions && type.questions.length > 0 ? (
            type.questions.map((question, index) => (
              <QuestionCard
                key={index}
                question={question}
                index={index}
              />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No questions available</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TypeAccordion;