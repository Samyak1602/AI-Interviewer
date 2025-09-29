import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { shouldShowWelcomeBack } from './utils/sessionUtils';
import { useAppSelector } from './store/hooks';
import Header from './components/layout/Header';
import IntervieweeView from './views/IntervieweeView';
import InterviewerView from './views/InterviewerView';
import WelcomeBackModal from './components/modal/WelcomeBackModal';

// Loading component for PersistGate
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// AppContent component to handle the modal logic inside Provider context
const AppContent = () => {
  const chatState = useAppSelector((state) => state.chat);
  const [hasShownWelcomeBack, setHasShownWelcomeBack] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Check for unfinished session after rehydration
  useEffect(() => {
    if (shouldShowWelcomeBack(chatState, hasShownWelcomeBack)) {
      setShowWelcomeBack(true);
      setHasShownWelcomeBack(true);
    }
  }, [chatState, hasShownWelcomeBack]);

  const handleResumeInterview = () => {
    setShowWelcomeBack(false);
    // The interview will continue from where it left off automatically
    // due to the persisted state
  };

  const handleStartOver = () => {
    setShowWelcomeBack(false);
    // The resetToInitialState action is dispatched in the modal
    // This will reset the interview state
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<IntervieweeView />} />
            <Route path="/dashboard" element={<InterviewerView />} />
          </Routes>
        </main>
        
        <WelcomeBackModal
          isOpen={showWelcomeBack}
          onResume={handleResumeInterview}
          onStartOver={handleStartOver}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;
