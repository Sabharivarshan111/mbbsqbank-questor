
import { FileText } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QuestionSection from "./QuestionSection";
import { SubTopicContent } from "./QuestionBank";

interface TypeAccordionProps {
  typeKey: string;
  type: SubTopicContent;
  isExpanded?: boolean;
  activeTab: "essay" | "short-notes";
}

const TypeAccordion = ({ typeKey, type, isExpanded = false, activeTab }: TypeAccordionProps) => {
  const derivedSubtopics = (type as any)?.subtopics ?? {
    ...(type as any)?.essay ? { essay: (type as any).essay } : {},
    ...(((type as any)?.["short-notes"] || (type as any)?.["short-note"]) ? { "short-notes": (type as any)["short-notes"] || (type as any)["short-note"] } : {})
  };
  return (
    <AccordionItem 
      value={typeKey}
      className="animate-fade-in transition-all duration-300 text-gray-800 dark:text-gray-200"
    >
      <AccordionTrigger className="hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg px-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
          <h5 className="text-lg font-medium">{type.name}</h5>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 px-4">
          <QuestionSection 
            subtopics={derivedSubtopics} 
            activeTab={activeTab} 
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TypeAccordion;
