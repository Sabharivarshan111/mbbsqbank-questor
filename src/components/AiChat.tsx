
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RotateCcw, AlertCircle, Clock, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessageItem } from "./chat/ChatMessageItem";
import { EmptyChatState } from "./chat/EmptyChatState";
import { ChatInput } from "./chat/ChatInput";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AiChatProps {
  initialQuestion?: string;
}

export const AiChat = ({ initialQuestion }: AiChatProps = {}) => {
  const { theme } = useTheme();
  const { 
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
  } = useAiChat({ initialQuestion });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Scroll to bottom when messages change, but not on first load
  useEffect(() => {
    if (!isFirstLoad && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isFirstLoad]);
  
  // Mark first load as complete after initial render
  useEffect(() => {
    setIsFirstLoad(false);
  }, []);
  
  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      setConnectionError(!navigator.onLine);
    };
    
    // Add event listeners for online/offline status
    window.addEventListener('online', () => setConnectionError(false));
    window.addEventListener('offline', () => setConnectionError(true));
    
    // Check initially
    checkConnection();
    
    // Clean up
    return () => {
      window.removeEventListener('online', () => setConnectionError(false));
      window.removeEventListener('offline', () => setConnectionError(true));
    };
  }, []);
  
  // Listen for triple tap events
  useEffect(() => {
    const handleTripleTapAnswer = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.question) {
        const question = customEvent.detail.question;
        
        // Don't set the question text in the input field, just submit directly
        handleSubmitQuestion(question);
      }
    };
    
    window.addEventListener('ai-triple-tap-answer', handleTripleTapAnswer);
    
    // Clean up
    return () => {
      window.removeEventListener('ai-triple-tap-answer', handleTripleTapAnswer);
    };
  }, [handleSubmitQuestion]);

  const cardClassName = theme === "blackpink" 
    ? "backdrop-blur-sm bg-black/90 border-pink-500/30 flex flex-col h-[390px] shadow-xl" 
    : "backdrop-blur-sm bg-gray-950/70 border-gray-800 flex flex-col h-[390px] shadow-xl";

  const headerClassName = theme === "blackpink"
    ? "px-4 py-2 border-b border-pink-500/30"
    : "px-4 py-2 border-b border-gray-800";

  const titleClassName = theme === "blackpink"
    ? "text-lg flex items-center justify-between text-pink-400"
    : "text-lg flex items-center justify-between text-white";

  const clearButtonClassName = theme === "blackpink"
    ? "h-8 px-2 text-pink-400 hover:text-pink-300 border-pink-500/50"
    : "h-8 px-2 text-gray-400 hover:text-white";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col ai-chat-section"
    >
      <Card className={cardClassName}>
        <CardHeader className={headerClassName}>
          <CardTitle className={titleClassName}>
            <span>Medical Assistant</span>
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearChat}
                className={clearButtonClassName}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {connectionError && (
              <div className={theme === "blackpink" 
                ? "bg-red-900/30 border border-red-800 rounded-md p-3 flex items-start"
                : "bg-red-900/30 border border-red-800 rounded-md p-3 flex items-start"
              }>
                <WifiOff className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-300">
                    You appear to be offline. Please check your internet connection.
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">
                    The AI chat requires an internet connection to function.
                  </p>
                </div>
              </div>
            )}
            
            {isRateLimited && (
              <div className={theme === "blackpink" 
                ? "bg-pink-900/30 border border-pink-800 rounded-md p-3 flex items-start"
                : "bg-amber-900/30 border border-amber-800 rounded-md p-3 flex items-start"
              }>
                <AlertCircle className={`h-5 w-5 ${theme === "blackpink" ? "text-pink-500" : "text-amber-500"} mr-2 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`text-sm ${theme === "blackpink" ? "text-pink-300" : "text-amber-300"}`}>
                    Too many requests. Please wait a moment before trying again.
                  </p>
                  <p className={`text-xs ${theme === "blackpink" ? "text-pink-400/70" : "text-amber-400/70"} mt-1`}>
                    The AI service is currently experiencing high demand.
                  </p>
                </div>
              </div>
            )}
            
            {/* Display queue status if items are queued */}
            {queueStats.isQueueActive && !isRateLimited && (
              <div className={theme === "blackpink"
                ? "bg-pink-900/30 border border-pink-800 rounded-md p-3 flex items-start animate-pulse"
                : "bg-blue-900/30 border border-blue-800 rounded-md p-3 flex items-start animate-pulse"
              }>
                <Clock className={`h-5 w-5 ${theme === "blackpink" ? "text-pink-500" : "text-blue-500"} mr-2 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`text-sm ${theme === "blackpink" ? "text-pink-300" : "text-blue-300"}`}>
                    Request{queueStats.queueLength > 1 ? 's' : ''} queued ({queueStats.queueLength})
                  </p>
                  <p className={`text-xs ${theme === "blackpink" ? "text-pink-400/70" : "text-blue-400/70"} mt-1`}>
                    Estimated wait: ~{queueStats.estimatedWaitTime} seconds
                  </p>
                </div>
              </div>
            )}
            
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <EmptyChatState />
              ) : (
                messages.map((message) => (
                  <ChatMessageItem 
                    key={message.id}
                    message={message}
                    onCopy={handleCopyResponse}
                  />
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className={theme === "blackpink" ? "p-3 pt-2 border-t border-pink-500/30" : "p-3 pt-2 border-t border-gray-800"}>
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isDisabled={(isRateLimited && queueStats.queueLength >= 10) || connectionError} // Disable if rate limited AND queue is full or offline
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
};
