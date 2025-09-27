// Type definitions for the resume processing API

export interface ExtractedResumeInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ResumeProcessingResponse {
  success: boolean;
  data: ExtractedResumeInfo;
  metadata: {
    filename: string;
    filesize: number;
    extractedTextLength: number;
  };
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export class ResumeProcessingError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ResumeProcessingError';
    this.statusCode = statusCode;
  }
}