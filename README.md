# AI Interviewer

A comprehensive full-stack AI-powered interview system built with React, TypeScript, Node.js, and Express. This application allows candidates to take technical interviews with AI-generated questions and provides interviewers with detailed analytics and candidate management tools.

## 🌟 Features

### For Candidates
- **Resume Upload & Processing**: Upload PDF resumes with automatic information extraction using AI
- **AI-Powered Technical Interviews**: Dynamic question generation based on difficulty progression
- **Real-time Evaluation**: Instant feedback on answers with scoring
- **Interactive Timer System**: Time limits based on question difficulty (Easy: 20s, Medium: 60s, Hard: 120s)
- **Session Persistence**: Resume interrupted interviews with a "Welcome Back!" modal
- **Progress Tracking**: Visual progress indicators throughout the interview

### For Interviewers
- **Comprehensive Dashboard**: View all candidates with searchable and sortable tables
- **Detailed Analytics**: Question-by-question breakdown with AI feedback
- **Candidate Profiles**: Complete interview history and performance metrics
- **Data Export**: Export candidate data for external analysis
- **Persistence Management**: Debug and manage application state

### Technical Features
- **Redux Persistence**: Automatic state saving to localStorage with rehydration
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type-Safe Development**: Full TypeScript implementation
- **Modern UI Components**: Shadcn/UI component library
- **RESTful API**: Well-structured backend with comprehensive error handling

## 🏗️ Architecture

```
AI-Interviewer/
├── Frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── chat/       # Interview chat interface
│   │   │   ├── dashboard/  # Interviewer dashboard
│   │   │   ├── debug/      # Persistence management
│   │   │   ├── layout/     # Header and navigation
│   │   │   ├── modal/      # Welcome back modal
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── store/          # Redux store configuration
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── views/          # Page-level components
│   └── public/             # Static assets
└── Backend/                 # Node.js Express backend
    ├── src/
    │   ├── routes/         # API endpoints
    │   ├── types/          # TypeScript interfaces
    │   └── index.ts        # Server entry point
    └── uploads/            # File upload directory
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v20.19+ recommended)
- npm or yarn
- Anthropic Claude API key

### 1. Clone the Repository
```bash
git clone https://github.com/Samyak1602/AI-Interviewer.git
cd AI-Interviewer
```

### 2. Backend Setup
```bash
cd Backend
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=your_api_key_here

# Start the backend server
npm run dev
```

The backend will be running at `http://localhost:8080`

### 3. Frontend Setup
```bash
cd ../Frontend
npm install

# Start the frontend development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

### 4. Access the Application
- **Candidate Interface**: `http://localhost:5173/`
- **Interviewer Dashboard**: `http://localhost:5173/dashboard`

## 🎯 Usage Guide

### For Candidates

1. **Start Interview**
   - Upload your PDF resume
   - Information is automatically extracted and populated
   - Confirm your details and start the interview

2. **During Interview**
   - Answer questions within the time limit
   - Progress is automatically saved
   - If interrupted, you'll see a "Welcome Back!" modal on return

3. **Resume Functionality**
   - The system detects unfinished interviews (1-5 questions answered)
   - Choose "Resume" to continue or "Start Over" to reset

### For Interviewers

1. **View Candidates**
   - Access the dashboard to see all interview results
   - Search by name or email
   - Sort by score, name, or interview date

2. **Detailed Analysis**
   - Click on any candidate row for detailed breakdown
   - View question-by-question responses and scores
   - Access AI feedback for each answer

3. **Manage Data**
   - Use the Persistence Manager tab for debugging
   - Export data for external analysis
   - Clear stored data when needed

## 🔧 API Endpoints

### Resume Processing
- `POST /api/resume/extract-info` - Upload and process PDF resume

### Interview Management
- `POST /api/interview/start` - Begin new interview session
- `POST /api/interview/next-question` - Get next question
- `POST /api/interview/submit` - Submit answer for evaluation
- `POST /api/interview/summarize` - Generate final interview summary

### Health Check
- `GET /api/health` - Server status check

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **Redux Persist** - State persistence
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **Anthropic Claude API** - AI processing
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **CORS** - Cross-origin resource sharing

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=8080
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=development
```

## 📁 Key Features Implementation

### Welcome Back Modal
- **Automatic Detection**: Identifies unfinished sessions on app load
- **Session Recovery**: Resumes from the exact question where user left off
- **Progress Visualization**: Shows completion percentage and remaining questions
- **User Choice**: Option to resume or start fresh

### State Persistence
- **Automatic Saving**: All interview progress saved to localStorage
- **Rehydration**: State restored on app reload
- **Debug Tools**: Built-in persistence management interface
- **Data Export**: Export stored data for backup or analysis

### Interview Flow
- **Progressive Difficulty**: 2 Easy → 2 Medium → 2 Hard questions
- **Dynamic Timing**: Question-specific time limits
- **Real-time Evaluation**: Immediate AI-powered feedback
- **Comprehensive Scoring**: Detailed breakdown with final assessment

## 🧪 Development

### Build Commands
```bash
# Frontend
cd Frontend
npm run build        # Production build
npm run dev         # Development server
npm run lint        # Code linting

# Backend
cd Backend
npm run build       # TypeScript compilation
npm run dev         # Development server with hot reload
npm start           # Production server
```

### Adding New Components
1. Create component in appropriate directory under `src/components/`
2. Add to component exports if reusable
3. Include proper TypeScript types
4. Add to storybook if applicable

### Adding New API Endpoints
1. Create route handler in `src/routes/`
2. Add route to main server file
3. Include proper error handling
4. Add TypeScript interfaces for request/response

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add appropriate comments and documentation
- Ensure all builds pass before submitting

## 📞 Troubleshooting

### Common Issues

**Frontend won't start**
- Check Node.js version (20.19+ recommended)
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed

**Backend API errors**
- Verify Anthropic API key is set correctly
- Check backend server is running on port 8080
- Review backend logs for specific error messages

**Resume upload fails**
- Ensure file is PDF format and under 10MB
- Check backend has write permissions for uploads
- Verify Anthropic API key is valid

**Welcome Back modal not showing**
- Check Redux DevTools for state inspection
- Verify localStorage has persisted data
- Ensure interview was partially completed (1-5 questions)

### Debug Tools
- Use the Persistence Manager tab in the dashboard
- Check browser developer tools for console errors
- Use Redux DevTools extension for state debugging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic Claude API](https://anthropic.com) for AI-powered question generation and evaluation
- [Shadcn/UI](https://ui.shadcn.com) for beautiful, accessible components
- [Redux Toolkit](https://redux-toolkit.js.org) for efficient state management
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling

## 📊 Project Status

- ✅ Core interview functionality
- ✅ Resume processing with AI
- ✅ Candidate dashboard with analytics
- ✅ State persistence and session recovery
- ✅ Welcome back modal for interrupted sessions
- ✅ Real-time progress tracking
- 🔄 Advanced analytics and reporting (planned)
- 🔄 Multi-language support (planned)
- 🔄 Video interview integration (planned)

---

**Built with ❤️ by [Samyak1602](https://github.com/Samyak1602)**

For support or questions, please [open an issue](https://github.com/Samyak1602/AI-Interviewer/issues) on GitHub.