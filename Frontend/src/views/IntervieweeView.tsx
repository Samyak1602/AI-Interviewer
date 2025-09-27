import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { processResumeFile } from '@/utils/api';

const IntervieweeView = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
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
            onClick={() => {
              if (isFormValid) {
                console.log('Starting interview with:', { resumeFile, formData });
                // TODO: Handle interview start logic
              }
            }}
          >
            Start Interview
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