const IntervieweeView = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Interview
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Get ready for an AI-powered interview experience
        </p>
        
        <div className="bg-white shadow rounded-lg p-8">
          <div className="space-y-6">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Interview Instructions
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet environment for the interview</li>
                <li>Have your camera and microphone ready</li>
                <li>Be prepared to answer questions about your experience</li>
              </ul>
            </div>
            
            <div className="border-t pt-6">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeView;