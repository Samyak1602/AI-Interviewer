import type { ChatState } from '@/store/chatSlice';

/**
 * Utility functions for interview session management
 */

/**
 * Check if there's an unfinished interview session
 * An unfinished session is one where:
 * - Interview has started (has interviewee info)
 * - Has answered at least 1 question but not all questions
 * - Is not currently in progress (not on a current question)
 */
export const hasUnfinishedSession = (chatState: ChatState): boolean => {
  const {
    isInterviewStarted,
    intervieweeInfo,
    questionsAnswered,
    totalQuestions,
    currentQuestion,
    isAnswerSubmitting
  } = chatState;

  // Must have interview started and interviewee info
  if (!isInterviewStarted || !intervieweeInfo) {
    return false;
  }

  // Must have answered at least 1 question but not all
  if (questionsAnswered === 0 || questionsAnswered >= totalQuestions) {
    return false;
  }

  // Should not be actively in the middle of answering a question
  if (currentQuestion && isAnswerSubmitting) {
    return false;
  }

  return true;
};

/**
 * Check if this is the first load after rehydration
 * Used to trigger the welcome back modal only once per app load
 */
export const shouldShowWelcomeBack = (
  chatState: ChatState,
  hasShownWelcomeBack: boolean
): boolean => {
  return hasUnfinishedSession(chatState) && !hasShownWelcomeBack;
};

/**
 * Calculate interview progress statistics
 */
export const getInterviewProgress = (chatState: ChatState) => {
  const { questionsAnswered, totalQuestions } = chatState;
  const percentage = Math.round((questionsAnswered / totalQuestions) * 100);
  const remaining = totalQuestions - questionsAnswered;

  return {
    answered: questionsAnswered,
    total: totalQuestions,
    remaining,
    percentage
  };
};

/**
 * Get the last activity timestamp from messages
 */
export const getLastActivityTime = (messages: ChatState['messages']): string | null => {
  if (messages.length === 0) return null;

  const lastMessage = messages[messages.length - 1];
  const timeDiff = Date.now() - lastMessage.timestamp;
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};