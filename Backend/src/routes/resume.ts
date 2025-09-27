import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Log initialization
console.log('Resume router initializing...');
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('Warning: ANTHROPIC_API_KEY not found in environment variables');
} else {
  console.log('Anthropic API key found, length:', process.env.ANTHROPIC_API_KEY.length);
}

// POST endpoint for resume information extraction
router.post('/extract-info', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No resume file provided',
        message: 'Please upload a PDF resume file'
      });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('ANTHROPIC')));
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not configured'
      });
    }

    console.log('API Key present:', process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);

    // Extract text from PDF
    let extractedText: string;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
      
      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({
          error: 'Empty PDF',
          message: 'The uploaded PDF appears to be empty or contains no extractable text'
        });
      }
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return res.status(400).json({
        error: 'PDF parsing failed',
        message: 'Unable to extract text from the uploaded PDF. Please ensure it\'s a valid PDF file.'
      });
    }

    // Prepare prompt for Claude API
    const prompt = `From the following resume text, extract the candidate's Full Name, Email Address, and Phone Number. Return the result as a clean JSON object with keys "name", "email", and "phone". If a field is not found, its value should be null.

Resume text:
${extractedText}`;

    // Call Claude API
    let extractedInfo;
    try {
      // Ensure we have a fresh client with the current API key
      const currentAnthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY!,
      });

      console.log('Calling Claude API...');
      const message = await currentAnthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      console.log('Claude API call successful');

      // Extract the response content
      const responseContent = message.content[0];
      if (responseContent.type === 'text') {
        // Try to parse JSON from the response
        const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedInfo = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in Claude response');
        }
      } else {
        throw new Error('Unexpected response format from Claude API');
      }
    } catch (claudeError) {
      console.error('Claude API error details:', {
        error: claudeError,
        message: claudeError instanceof Error ? claudeError.message : 'Unknown error',
        stack: claudeError instanceof Error ? claudeError.stack : undefined,
        apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
        apiKeyLength: process.env.ANTHROPIC_API_KEY?.length
      });
      
      // Check for specific error types
      if (claudeError instanceof Error) {
        if (claudeError.message.includes('401') || claudeError.message.includes('authentication') || claudeError.message.includes('api key')) {
          return res.status(500).json({
            error: 'AI service authentication failed',
            message: 'Invalid or missing API key for AI service'
          });
        }
        
        if (claudeError.message.includes('rate limit') || claudeError.message.includes('429')) {
          return res.status(500).json({
            error: 'AI service rate limit',
            message: 'AI service temporarily unavailable due to rate limiting'
          });
        }
        
        if (claudeError.message.includes('model') || claudeError.message.includes('not_found_error')) {
          return res.status(500).json({
            error: 'AI model unavailable',
            message: 'The AI model is currently unavailable. Please try again later.'
          });
        }
        
        if (claudeError.message.includes('X-Api-Key') || claudeError.message.includes('Authorization')) {
          return res.status(500).json({
            error: 'AI service configuration error',
            message: 'API key configuration issue'
          });
        }
      }
      
      return res.status(500).json({
        error: 'AI processing failed',
        message: 'Unable to process the resume content with AI service. Please try again.'
      });
    }

    // Validate extracted info structure
    if (!extractedInfo || typeof extractedInfo !== 'object') {
      return res.status(500).json({
        error: 'AI response parsing failed',
        message: 'Unable to parse AI response into expected format'
      });
    }

    // Ensure the response has the expected structure
    const result = {
      name: extractedInfo.name || null,
      email: extractedInfo.email || null,
      phone: extractedInfo.phone || null
    };

    // Return successful response
    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        filename: req.file.originalname,
        filesize: req.file.size,
        extractedTextLength: extractedText.length
      }
    });

  } catch (error) {
    console.error('Unexpected error in resume processing:', error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: 'Resume file size must be less than 10MB'
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        message: error.message
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your resume'
    });
  }
});

export default router;