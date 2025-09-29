import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface Question {
  id: string;
  content: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in seconds
}

export interface ChatState {
  messages: ChatMessage[];
  currentQuestion: Question | null;
  isInterviewStarted: boolean;
  isAnswerSubmitting: boolean;
  questionsAnswered: number;
  totalQuestions: number;
  intervieweeInfo: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

const initialState: ChatState = {
  messages: [],
  currentQuestion: null,
  isInterviewStarted: false,
  isAnswerSubmitting: false,
  questionsAnswered: 0,
  totalQuestions: 6, // Default total questions
  intervieweeInfo: null,
};

// Helper function to get time limit based on difficulty
const getTimeLimit = (difficulty: Question['difficulty']): number => {
  switch (difficulty) {
    case 'Easy': return 20;
    case 'Medium': return 60;
    case 'Hard': return 120;
    default: return 60;
  }
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ name: string; email: string; phone: string }>) => {
      state.isInterviewStarted = true;
      state.intervieweeInfo = action.payload;
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: `Hello ${action.payload.name}! Welcome to your AI Full Stack Developer Interview. I'll be asking you a series of questions to assess your technical skills. Let's begin!`,
        timestamp: Date.now(),
      };
      
      // Ensure no duplicate IDs and validate content
      if (welcomeMessage.content && !state.messages.find(msg => msg.id === welcomeMessage.id)) {
        state.messages.push(welcomeMessage);
      }
    },
    
    addMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        content: typeof action.payload.content === 'string' ? action.payload.content : String(action.payload.content || ''),
        type: action.payload.type,
      };
      
      // Ensure no duplicate IDs (extra safety)
      if (!state.messages.find(existingMessage => existingMessage.id === message.id)) {
        state.messages.push(message);
      }
    },
    
    setCurrentQuestion: (state, action: PayloadAction<Omit<Question, 'timeLimit'> | null>) => {
      if (action.payload === null) {
        state.currentQuestion = null;
        return;
      }
      
      const question: Question = {
        ...action.payload,
        timeLimit: getTimeLimit(action.payload.difficulty),
      };
      state.currentQuestion = question;
      
      // Add question as AI message without the **Question** formatting
      const questionMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: typeof question.content === 'string' ? question.content : String(question.content || ''),
        timestamp: Date.now(),
      };
      
      // Ensure content exists and no duplicate IDs
      if (questionMessage.content && !state.messages.find(msg => msg.id === questionMessage.id)) {
        state.messages.push(questionMessage);
      }
    },
    
    submitAnswer: (state, action: PayloadAction<string>) => {
      if (action.payload.trim()) {
        const answerMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          type: 'user',
          content: action.payload,
          timestamp: Date.now(),
        };
        state.messages.push(answerMessage);
      }
      
      state.questionsAnswered += 1;
      state.isAnswerSubmitting = true;
    },
    
    setAnswerSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isAnswerSubmitting = action.payload;
    },
    
    clearChat: (state) => {
      state.messages = [];
      state.currentQuestion = null;
      state.isInterviewStarted = false;
      state.isAnswerSubmitting = false;
      state.questionsAnswered = 0;
      state.intervieweeInfo = null;
    },
    
    resetToInitialState: () => {
      return initialState;
    },
  },
});

export const {
  startInterview,
  addMessage,
  setCurrentQuestion,
  submitAnswer,
  setAnswerSubmitting,
  clearChat,
  resetToInitialState,
} = chatSlice.actions;

export default chatSlice.reducer;