import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
}

const AIChatWindow = ({ isOpen, onClose, question }: AIChatWindowProps) => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful medical education assistant. Provide clear, concise answers to medical questions.'
            },
            {
              role: 'user',
              content: `Please help me understand this topic: ${question}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setResponse(data.choices[0].message.content);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{question}</p>
          </div>
          {response && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{response}</p>
            </div>
          )}
          <Button 
            className="w-full" 
            onClick={handleAskQuestion}
            disabled={isLoading}
          >
            {isLoading ? "Getting Answer..." : "Ask AI"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIChatWindow;