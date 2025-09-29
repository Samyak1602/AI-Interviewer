import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeResponse } from '../types/interview';

const router = Router();

// Log initialization
console.log('Interview router initializing...');
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY not found in environment variables');
} else {
  console.log('Anthropic API key found for interview router, length:', process.env.ANTHROPIC_API_KEY.length);
}

// Difficulty progression rules: 2 easy, 2 medium, 2 hard
const INTERVIEW_FLOW = [
  'easy', 'easy', 
  'medium', 'medium', 
  'hard', 'hard'
];

interface Question {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Helper function to call Claude API
async function callClaude(prompt: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const responseContent = message.content[0];
  if (responseContent.type === 'text') {
    return responseContent.text;
  } else {
    throw new Error('Unexpected response format from Claude API');
  }
}

// Helper function to extract JSON from Claude response
function extractJsonFromResponse(response: string): any {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, try to parse the entire response
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', response);
    throw new Error('Invalid JSON response from AI service');
  }
}

// POST /api/interview/start - Generate first question
router.post('/start', async (_req: Request, res: Response) => {
  try {
    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not configured'
      });
    }

    console.log('Starting interview - generating first question');

    const prompt = `Generate an easy-level interview question for a Full Stack (React/Node.js) developer role. 

The question should:
- Test fundamental knowledge
- Be appropriate for a junior to mid-level developer
- Focus on React, Node.js, JavaScript, or web development concepts
- Be clear and specific

Return ONLY a JSON object in this exact format:
{
  "question": "Your question here",
  "difficulty": "easy"
}`;

    const response = await callClaude(prompt);
    const questionData: Question = extractJsonFromResponse(response);

    // Validate response structure
    if (!questionData.question || !questionData.difficulty) {
      throw new Error('Invalid question format from AI service');
    }

    console.log('Generated first question:', questionData.question.substring(0, 100) + '...');

    return res.status(200).json({
      success: true,
      data: {
        question: questionData.question,
        difficulty: questionData.difficulty,
        questionNumber: 1,
        totalQuestions: INTERVIEW_FLOW.length
      }
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    
    if (error instanceof Error && error.message.includes('Claude')) {
      return res.status(500).json({
        error: 'AI service error',
        message: 'Failed to generate interview question'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while starting the interview'
    });
  }
});

// POST /api/interview/next-question - Generate next question based on current count
router.post('/next-question', async (req: Request, res: Response) => {
  try {
    const { questionCount } = req.body;

    // Validate input
    if (typeof questionCount !== 'number' || questionCount < 1 || questionCount >= INTERVIEW_FLOW.length) {
      return res.status(400).json({
        error: 'Invalid question count',
        message: `Question count must be between 1 and ${INTERVIEW_FLOW.length - 1}`
      });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not configured'
      });
    }

    const nextDifficulty = INTERVIEW_FLOW[questionCount];
    const nextQuestionNumber = questionCount + 1;

    console.log(`Generating question ${nextQuestionNumber} with difficulty: ${nextDifficulty}`);

    const prompt = `Generate a ${nextDifficulty}-level interview question for a Full Stack (React/Node.js) developer role.

The question should:
- Be appropriate for ${nextDifficulty} difficulty level
- Test knowledge of React, Node.js, JavaScript, databases, or web development
- ${nextDifficulty === 'easy' ? 'Focus on fundamental concepts' : ''}
- ${nextDifficulty === 'medium' ? 'Require deeper understanding and practical knowledge' : ''}
- ${nextDifficulty === 'hard' ? 'Test advanced concepts, system design, or complex problem-solving' : ''}
- Be clear and specific

Return ONLY a JSON object in this exact format:
{
  "question": "Your question here",
  "difficulty": "${nextDifficulty}"
}`;

    const response = await callClaude(prompt);
    const questionData: Question = extractJsonFromResponse(response);

    // Validate response structure
    if (!questionData.question || questionData.difficulty !== nextDifficulty) {
      throw new Error('Invalid question format from AI service');
    }

    console.log(`Generated question ${nextQuestionNumber}:`, questionData.question.substring(0, 100) + '...');

    return res.status(200).json({
      success: true,
      data: {
        question: questionData.question,
        difficulty: questionData.difficulty,
        questionNumber: nextQuestionNumber,
        totalQuestions: INTERVIEW_FLOW.length,
        isLastQuestion: nextQuestionNumber === INTERVIEW_FLOW.length
      }
    });

  } catch (error) {
    console.error('Error generating next question:', error);
    
    return res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate next interview question'
    });
  }
});

// POST /api/interview/submit - Evaluate answer
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;

    // Validate input
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Question is required and must be a string'
      });
    }

    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Answer is required and must be a string'
      });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not configured'
      });
    }

    console.log('Evaluating answer for question:', question.substring(0, 100) + '...');

    const prompt = `You are an expert interviewer for a Full Stack (React/Node.js) developer position. 

The question was: "${question}"

The candidate's answer is: "${answer}"

Evaluate the answer and provide:
1. A score from 1 to 10 (where 1 is completely wrong/irrelevant and 10 is perfect/comprehensive)
2. One sentence of constructive feedback

Consider:
- Technical accuracy
- Completeness of the answer
- Practical understanding
- Use of appropriate terminology
- Clarity of explanation

Return ONLY a JSON object in this exact format:
{
  "score": 8,
  "feedback": "Good understanding of the concept with clear examples, but could have mentioned edge cases."
}`;

    const response = await callClaude(prompt);
    const evaluationData: ClaudeResponse = extractJsonFromResponse(response);

    // Validate response structure
    if (typeof evaluationData.score !== 'number' || 
        evaluationData.score < 1 || 
        evaluationData.score > 10 || 
        !evaluationData.feedback || 
        typeof evaluationData.feedback !== 'string') {
      throw new Error('Invalid evaluation format from AI service');
    }

    console.log(`Answer evaluated - Score: ${evaluationData.score}/10`);

    return res.status(200).json({
      success: true,
      data: {
        score: evaluationData.score,
        feedback: evaluationData.feedback,
        question,
        answer
      }
    });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    
    return res.status(500).json({
      error: 'AI service error',
      message: 'Failed to evaluate the answer'
    });
  }
});

// POST /api/interview/summarize - Generate final interview summary
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { interviewHistory } = req.body;

    // Validate input
    if (!interviewHistory || !Array.isArray(interviewHistory.questions)) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Interview history with questions array is required'
      });
    }

    if (interviewHistory.questions.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Interview history cannot be empty'
      });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not configured'
      });
    }

    console.log(`Generating summary for interview with ${interviewHistory.questions.length} questions`);

    // Format interview transcript
    const transcript = interviewHistory.questions
      .map((item: any, index: number) => {
        return `Question ${index + 1} (${item.difficulty}): ${item.question}
Answer: ${item.answer}
Score: ${item.score}/10
Feedback: ${item.feedback}
---`;
      })
      .join('\n\n');

    const prompt = `Based on this Full Stack Developer interview transcript, provide a comprehensive evaluation:

${transcript}

Please:
1. Calculate a final weighted score out of 100 (considering difficulty: easy=1x, medium=1.5x, hard=2x weight)
2. Write a 3-4 sentence summary covering:
   - Overall performance assessment
   - Key strengths demonstrated
   - Areas for improvement
   - Technical knowledge level

Return ONLY a JSON object in this exact format:
{
  "finalScore": 78,
  "summary": "The candidate demonstrated solid foundational knowledge in React and JavaScript fundamentals, scoring well on basic concepts. They showed good problem-solving skills but struggled with advanced system design questions. Their understanding of Node.js and backend concepts needs improvement. Overall, they would be suitable for a junior to mid-level position with some mentoring."
}`;

    const response = await callClaude(prompt);
    const summaryData = extractJsonFromResponse(response);

    // Validate response structure
    if (typeof summaryData.finalScore !== 'number' || 
        summaryData.finalScore < 0 || 
        summaryData.finalScore > 100 || 
        !summaryData.summary || 
        typeof summaryData.summary !== 'string') {
      throw new Error('Invalid summary format from AI service');
    }

    console.log(`Interview summarized - Final Score: ${summaryData.finalScore}/100`);

    return res.status(200).json({
      success: true,
      data: {
        finalScore: summaryData.finalScore,
        summary: summaryData.summary,
        totalQuestions: interviewHistory.questions.length,
        averageScore: Math.round(
          interviewHistory.questions.reduce((sum: number, q: any) => sum + q.score, 0) / 
          interviewHistory.questions.length * 10
        ) / 10
      }
    });

  } catch (error) {
    console.error('Error generating interview summary:', error);
    
    return res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate interview summary'
    });
  }
});

export default router;