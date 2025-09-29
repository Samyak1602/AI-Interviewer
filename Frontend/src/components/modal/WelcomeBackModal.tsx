import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MessageCircle, User } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { resetToInitialState } from '@/store/chatSlice';
import { getInterviewProgress, getLastActivityTime } from '@/utils/sessionUtils';

interface WelcomeBackModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartOver: () => void;
}

const WelcomeBackModal = ({ isOpen, onResume, onStartOver }: WelcomeBackModalProps) => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat);
  const { intervieweeInfo, messages } = chatState;

  const handleResume = () => {
    onResume();
  };

  const handleStartOver = () => {
    dispatch(resetToInitialState());
    onStartOver();
  };

  const progress = getInterviewProgress(chatState);
  const lastActivity = getLastActivityTime(messages);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            We found an unfinished interview session. Would you like to continue where you left off?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Interview Progress Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Interview Progress</span>
                  <span className="text-sm font-bold text-blue-700">
                    {progress.answered}/{progress.total} questions
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>{progress.percentage}% complete</span>
                  <span>Last activity: {lastActivity}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Candidate:</span>
              <span className="font-medium text-gray-900">{intervieweeInfo?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Position:</span>
              <span className="font-medium text-gray-900">Full Stack Developer</span>
            </div>
          </div>

          {/* Session Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-3 h-3 text-yellow-800" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Session In Progress</p>
                <p className="text-xs text-yellow-700 mt-1">
                  You have {progress.remaining} questions remaining to complete your interview.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="flex-1"
          >
            Start Over
          </Button>
          <Button
            onClick={handleResume}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Resume Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBackModal;