import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { QUESTION_BANK_DATA } from "@/data/questionBankData";
import TopicAccordion from "./TopicAccordion";

export interface Question {
  question: string;
  index: number;
}

export interface QuestionType {
  name: string;
  questions: string[];
}

export interface SubTopicContent {
  name: string;
  subtopics: {
    [key: string]: QuestionType;
  };
}

export interface SubTopic {
  name: string;
  subtopics: {
    [key: string]: SubTopicContent;
  };
}

export interface Topic {
  name: string;
  subtopics: {
    [key: string]: SubTopic;
  };
}

const QuestionBank = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => console.log("Swiped left - can be used for next topic"),
    onSwipedRight: () => console.log("Swiped right - can be used for previous topic"),
    trackMouse: true
  });

  console.log("QuestionBank data:", QUESTION_BANK_DATA);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 space-y-4 p-4 pt-6 max-w-4xl mx-auto" {...handlers}>
        <div className="flex items-center justify-between space-y-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text animate-fade-in">
            MBBS Question Bank
          </h2>
        </div>
        <div className="grid gap-4">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(QUESTION_BANK_DATA).map(([topicKey, topic]) => (
              <TopicAccordion 
                key={topicKey}
                topicKey={topicKey}
                topic={topic as Topic}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;