# AI Interviewer Backend

A Node.js/Express backend for the AI Interviewer application with resume processing capabilities.

## Features

- Resume upload and PDF text extraction
- AI-powered information extraction using Claude API
- RESTful API endpoints
- TypeScript support
- CORS enabled for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Anthropic API key to the `.env` file:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Resume Processing
- **POST** `/api/resume/extract-info`
- Accepts multipart/form-data with a `resume` field containing a PDF file
- Extracts text from PDF and uses Claude AI to extract candidate information
- Returns JSON with extracted name, email, and phone number

#### Request Format
```javascript
const formData = new FormData();
formData.append('resume', pdfFile);

fetch('http://localhost:8080/api/resume/extract-info', {
  method: 'POST',
  body: formData,
})
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "metadata": {
    "filename": "resume.pdf",
    "filesize": 245760,
    "extractedTextLength": 2148
  }
}
```

#### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Environment Variables

- `PORT`: Server port (default: 8080)
- `ANTHROPIC_API_KEY`: Required API key for Claude AI
- `NODE_ENV`: Environment (development/production)

## File Upload Limits

- Maximum file size: 10MB
- Accepted file types: PDF only
- Single file upload per request

## Error Handling

The API includes comprehensive error handling for:
- Missing or invalid files
- PDF parsing errors
- AI service failures
- File size limits
- Authentication issues