// Utility functions for frontend-backend integration

export const API_BASE_URL = 'http://localhost:8080';

export interface ResumeProcessingResult {
  success: boolean;
  data?: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  metadata?: {
    filename: string;
    filesize: number;
    extractedTextLength: number;
  };
  error?: string;
  message?: string;
}

export async function processResumeFile(file: File): Promise<ResumeProcessingResult> {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/api/resume/extract-info`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Unknown error',
        message: result.message || 'Failed to process resume'
      };
    }

    return result;
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      error: 'Network Error',
      message: error instanceof Error ? error.message : 'Failed to connect to server'
    };
  }
}