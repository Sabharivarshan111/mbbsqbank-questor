import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, BookOpen, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import QuestionCard from "./QuestionCard";
import { QUESTION_BANK_DATA } from "@/data/questionBankData";

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
              <AccordionItem 
                value={topicKey} 
                key={topicKey}
                className="animate-fade-in transition-all duration-300"
              >
                <AccordionTrigger className="px-4 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl md:text-2xl font-semibold">{topic.name}</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-full px-4">
                    <Accordion type="single" collapsible className="w-full">
                      {Object.entries(topic.subtopics).map(([subtopicKey, subtopic]) => (
                        <AccordionItem 
                          value={subtopicKey} 
                          key={subtopicKey}
                          className="animate-fade-in transition-all duration-300"
                        >
                          <AccordionTrigger className="hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg px-4">
                            <div className="flex items-center space-x-3">
                              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              <h4 className="text-lg md:text-xl font-medium">{subtopic.name}</h4>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ScrollArea className="h-full px-4">
                              {subtopic.subtopics && (
                                <Accordion type="single" collapsible className="w-full">
                                  {Object.entries(subtopic.subtopics).map(([typeKey, type]) => (
                                    <AccordionItem 
                                      value={typeKey} 
                                      key={typeKey}
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
                                          {type.questions.map((question, index) => (
                                            <QuestionCard
                                              key={index}
                                              question={question}
                                              index={index}
                                            />
                                          ))}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              )}
                              {!subtopic.subtopics && subtopic.questions && (
                                <div className="space-y-4">
                                  {subtopic.questions.map((question, index) => (
                                    <QuestionCard
                                      key={index}
                                      question={question}
                                      index={index}
                                    />
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;