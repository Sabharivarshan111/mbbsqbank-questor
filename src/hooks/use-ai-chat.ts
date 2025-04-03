
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/models/ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_BANK_DATA } from "@/data/questionBankData";
import { isStringMatch, normalizeString } from "@/lib/utils";

interface QueueStats {
  isQueueActive: boolean;
  queueLength: number;
  estimatedWaitTime: number;
}

interface UseAiChatProps {
  initialQuestion?: string;
}

// Function to extract questions with their asterisk counts
function extractQuestions(questions: string[]): {text: string, count: number}[] {
  return questions.map(question => {
    // Extract the asterisk pattern if present
    const asteriskMatch = question.match(/\*+/);
    const count = asteriskMatch ? asteriskMatch[0].length : 0;
    return { text: question, count };
  });
}

// Function to get important questions from the question bank data without using API
function getImportantQuestions(subject: string, requestedTopic?: string): string {
  console.log(`Finding important questions for subject: "${subject}" and topic: "${requestedTopic}"`);
  
  // Normalize subject to match our data structure
  const normalizedSubject = normalizeString(subject);
  
  // Find the subject in our question bank data
  let foundSubject = null;
  let subjectKey = "";
  
  // Try to match the subject
  for (const key in QUESTION_BANK_DATA) {
    if (isStringMatch(key, normalizedSubject)) {
      foundSubject = QUESTION_BANK_DATA[key as keyof typeof QUESTION_BANK_DATA];
      subjectKey = key;
      break;
    }
  }
  
  if (!foundSubject) {
    console.log(`Subject not found: "${normalizedSubject}"`);
    return `Could not find information about "${subject}" in our question bank. Please check the spelling or try a different subject.`;
  }

  console.log(`Found subject data for "${subjectKey}"`);

  // Recursively search for a topic in the nested data structure
  function findTopicNode(node: any, searchTopic: string): { node: any, path: string[] } | null {
    if (!node || !searchTopic || typeof node !== 'object') return null;
    
    const searchTopicNormalized = normalizeString(searchTopic);
    console.log(`Searching for topic: "${searchTopicNormalized}"`);
    
    // Helper function to check if a node matches the search topic
    function isNodeMatch(nodeName: string): boolean {
      if (!nodeName) return false;
      
      const nodeNameNormalized = normalizeString(nodeName);
      return isStringMatch(nodeNameNormalized, searchTopicNormalized);
    }
    
    // Check if current node name matches
    if (node.name && isNodeMatch(node.name)) {
      console.log(`Found direct match with node name: "${node.name}"`);
      return { node, path: [node.name] };
    }
    
    // Check if any keys in subtopics match
    if (node.subtopics) {
      for (const key in node.subtopics) {
        const keyNormalized = normalizeString(key);
        
        // Check if key itself matches topic name
        if (isNodeMatch(key)) {
          console.log(`Found match with subtopic key: "${key}"`);
          const childNode = node.subtopics[key];
          return { node: childNode, path: [key] };
        }
        
        // Check if subtopic name matches
        const subtopic = node.subtopics[key];
        if (subtopic && subtopic.name && isNodeMatch(subtopic.name)) {
          console.log(`Found match with subtopic name: "${subtopic.name}"`);
          return { node: subtopic, path: [subtopic.name] };
        }
        
        // Recursively search in this subtopic
        if (subtopic) {
          const result = findTopicNode(subtopic, searchTopic);
          if (result) {
            console.log(`Found match via recursion in: "${key}"`);
            return { 
              node: result.node, 
              path: [key, ...result.path]
            };
          }
        }
      }
    }
    
    // Special case for known topics with non-obvious paths
    const knownTopics: Record<string, { path: string[], subjectName: string }> = {
      'neoplasia': { path: ['paper-1', 'neoplasia'], subjectName: 'pathology' },
      'heart': { path: ['paper-2', 'heart'], subjectName: 'pathology' },
      'skin': { path: ['paper-2', 'skin'], subjectName: 'pathology' },
      'breast': { path: ['paper-2', 'breast'], subjectName: 'pathology' },
      'kidney': { path: ['paper-2', 'kidney'], subjectName: 'pathology' },
      'blood vessels': { path: ['paper-2', 'blood-vessels'], subjectName: 'pathology' },
      'blood-vessels': { path: ['paper-2', 'blood-vessels'], subjectName: 'pathology' },
      'respiratory': { path: ['paper-2', 'respiratory-system'], subjectName: 'pathology' },
      'cns': { path: ['paper-2', 'central-nervous-system'], subjectName: 'pathology' },
      'central nervous': { path: ['paper-2', 'central-nervous-system'], subjectName: 'pathology' },
      'central nervous system': { path: ['paper-2', 'central-nervous-system'], subjectName: 'pathology' },
      'platelets': { path: ['paper-1', 'platelets'], subjectName: 'pathology' },
      'inflammation': { path: ['paper-1', 'inflammation-repair'], subjectName: 'pathology' },
      'cell injury': { path: ['paper-1', 'cell-injury'], subjectName: 'pathology' }
    };
    
    if (subjectKey === 'pathology' && knownTopics[searchTopicNormalized]) {
      const topicInfo = knownTopics[searchTopicNormalized];
      console.log(`Found match in known topics map: "${searchTopicNormalized}" -> ${topicInfo.path.join(' > ')}`);
      
      // Navigate to the node through the known path
      let currentNode = node;
      for (const pathSegment of topicInfo.path) {
        if (currentNode.subtopics && currentNode.subtopics[pathSegment]) {
          currentNode = currentNode.subtopics[pathSegment];
        } else {
          console.log(`Failed to follow known path at segment: "${pathSegment}"`);
          return null;
        }
      }
      
      return { node: currentNode, path: topicInfo.path };
    }
    
    return null;
  }

  // Find all essay and short note questions in a node
  function collectQuestions(node: any): { essay: {text: string, count: number}[], shortNote: {text: string, count: number}[] } {
    console.log("Collecting questions from node:", node?.name || "unnamed node");
    
    const result = { 
      essay: [] as {text: string, count: number}[], 
      shortNote: [] as {text: string, count: number}[] 
    };
    
    if (!node) return result;
    
    // Function to check essay and short note questions at current level
    function checkCurrentLevelQuestions(currentNode: any) {
      if (!currentNode || typeof currentNode !== 'object') return;
      
      // Check for direct essay questions at this level
      if (currentNode.subtopics && currentNode.subtopics.essay && 
          currentNode.subtopics.essay.questions && 
          Array.isArray(currentNode.subtopics.essay.questions)) {
        console.log(`Found ${currentNode.subtopics.essay.questions.length} essay questions at this level`);
        result.essay.push(...extractQuestions(currentNode.subtopics.essay.questions));
      }
      
      // Check for short note questions (handles both formats: short-note and short-notes)
      if (currentNode.subtopics) {
        if (currentNode.subtopics['short-note'] && 
            currentNode.subtopics['short-note'].questions && 
            Array.isArray(currentNode.subtopics['short-note'].questions)) {
          console.log(`Found ${currentNode.subtopics['short-note'].questions.length} short-note questions`);
          result.shortNote.push(...extractQuestions(currentNode.subtopics['short-note'].questions));
        }
        
        if (currentNode.subtopics['short-notes'] && 
            currentNode.subtopics['short-notes'].questions && 
            Array.isArray(currentNode.subtopics['short-notes'].questions)) {
          console.log(`Found ${currentNode.subtopics['short-notes'].questions.length} short-notes questions`);
          result.shortNote.push(...extractQuestions(currentNode.subtopics['short-notes'].questions));
        }
      }
    }
    
    // Check this node for questions
    checkCurrentLevelQuestions(node);
    
    // If we couldn't find questions directly, try looking in subtopics
    if (result.essay.length === 0 && result.shortNote.length === 0 && node.subtopics) {
      console.log("No questions found at current level, checking subtopics...");
      
      // Skip essay and short-note specific subtopics
      for (const key in node.subtopics) {
        if (key !== 'essay' && key !== 'short-note' && key !== 'short-notes') {
          console.log(`Checking subtopic: ${key}`);
          const subtopicQuestions = collectQuestions(node.subtopics[key]);
          result.essay.push(...subtopicQuestions.essay);
          result.shortNote.push(...subtopicQuestions.shortNote);
        }
      }
    }
    
    return result;
  }
  
  let targetNode = foundSubject;
  let targetPath: string[] = [subjectKey];
  
  // If a topic is specified, try to find it in the data structure
  if (requestedTopic) {
    console.log(`Looking for specific topic: "${requestedTopic}"`);
    const topicResult = findTopicNode(foundSubject, requestedTopic);
    
    if (topicResult) {
      targetNode = topicResult.node;
      targetPath = [subjectKey, ...topicResult.path];
      console.log(`Found topic "${requestedTopic}" at path: ${targetPath.join(' > ')}`);
    } else {
      console.log(`Topic "${requestedTopic}" not found in subject "${subjectKey}"`);
    }
  }
  
  // Collect all questions from the target node
  const allQuestions = collectQuestions(targetNode);
  console.log(`Questions collected - Essay: ${allQuestions.essay.length}, Short Note: ${allQuestions.shortNote.length}`);
  
  // Sort questions by their asterisk count (frequency)
  const sortedEssayQuestions = allQuestions.essay.sort((a, b) => b.count - a.count);
  const sortedShortNoteQuestions = allQuestions.shortNote.sort((a, b) => b.count - a.count);
  
  // Format the subject and topic names for display
  const displaySubject = subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
  let displayTopic = "";
  
  if (requestedTopic) {
    // Use the last element of the path as the display topic if available
    const topicNode = targetNode.name || (targetPath.length > 1 ? targetPath[targetPath.length - 1].replace(/-/g, ' ') : requestedTopic);
    displayTopic = topicNode.split(' ').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  // Build the response
  let result = `# Important Questions for ${displaySubject}${displayTopic ? ` - ${displayTopic}` : ''}\n\n`;
  
  // Add essay questions
  result += "## ESSAY QUESTIONS\n\n";
  if (sortedEssayQuestions.length > 0) {
    sortedEssayQuestions.forEach((q, i) => {
      // Clean up the question text (remove page numbers, etc.)
      let cleanText = q.text
        .replace(/\(Pg\.No:[^)]+\)/g, '')  // Remove page numbers
        .replace(/\([^)]*\d{2};\d{2}[^)]*\)/g, '')  // Remove date patterns
        .replace(/\*+/, '')  // Remove asterisks
        .trim();
      
      // Format the frequency indicator
      const frequencyText = q.count > 0 ? ` 🔥 Frequency: ${q.count}` : '';
      
      result += `${i+1}. ${cleanText}${frequencyText}\n\n`;
    });
  } else {
    result += "No essay questions found for this topic.\n\n";
  }
  
  // Add short note questions
  result += "## SHORT NOTE QUESTIONS\n\n";
  if (sortedShortNoteQuestions.length > 0) {
    sortedShortNoteQuestions.forEach((q, i) => {
      // Clean up the question text
      let cleanText = q.text
        .replace(/\(Pg\.No:[^)]+\)/g, '')  // Remove page numbers
        .replace(/\([^)]*\d{2};\d{2}[^)]*\)/g, '')  // Remove date patterns
        .replace(/\*+/, '')  // Remove asterisks
        .trim();
      
      // Format the frequency indicator
      const frequencyText = q.count > 0 ? ` 🔥 Frequency: ${q.count}` : '';
      
      result += `${i+1}. ${cleanText}${frequencyText}\n\n`;
    });
  } else {
    result += "No short note questions found for this topic.\n\n";
  }
  
  // Add a note if no questions were found at all
  if (sortedEssayQuestions.length === 0 && sortedShortNoteQuestions.length === 0) {
    result += "No questions found for the specified subject and topic combination. Please try a different search or check the spelling.\n\n";
    result += "Available topics for this subject include:\n";
    
    // Helper function to list available topics
    const listAvailableTopics = (node: any, depth = 0, maxDepth = 2): string[] => {
      if (!node || !node.subtopics || depth > maxDepth) return [];
      
      const topics: string[] = [];
      
      for (const [key, subtopic] of Object.entries(node.subtopics)) {
        if (key !== 'essay' && key !== 'short-note' && key !== 'short-notes' && typeof subtopic === 'object' && subtopic !== null) {
          const topicName = (subtopic as any).name || key.replace(/-/g, ' ');
          const displayName = '  '.repeat(depth) + (depth > 0 ? '- ' : '') + topicName;
          topics.push(displayName);
          
          if (depth < maxDepth) {
            topics.push(...listAvailableTopics(subtopic, depth + 1, maxDepth));
          }
        }
      }
      
      return topics;
    };
    
    const topics = listAvailableTopics(foundSubject);
    const uniqueTopics = [...new Set(topics)].sort();
    
    uniqueTopics.slice(0, 15).forEach(topic => {
      result += `- ${topic}\n`;
    });
    
    if (uniqueTopics.length > 15) {
      result += `- And ${uniqueTopics.length - 15} more topics...\n`;
    }
  }
  
  return result;
}

