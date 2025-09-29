import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import CountdownTimer from './CountdownTimer';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { submitAnswer, setAnswerSubmitting, addMessage, setCurrentQuestion } from '@/store/chatSlice';
import { cn } from '@/lib/utils';

// Helper function to get time limit based on difficulty
const getTimeLimit = (difficulty: 'Easy' | 'Medium' | 'Hard'): number => {
  switch (difficulty) {
    case 'Easy': return 20;
    case 'Medium': return 60;
    case 'Hard': return 120;
    default: return 60;
  }
};

// Fixed questions array with proper progression
const INTERVIEW_QUESTIONS = [
  {
    id: 'q1',
    content: 'Explain the difference between let, const, and var in JavaScript.',
    difficulty: 'Easy' as const
  },
  {
    id: 'q2',
    content: 'What are React Hooks and how do they work?',
    difficulty: 'Easy' as const
  },
  {
    id: 'q3', 
    content: 'What is the virtual DOM in React and how does it improve performance?',
    difficulty: 'Medium' as const
  },
  {
    id: 'q4',
    content: 'Explain middleware in Express.js and provide an example.',
    difficulty: 'Medium' as const
  },
  {
    id: 'q5',
    content: 'How would you design a RESTful API for an e-commerce application?',
    difficulty: 'Hard' as const
  },
  {
    id: 'q6',
    content: 'Explain database normalization and when you might denormalize.',
    difficulty: 'Hard' as const
  }
];

const ChatInterface = () => {
  const dispatch = useAppDispatch();
  const { 
    messages, 
    currentQuestion, 
    isAnswerSubmitting,
    questionsAnswered,
    intervieweeInfo 
  } = useAppSelector((state) => state.chat);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startQuestion = useCallback((questionIndex: number) => {
    if (questionIndex >= INTERVIEW_QUESTIONS.length) {
      // Interview completed
      dispatch(addMessage({
        type: 'ai',
        content: 'Thank you! That concludes our interview. Your responses will be evaluated and we\'ll get back to you soon.'
      }));
      return;
    }

    const question = INTERVIEW_QUESTIONS[questionIndex];
    const questionWithTimer = {
      ...question,
      timeLimit: getTimeLimit(question.difficulty)
    };

    dispatch(setCurrentQuestion(questionWithTimer));
    setIsTimerRunning(true);
  }, [dispatch]);

  // Start interview after welcome message or resume from persisted state
  useEffect(() => {
    // If we have a persisted interview session that's in progress
    if (messages.length > 1 && questionsAnswered > 0 && questionsAnswered < INTERVIEW_QUESTIONS.length && !currentQuestion && !processingRef.current) {
      // This is a resumed session, continue from where we left off
      processingRef.current = true;
      setInterviewStarted(true);
      
      setTimeout(() => {
        startQuestion(questionsAnswered);
        processingRef.current = false;
      }, 1000);
    }
    // If we have the welcome message but no questions asked yet (fresh start)
    else if (messages.length === 1 && questionsAnswered === 0 && !interviewStarted && !processingRef.current) {
      processingRef.current = true;
      setInterviewStarted(true);
      
      setTimeout(() => {
        startQuestion(0);
        processingRef.current = false;
      }, 2000);
    }
  }, [messages.length, questionsAnswered, currentQuestion, interviewStarted, startQuestion]);

  const handleSubmitAnswer = useCallback(() => {
    if (currentAnswer.trim() && !isAnswerSubmitting && !isProcessing) {
      setIsProcessing(true);
      setIsTimerRunning(false);
      
      // Submit the answer
      dispatch(submitAnswer(currentAnswer));
      setCurrentAnswer('');
      
      // Start processing
      dispatch(setAnswerSubmitting(true));
      
      setTimeout(() => {
        dispatch(setAnswerSubmitting(false));
        
        // Add feedback
        dispatch(addMessage({
          type: 'ai',
          content: 'Thank you for your answer. Let me ask you the next question.'
        }));
        
        // Move to next question after a delay
        setTimeout(() => {
          startQuestion(questionsAnswered); // questionsAnswered was just incremented in submitAnswer
          setIsProcessing(false);
        }, 1500);
        
      }, 2000);
    }
  }, [currentAnswer, isAnswerSubmitting, isProcessing, dispatch, questionsAnswered, startQuestion]);

  const handleTimeUp = useCallback(() => {
    if (isProcessing || isAnswerSubmitting) return;
    
    setIsProcessing(true);
    setIsTimerRunning(false);
    
    if (currentAnswer.trim()) {
      dispatch(submitAnswer(currentAnswer));
    } else {
      dispatch(submitAnswer('(No answer provided - time expired)'));
    }
    
    setCurrentAnswer('');
    
    dispatch(addMessage({
      type: 'ai',
      content: 'Time\'s up! Let\'s move on to the next question.'
    }));
    
    setTimeout(() => {
      startQuestion(questionsAnswered); // questionsAnswered was just incremented in submitAnswer
      setIsProcessing(false);
    }, 2000);
    
  }, [currentAnswer, isProcessing, isAnswerSubmitting, dispatch, questionsAnswered, startQuestion]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing && !isAnswerSubmitting) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const isInputDisabled = !currentQuestion || isAnswerSubmitting || isProcessing || !isTimerRunning;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            AI Interview - {intervieweeInfo?.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Full Stack Developer Position
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Question {questionsAnswered + 1} of {INTERVIEW_QUESTIONS.length}
          </p>
        </div>

        {/* Chat Messages */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 border-b">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              
              {(isAnswerSubmitting || isProcessing) && (
                <div key="processing-indicator" className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="text-sm text-gray-600">
                      AI is processing your answer...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Timer */}
            {currentQuestion && isTimerRunning && !isProcessing && (
              <div className="p-4 border-b">
                <CountdownTimer
                  key={`timer-${questionsAnswered}`}
                  initialTime={currentQuestion.timeLimit}
                  onTimeUp={handleTimeUp}
                  isActive={isTimerRunning && !isAnswerSubmitting && !isProcessing}
                  difficulty={currentQuestion.difficulty}
                />
              </div>
            )}

            {/* Answer Input */}
            <div className="p-4">
              <div className="space-y-3">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isInputDisabled}
                  placeholder={
                    !currentQuestion 
                      ? "Please wait for the interview to start..." 
                      : (isAnswerSubmitting || isProcessing)
                        ? "Processing your answer..." 
                        : "Type your answer here... (Press Enter to submit, Shift+Enter for new line)"
                  }
                  className={cn(
                    "w-full min-h-[80px] p-3 border border-gray-300 rounded-lg resize-none transition-colors",
                    "bg-white text-gray-900 placeholder-gray-500",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none",
                    isInputDisabled && "bg-gray-50 cursor-not-allowed text-gray-600"
                  )}
                />
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {currentAnswer.length} characters
                  </div>
                  
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isInputDisabled}
                    className="flex items-center gap-2"
                  >
                    {(isAnswerSubmitting || isProcessing) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Answer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;