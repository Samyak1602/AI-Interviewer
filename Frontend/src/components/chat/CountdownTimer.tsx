import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const CountdownTimer = ({ initialTime, onTimeUp, isActive, difficulty }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [hasCalledTimeUp, setHasCalledTimeUp] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setTimeLeft(initialTime);
    setHasCalledTimeUp(false);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  // Separate effect to handle time up condition
  useEffect(() => {
    if (timeLeft === 0 && isActive && !hasCalledTimeUp) {
      setHasCalledTimeUp(true);
      // Use setTimeout to ensure this runs after render
      setTimeout(() => onTimeUp(), 0);
    }
  }, [timeLeft, isActive, onTimeUp, hasCalledTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (timeLeft / initialTime) * 100;
  };

  const getColorClasses = () => {
    const percentage = getProgressPercentage();
    if (percentage <= 25) {
      return {
        text: 'text-red-600',
        bg: 'bg-red-500',
        border: 'border-red-300',
        ring: 'ring-red-100'
      };
    } else if (percentage <= 50) {
      return {
        text: 'text-yellow-600',
        bg: 'bg-yellow-500',
        border: 'border-yellow-300',
        ring: 'ring-yellow-100'
      };
    } else {
      return {
        text: 'text-green-600',
        bg: 'bg-green-500',
        border: 'border-green-300',
        ring: 'ring-green-100'
      };
    }
  };

  const colors = getColorClasses();
  const isLowTime = getProgressPercentage() <= 25;

  return (
    <div className={cn(
      "relative p-4 rounded-lg border-2 transition-all duration-300",
      colors.border,
      colors.ring,
      isLowTime && isActive && "animate-pulse shadow-lg ring-4"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={cn("w-5 h-5", colors.text)} />
          <span className="font-medium text-gray-700">
            Time Remaining
          </span>
          {isLowTime && isActive && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            difficulty === 'Easy' && "bg-green-100 text-green-800",
            difficulty === 'Medium' && "bg-yellow-100 text-yellow-800",
            difficulty === 'Hard' && "bg-red-100 text-red-800"
          )}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div className={cn(
          "text-3xl font-mono font-bold transition-colors",
          colors.text
        )}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            colors.bg
          )}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Warning Message */}
      {isLowTime && isActive && (
        <div className="mt-2 text-center text-sm text-red-600 font-medium">
          ⚠️ Time is running out!
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;