import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Send, 
  Trash2, 
  Bot, 
  User, 
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useAIAssistant, AIMessage } from '@/hooks/useAIAssistant';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  className?: string;
  onAnalysisRequest?: () => void;
}

const MessageItem = ({ message }: { message: AIMessage }) => {
  const isUser = message.role === 'user';
  
  const getMessageIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'analysis':
        return <TrendingUp className="h-4 w-4" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageTypeLabel = () => {
    switch (message.type) {
      case 'analysis':
        return 'Analisis';
      case 'recommendation':
        return 'Rekomendasi';
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-all duration-200",
      isUser 
        ? "bg-primary/10 ml-8" 
        : "bg-muted/50 mr-8"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        {getMessageIcon()}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'Anda' : 'AI Assistant'}
          </span>
          {getMessageTypeLabel() && (
            <Badge variant="outline" className="text-xs">
              {getMessageTypeLabel()}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export const AIAssistant = ({ className, onAnalysisRequest }: AIAssistantProps) => {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isLoading,
    isAnalyzing,
    sendMessage,
    clearMessages
  } = useAIAssistant();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Bagaimana cara meningkatkan kualitas air kolam?",
    "Kapan waktu terbaik untuk panen ikan lele?",
    "Berapa jumlah pakan optimal per hari?",
    "Cara mengatasi ikan yang sering mati?"
  ];

  return (
    <Card className={cn("flex flex-col h-full max-h-[600px]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Konsultasi budidaya ikan dengan AI
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {onAnalysisRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAnalysisRequest}
                disabled={isAnalyzing}
                className="text-xs"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analisis...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Analisis Kolam
                  </>
                )}
              </Button>
            )}
            
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-xs text-muted-foreground"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm mb-4">
                  Mulai percakapan dengan AI Assistant untuk mendapatkan saran budidaya ikan
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pertanyaan yang sering diajukan:</p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-3 text-left justify-start text-xs hover:bg-muted/50"
                      onClick={() => {
                        setInput(question);
                        inputRef.current?.focus();
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex gap-3 p-4 rounded-lg bg-muted/50 mr-8">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI sedang berpikir...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanya tentang budidaya ikan..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};