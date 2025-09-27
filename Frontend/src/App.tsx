import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import IntervieweeView from './views/IntervieweeView';
import InterviewerView from './views/InterviewerView';

function App() {
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
      </div>
    </Router>
  );
}

export default App;
