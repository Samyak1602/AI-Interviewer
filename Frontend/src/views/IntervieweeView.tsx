import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { processResumeFile } from '@/utils/api';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { startInterview } from '@/store/chatSlice';
import ChatInterface from '@/components/chat/ChatInterface';

const IntervieweeView = () => {
  const dispatch = useAppDispatch();
  const { isInterviewStarted } = useAppSelector((state) => state.chat);
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      await processResumeFileInternal(file);
    } else {
      alert('Please select a valid PDF file.');
      event.target.value = '';
    }
  };

  const processResumeFileInternal = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await processResumeFile(file);
      
      if (result.success && result.data) {
        setFormData({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || ''
        });
      } else {
        throw new Error(result.message || 'Failed to process resume');
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      alert(`Error processing resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = resumeFile && formData.name && formData.email && formData.phone;

  const handleStartInterview = () => {
    if (isFormValid) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmStart = () => {
    dispatch(startInterview({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    }));
  };

  // If interview has started, show chat interface
  if (isInterviewStarted) {
    return <ChatInterface />;
  }

  // If showing confirmation, show confirmation screen
  if (showConfirmation) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center pb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Ready to Start?
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Please confirm your details before we begin the interview
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <span className="font-medium text-gray-700">Name: </span>
                <span className="text-gray-900">{formData.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email: </span>
                <span className="text-gray-900">{formData.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone: </span>
                <span className="text-gray-900">{formData.phone}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Resume: </span>
                <span className="text-gray-900">{resumeFile?.name}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Interview Format:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Multiple technical questions of varying difficulty</li>
                <li>• Each question has a time limit based on complexity</li>
                <li>• Easy: 20 seconds, Medium: 60 seconds, Hard: 120 seconds</li>
                <li>• Your answers will be evaluated in real-time</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Edit Details
              </Button>
              <Button
                onClick={handleConfirmStart}
                className="flex-1"
              >
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            AI Full Stack Developer Interview
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Please upload your resume and provide your details to begin
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6 pb-6">
          {/* Resume Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF only)</Label>
            <div className="relative">
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center space-y-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-600 font-medium">
                      Processing resume...
                    </span>
                  </>
                ) : resumeFile ? (
                  <>
                    <FileText className="h-8 w-8 text-green-600" />
                    <span className="text-sm text-green-600 font-medium truncate max-w-full px-2">
                      {resumeFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload your resume
                    </span>
                  </>
                )}
              </Button>
            </div>
            {resumeFile && !isProcessing && (
              <p className="text-sm text-blue-600 text-center">
                ✨ Resume processed! Information auto-filled below.
              </p>
            )}
          </div>

          {/* Personal Information Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!resumeFile || isProcessing}
                className={!resumeFile || isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!resumeFile || isProcessing}
                className={!resumeFile || isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!resumeFile || isProcessing}
                className={!resumeFile || isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
          </div>

          {/* Start Interview Button */}
          <Button
            className="w-full mt-6"
            disabled={!isFormValid}
            onClick={handleStartInterview}
          >
            Continue to Interview
          </Button>

          {!resumeFile && !isProcessing && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Please upload your resume to automatically fill in your information
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntervieweeView;