import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Book } from "lucide-react";
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
              "Biotransformation ** (Aug 14;Feb 10)\nDiscuss:\n- Biotransformation Reactions, Phase I and Phase II reaction with suitable examples\n- Importance of Enzyme Induction and Enzyme Inhibition\n- Microsomal Enzyme Induction and Inhibition with examples\n\nProbable Case:\nA 35 year old woman taking combined oral contraceptive pills was diagnosed with tuberculosis and put on isoniazid, rifampicin, pyrazinamide, and ethambutol combination therapy for 2 months followed by isoniazid and rifampicin thrice weekly for 4 months. In the 3rd month of treatment, she failed to have withdrawal bleeding during the gap period of contraceptive cycle. One week later her urinary pregnancy test was found to be positive.",
              "Factors Modifying Drug Action ** (Aug 15;Aug 10)\nDiscuss:\n- Definition Drug and Dose\n- Various Factors Modifying a Drug's Actions\n- Note about Pharmacogenetics",
              "Routes of Drug Administration (Apr 01)\nExplain:\n- Each Route of Administration\n- Examples\n- Advantages and Disadvantages"
            ]
          },
          "short-note": {
            name: "Short Note",
            questions: [
              "Biological Half Life (or) Plasma Half Life ****** (Jul 23;Aug 18;Feb 17;Aug 05;Mar 02;Nov 95)\n- Drugs with short half-life\n- Drugs with long and very short half life",
              "Drug Tolerance (Tachyphylaxis) ****** (Feb 23;Feb 22;Aug 17;Feb 09;Mar 02;Apr 97)",
              "Pharmacogenetics ****** (Feb 23;Sep 21;Aug 17;Feb 09;Feb 08;Apr 01)",
              "Pharmacovigilance ****** (Aug 22;Mar 22;Sep 21;Feb 18;Feb 16;Aug 13)",
              "Newer Drug Delivery System ***** (Feb 23;Feb 13;Feb 11;Feb 08;Nov 94)",
              "Bioavailability **** (Feb 20;Aug 09;Aug 04;Apr 01)",
              "First Pass Metabolism (Pre-Systemic Elimination) **** (Aug 16;Feb 07;Oct 98;Jan 93)",
              "Drug Antagonism *** (Feb 12;Feb 05;Nov 01)",
              "Sublingual Route of Drug Administration *** (Aug 11;Aug 08;Oct 97)",
              "Teratogenicity *** (Aug 22;Feb 19;Nov 01)",
              "Biotransformation ** (Aug 08;Apr 99)",
              "Microsomal Enzyme Inducers ** (Feb 23;Feb 12)",
              "Phase 2 Biotransformation Reactions with Suitable Examples ** (Mar 22;Feb 20)",
              "Phase III Clinical Trial ** (Feb 22;Feb 19)",
              "Post Marketing Surveillance During Newer Drug Development (Phase IV Clinical Trial) ** (Feb 17;Nov 95)",
              "Prolongation Of Drug Action ** (Jul 23;Apr 96)",
              "Protein Binding of Drugs ** (Sep 21;Oct 03)\n- Clinical significance with Examples",
              "Therapeutic Index ** (Aug 07;Oct 96)",
              "Transdermal Application Of Drugs ** (Feb 22;Oct 00)",
              "Blood Brain Barrier (Aug 11)",
              "Causality Assessment (Aug 22)",
              "Drug Receptor (Oct 00)",
              "Drug Responses in Elderly (Aug 12)",
              "Drug Synergism (Feb 16)",
              "Drugs in Anaphylactic Shock",
              "Essential Drugs (Feb 12)",
              "Fixed Dose Ratio Combination (Feb 13)",
              "Iatrogenicity (Oct 00)",
              "Intracellular Receptors (Nov 20)",
              "Local Routes Of Drug Administration (Feb 10)",
              "Orphan Drugs (Aug 18)",
              "Parenteral Route of Drug Administration (Aug 19)",
              "Pharmacokinetics",
              "Phase 1 Biotransformation Reaction with Examples (Aug 06)",
              "Physical Antagonism (Nov 20)",
              "Prodrug (Aug 04)",
              "Receptor Antagonism (Aug 11)",
              "Rectal Route of Administration (Dec 23)",
              "Specialized Active Transport Mechanism Across Biological Membrane (Aug 13)",
              "Zero Order Pharmacokinetics (Aug 19)"
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
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 pt-6 max-w-3xl mx-auto" {...handlers}>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">MBBS Question Bank</h2>
        </div>
        <div className="grid gap-4">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(SAMPLE_DATA).map(([topicKey, topic]) => (
              <AccordionItem value={topicKey} key={topicKey}>
                <AccordionTrigger className="px-4">
                  <div className="flex items-center space-x-2">
                    <Book className="h-5 w-5 text-primary" />
                    <h3 className="text-lg md:text-xl font-semibold">{topic.name}</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-full px-4">
                    <Accordion type="single" collapsible className="w-full">
                      {Object.entries(topic.subtopics).map(([subtopicKey, subtopic]) => (
                        <AccordionItem value={subtopicKey} key={subtopicKey}>
                          <AccordionTrigger>
                            <h4 className="text-base md:text-lg font-medium">{subtopic.name}</h4>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ScrollArea className="h-full px-4">
                              <Accordion type="single" collapsible className="w-full">
                                {Object.entries(subtopic.subtopics).map(([typeKey, type]) => (
                                  <AccordionItem value={typeKey} key={typeKey}>
                                    <AccordionTrigger>
                                      <h5 className="text-sm md:text-base font-medium">{type.name}</h5>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-2 px-4">
                                        {type.questions.map((question, index) => (
                                          <Card
                                            key={index}
                                            className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer active:scale-98 transform"
                                          >
                                            <p className="text-sm text-muted-foreground">
                                              Question {index + 1}
                                            </p>
                                            <p className="mt-1 text-sm md:text-base">{question}</p>
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