// Helper to check if a prompt is requesting important questions about a subject
function detectSubjectImportantQuestionsRequest(prompt: string): { isRequest: boolean, subject: string, topic?: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for "important questions" type requests
  const isImportantQuestionsRequest = /important question|important topics|high yield|frequently asked|commonly asked|repeated questions/i.test(lowerPrompt);
  
  if (!isImportantQuestionsRequest) {
    return { isRequest: false, subject: '' };
  }
  
  // Look for subject mentions - order matters, check most specific first
  const subjects = [
    { name: "pharmacology", aliases: ["pharma", "pharmacodynamics", "pharmacokinetics"] },
    { name: "pathology", aliases: ["patho", "histology", "cytology"] },
    { name: "microbiology", aliases: ["micro", "bacteria", "virus", "fungi", "parasites"] }
  ];
  
  let detectedSubject = '';
  
  // Try to detect subject
  for (const subject of subjects) {
    if (lowerPrompt.includes(subject.name) || subject.aliases.some(alias => lowerPrompt.includes(alias))) {
      detectedSubject = subject.name;
      break;
    }
  }
  
  if (!detectedSubject) {
    return { isRequest: false, subject: '' };
  }
  
  console.log(`Detected subject request for: ${detectedSubject}`);
  
  // If a subject is detected, try to extract any specific topic
  let topic: string | undefined;
  
  // First check common pathology topics by name
  const pathologyTopics = [
    // Paper 1 topics
    'neoplasia', 'inflammatory', 'inflammation', 'inflammation repair', 'cell injury', 'hemodynamic', 
    'genetic disorders', 'immunology', 'infectious', 'environmental', 'nutritional', 'infancy', 'childhood',
    'red blood cells', 'white blood cells', 'platelets',
    
    // Paper 2 topics
    'respiratory', 'heart', 'blood vessel', 'blood vessels', 'gastrointestinal', 'liver', 'kidney',
    'male genital', 'female genital', 'bones', 'joints', 'soft tissue', 'central nervous', 'cns', 
    'breast', 'endocrinology', 'skin'
  ];
  
  if (detectedSubject === 'pathology') {
    for (const possibleTopic of pathologyTopics) {
      if (lowerPrompt.includes(possibleTopic)) {
        topic = possibleTopic;
        console.log(`Detected pathology topic: ${topic}`);
        break;
      }
    }
  }
  
  // If no topic was found through direct matching, try to extract it from context
  if (!topic) {
    // Try to extract topic using patterns like "X about Y" or "X in Y"
    const patterns = [
      new RegExp(`${detectedSubject}\\s+(?:in|about|for|on|of|-)\\s+([\\w\\s-]+)`, 'i'),
      new RegExp(`${detectedSubject}\\s+([\\w\\s-]+)`, 'i'),
      new RegExp(`([\\w\\s-]+)\\s+(?:in|about|for|on|of|-)\\s+${detectedSubject}`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = lowerPrompt.match(pattern);
      if (match && match[1]) {
        // Avoid matching the subject itself or words like "important" or "questions"
        const potentialTopic = match[1].trim();
        if (
          potentialTopic !== detectedSubject && 
          !['important', 'questions', 'topics', 'high', 'yield', 'frequently', 'asked', 'commonly'].includes(potentialTopic)
        ) {
          topic = potentialTopic;
          console.log(`Extracted topic using pattern: ${topic}`);
          break;
        }
      }
    }
  }
  
  return { 
    isRequest: true, 
    subject: detectedSubject,
    topic
  };
}

export const useAiChat = ({ initialQuestion }: UseAiChatProps = {}) => {
  const [prompt, setPrompt] = useState<string>(initialQuestion || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    isQueueActive: false,
    queueLength: 0,
    estimatedWaitTime: 0,
  });
  const { toast } = useToast();
  
  const handleError = (error: unknown) => {
    console.error("AI Chat Error:", error);
    setIsLoading(false);
    
    // Fix TypeScript error by properly checking if error.message exists and is a string
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : "An unexpected error occurred. Please try again later.";
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };
  
  // Load chat history from localStorage on component mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatHistory');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage:", error);
    }
  }, []);
  
  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving chat history to localStorage:", error);
    }
  }, [messages]);

  const handleSubmitQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setPrompt(""); // Clear the input immediately when processing starts
    
    try {
      // First, check if this is a request for important questions that we can handle locally
      const importantQuestionsRequest = detectSubjectImportantQuestionsRequest(question);
      
      if (importantQuestionsRequest.isRequest && importantQuestionsRequest.subject) {
        console.log("Processing important questions request locally:", importantQuestionsRequest);
        
        // Handle locally without API call
        const response = getImportantQuestions(
          importantQuestionsRequest.subject, 
          importantQuestionsRequest.topic
        );
        
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setIsLoading(false);
        return;
      }
      
      // If not a local request, proceed with API call
      
      // Convert previous messages to history format for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Check if this is a triple tap (special handling)
      const isTripleTap = question.startsWith("Triple-tapped:") || question.startsWith("triple-tapped:");
      
      // Check if the user is requesting MCQs
      const isMCQRequest = /generate\s+(?:10|ten)\s+mcqs?|create\s+(?:10|ten)\s+mcqs?|make\s+(?:10|ten)\s+mcqs?|ten\s+mcqs?|10\s+mcqs?|generate\s+mcqs?/i.test(question);
      
      // Check if the user is asking for important questions
      const isImportantQuestionsRequest = /important question|important topics|high yield|frequently asked|commonly asked|repeated questions/i.test(question);
      
      // Check if the user is asking for clarification
      const isNeedingClarification = /i don't understand|can't understand|explain|similar|more detail/i.test(question.toLowerCase());
      
      console.log("Request type:", { isTripleTap, isMCQRequest, isImportantQuestionsRequest, isNeedingClarification });
      
      // Use Supabase edge function - using ask-gemini which supports all the advanced features
      const { data, error } = await supabase.functions.invoke('ask-gemini', {
        body: { 
          prompt: question,
          conversationHistory,
          isTripleTap,
          isMCQRequest,
          isImportantQuestionsRequest,
          isNeedingClarification
        },
      });
      
      if (error) {
        throw new Error(`Error calling AI service: ${error.message}`);
      }
      
      if (data.isRateLimit) {
        setIsRateLimited(true);
        setIsLoading(false);
        toast({
          title: "Rate limit reached",
          description: data.error || "Please wait a moment before sending another message.",
          variant: "destructive",
        });
        return;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.queueStats) {
        setQueueStats(data.queueStats);
      }
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        references: data.references // Include the references if any
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      handleError(error);
      
      // Add a system message about the error
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'system',
        content: "I'm sorry, but I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitQuestion(prompt);
  }, [prompt, handleSubmitQuestion]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    toast({
      title: "Chat cleared!",
      description: "All messages have been cleared from the chat history.",
    });
  }, [toast]);

  const handleCopyResponse = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Response copied!",
      description: "The AI response has been copied to your clipboard.",
    });
  }, [toast]);

  useEffect(() => {
    if (isRateLimited) {
      const timer = setTimeout(() => {
        setIsRateLimited(false);
      }, 60000); // Reset after 60 seconds
      return () => clearTimeout(timer);
    }
  }, [isRateLimited]);

  return {
    prompt,
    setPrompt,
    isLoading,
    messages,
    setMessages,
    isRateLimited,
    queueStats,
    handleSubmit,
    handleClearChat,
    handleCopyResponse,
    handleSubmitQuestion
  };
};
