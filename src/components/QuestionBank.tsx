import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "lucide-react";

const SAMPLE_DATA = {
  pharmacology: {
    name: "Pharmacology",
    subtopics: {
      "general-pharmacology": {
        name: "General Pharmacology",
        questions: [
          "What is pharmacokinetics?",
          "Define bioavailability and its significance.",
          "Explain the different routes of drug administration.",
        ],
      },
    },
  },
};

const QuestionBank = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">MBBS Question Bank</h2>
        </div>
        <div className="grid gap-4">
          {Object.entries(SAMPLE_DATA).map(([topicKey, topic]) => (
            <Card key={topicKey}>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center space-x-2">
                  <Book className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-semibold">{topic.name}</h3>
                </div>
                <ScrollArea className="h-full">
                  {Object.entries(topic.subtopics).map(([subtopicKey, subtopic]) => (
                    <div key={subtopicKey} className="mb-6">
                      <h4 className="mb-2 text-xl font-medium">{subtopic.name}</h4>
                      <div className="space-y-2">
                        {subtopic.questions.map((question, index) => (
                          <div
                            key={index}
                            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                          >
                            <p className="text-sm text-muted-foreground">
                              Question {index + 1}
                            </p>
                            <p className="mt-1">{question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;