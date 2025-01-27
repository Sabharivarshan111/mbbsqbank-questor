import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Book, BookOpen, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

const SAMPLE_DATA = {
  pharmacology: {
    name: "Pharmacology",
    subtopics: {
      "general-pharmacology": {
        name: "General Pharmacology",
        subtopics: {
          essay: {
            name: "Essay",
            questions: [
              "Biotransformation ** (Aug 14;Feb 10) (Pg.No: 28)\nDiscuss:\n- Biotransformation Reactions, Phase I and Phase II reaction with suitable examples\n- Importance of Enzyme Induction and Enzyme Inhibition\n- Microsomal Enzyme Induction and Inhibition with examples\n\nProbable Case:\nA 35 year old woman taking combined oral contraceptive pills was diagnosed with tuberculosis and put on isoniazid, rifampicin, pyrazinamide, and ethambutol combination therapy for 2 months followed by isoniazid and rifampicin thrice weekly for 4 months. In the 3rd month of treatment, she failed to have withdrawal bleeding during the gap period of contraceptive cycle. One week later her urinary pregnancy test was found to be positive.",
              "Factors Modifying Drug Action ** (Aug 15;Aug 10) (Pg.No: 73)\nDiscuss:\n- Definition Drug and Dose\n- Various Factors Modifying a Drug's Actions\n- Note about Pharmacogenetics",
              "Routes of Drug Administration (Apr 01) (Pg.No: 9)\nExplain:\n- Each Route of Administration\n- Examples\n- Advantages and Disadvantages"
            ]
          },
          "short-note": {
            name: "Short Note",
            questions: [
              "Biological Half Life (or) Plasma Half Life ****** (Jul 23;Aug 18;Feb 17;Aug 05;Mar 02;Nov 95) (Pg.No: 39)\n- Drugs with short half-life\n- Drugs with long and very short half life",
              "Drug Tolerance (Tachyphylaxis) ****** (Feb 23;Feb 22;Aug 17;Feb 09;Mar 02;Apr 97) (Pg.No: 80)",
              "Pharmacogenetics ****** (Feb 23;Sep 21;Aug 17;Feb 09;Feb 08;Apr 01) (Pg.No: 75)",
              "Pharmacovigilance ****** (Aug 22;Mar 22;Sep 21;Feb 18;Feb 16;Aug 13) (Pg.No: 93)",
              "Newer Drug Delivery System ***** (Feb 23;Feb 13;Feb 11;Feb 08;Nov 94) (Pg.No: 42)",
              "Bioavailability **** (Feb 20;Aug 09;Aug 04;Apr 01) (Pg.No: 22)",
              "First Pass Metabolism (Pre-Systemic Elimination) **** (Aug 16;Feb 07;Oct 98;Jan 93) (Pg.No: 34)",
              "Drug Antagonism *** (Feb 12;Feb 05;Nov 01) (Pg.No: 67)",
              "Sublingual Route of Drug Administration *** (Aug 11;Aug 08;Oct 97) (Pg.No: 12)",
              "Teratogenicity *** (Aug 22;Feb 19;Nov 01) (Pg.No: 99)",
              "Biotransformation ** (Aug 08;Apr 99) (Pg.No: 28)",
              "Microsomal Enzyme Inducers ** (Feb 23;Feb 12) (Pg.No: 33)",
              "Phase 2 Biotransformation Reactions with Suitable Examples ** (Mar 22;Feb 20) (Pg.No: 31)",
              "Phase III Clinical Trial ** (Feb 22;Feb 19) (Pg.No: 91)",
              "Post Marketing Surveillance During Newer Drug Development (Phase IV Clinical Trial) ** (Feb 17;Nov 95) (Pg.No: 91)",
              "Prolongation Of Drug Action ** (Jul 23;Apr 96) (Pg.No: 42)",
              "Protein Binding of Drugs ** (Sep 21;Oct 03) (Pg.No: 25)\n- Clinical significance with Examples",
              "Therapeutic Index ** (Aug 07;Oct 96) (Pg.No: 65)",
              "Transdermal Application Of Drugs ** (Feb 22;Oct 00) (Pg.No: 12)",
              "Blood Brain Barrier (Aug 11) (Pg.No: 24)",
              "Causality Assessment (Aug 22) (Pg.No: 93)",
              "Drug Receptor (Oct 00) (Pg.No: 48)",
              "Drug Responses in Elderly (Aug 12) (Pg.No: 74)",
              "Drug Synergism (Feb 16) (Pg.No: 66)",
              "Drugs in Anaphylactic Shock (Pg.No: 97)",
              "Essential Drugs (Feb 12) (Pg.No: 6)",
              "Fixed Dose Ratio Combination (Feb 13) (Pg.No: 72)",
              "Iatrogenicity (Oct 00) (Pg.No: 101)",
              "Intracellular Receptors (Nov 20) (Pg.No: 60)",
              "Local Routes Of Drug Administration (Feb 10) (Pg.No: 10)",
              "Orphan Drugs (Aug 18) (Pg.No: 7)",
              "Parenteral Route of Drug Administration (Aug 19) (Pg.No: 13)",
              "Pharmacokinetics (Pg.No: 15)",
              "Phase 1 Biotransformation Reaction with Examples (Aug 06) (Pg.No: 29)",
              "Physical Antagonism (Nov 20) (Pg.No: 67)",
              "Prodrug (Aug 04) (Pg.No: 28)",
              "Receptor Antagonism (Aug 11) (Pg.No: 68)",
              "Rectal Route of Administration (Dec 23) (Pg.No: 12)",
              "Specialized Active Transport Mechanism Across Biological Membrane (Aug 13) (Pg.No: 18)",
              "Zero Order Pharmacokinetics (Aug 19) (Pg.No: 38)"
            ]
          }
        }
      },
    },
  },
};

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
            {Object.entries(SAMPLE_DATA).map(([topicKey, topic]) => (
              <AccordionItem 
                value={topicKey} 
                key={topicKey}
                className="animate-fade-in"
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
                          className="animate-fade-in"
                        >
                          <AccordionTrigger className="hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg px-4">
                            <div className="flex items-center space-x-3">
                              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              <h4 className="text-lg md:text-xl font-medium">{subtopic.name}</h4>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ScrollArea className="h-full px-4">
                              <Accordion type="single" collapsible className="w-full">
                                {Object.entries(subtopic.subtopics).map(([typeKey, type]) => (
                                  <AccordionItem 
                                    value={typeKey} 
                                    key={typeKey}
                                    className="animate-fade-in"
                                  >
                                    <AccordionTrigger className="hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg px-4">
                                      <div className="flex items-center space-x-3">
                                        <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                                        <h5 className="text-base md:text-lg font-medium">{type.name}</h5>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-3 px-4">
                                        {type.questions.map((question, index) => (
                                          <Card
                                            key={index}
                                            className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-blue-900"
                                          >
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                                              Question {index + 1}
                                            </p>
                                            <p className="mt-1 text-sm md:text-base whitespace-pre-wrap">
                                              {question}
                                            </p>
                                          </Card>
                                        ))}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
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