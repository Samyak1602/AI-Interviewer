import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

const ChatMessage = ({ type, content = '', timestamp = Date.now() }: ChatMessageProps) => {
  const formatTime = (ts: number) => {
    try {
      return new Date(ts).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
  };

  const isUser = type === 'user';
  
  // Validate content is a string to prevent runtime errors
  const safeContent = typeof content === 'string' ? content : String(content || '');

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-blue-500 text-white" 
          : "bg-gray-100 text-gray-600"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message bubble */}
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2 break-words",
        isUser 
          ? "bg-blue-500 text-white rounded-br-sm" 
          : "bg-gray-100 text-gray-900 rounded-bl-sm"
      )}>
        {/* Parse markdown-like formatting for questions */}
        <div className="text-sm leading-relaxed">
          {safeContent ? safeContent.split('\n').map((line, index) => (
            <div key={`line-${index}`}>
              {line.startsWith('**') && line.endsWith('**') ? (
                <strong className="font-semibold">
                  {line.slice(2, -2)}
                </strong>
              ) : (
                line || '\u00A0' /* Non-breaking space for empty lines */
              )}
            </div>
          )) : (
            <div className="text-gray-500 italic">No message content</div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={cn(
          "text-xs mt-1 opacity-70",
          isUser ? "text-blue-100" : "text-gray-500"
        )}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;