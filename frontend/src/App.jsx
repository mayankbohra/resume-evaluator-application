import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AdditionalInfo from './components/AdditionalInfo';
import LoadingState from './components/LoadingState';
import { analyzeResume } from './services/api';

function App() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({
    resume: null,
    jobDescription: null,
  });
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test backend connection on component mount
    const testConnection = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/health`);
        const data = await response.json();
        console.log('Backend health check:', data);
      } catch (error) {
        console.error('Backend connection error:', error);
      }
    };

    testConnection();
  }, []);

  const handleFileChange = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async (additionalText = '') => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', files.resume);
    formData.append('job_description', files.jobDescription);
    formData.append('additional_info', additionalText);

    try {
      const response = await analyzeResume(formData);
      console.log('Analysis response:', response);
      if (!response || !response["Evaluating Score"]) {
        throw new Error('Invalid response from server');
      }
      setResult(response);
      setStep(4);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'An error occurred while analyzing your resume. Please try again.');
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFiles({
      resume: null,
      jobDescription: null,
    });
    setAdditionalInfo('');
    setResult(null);
    setError(null);
  };

  const buttonBaseClass = "transition-all duration-200 active:scale-95 hover:shadow-md";
  const primaryButtonClass = `${buttonBaseClass} bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`;
  const secondaryButtonClass = `${buttonBaseClass} bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-2 focus:ring-secondary-300 focus:ring-offset-2`;

  const renderResults = () => {
    if (error) {
      return (
        <div className="text-center">
          <div className="text-red-600 animate-fade-in mb-4">{error}</div>
          <button
            onClick={handleReset}
            className={`${primaryButtonClass} px-6 py-2.5 rounded-lg text-sm font-medium`}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!result || !result["Evaluating Score"]) {
      return (
        <div className="text-center">
          <div className="text-red-600 animate-fade-in mb-4">
            Invalid response format received
          </div>
          <button
            onClick={handleReset}
            className={`${primaryButtonClass} px-6 py-2.5 rounded-lg text-sm font-medium`}
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <h3 className="text-base font-semibold mb-1 opacity-90">Overall Score</h3>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold">{result?.["Evaluating Score"]}</p>
            <p className="text-lg mb-1">/10</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border border-secondary-200 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-base font-semibold mb-3 text-secondary-700">Evaluation Summary</h3>
          <p className="text-secondary-600 leading-relaxed text-sm">
            {result?.["Evaluating Statement"]}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border border-secondary-200 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-base font-semibold mb-3 text-secondary-700">
            Improvement Suggestions
          </h3>
          <ul className="space-y-3">
            {result?.Suggestions?.map((suggestion, index) => (
              <li key={index} className="flex gap-3 text-secondary-600 group">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-xs transition-colors group-hover:bg-primary-200">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {result?.improved_resume_path && (
          <div className="flex justify-center mt-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/${result.improved_resume_path}`);
                  if (!response.ok) throw new Error('Failed to download resume');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'improved_resume.pdf';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Error downloading resume:', error);
                  alert('Failed to download resume. Please try again.');
                }
              }}
              className={`${primaryButtonClass} px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Improved Resume
            </button>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleReset}
            className={`${primaryButtonClass} px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="py-8">
          <LoadingState
            message={
              <>
                <span className="block text-lg font-display font-semibold text-secondary-700 mb-1">
                  Analyzing Your Resume
                </span>
                <span className="text-secondary-500 text-sm">
                  Our AI is carefully evaluating your profile against the job requirements...
                </span>
              </>
            }
          />
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6 w-full max-w-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Documents</h2>
            <FileUpload
              label="Upload Resume"
              onChange={handleFileChange('resume')}
              file={files.resume}
            />
            <FileUpload
              label="Upload Job Description"
              onChange={handleFileChange('jobDescription')}
              file={files.jobDescription}
            />
            {files.resume && files.jobDescription && (
              <button
                onClick={() => setStep(2)}
                className={`${primaryButtonClass} w-full py-2.5 rounded-lg text-sm font-medium`}
              >
                Continue
              </button>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 w-full max-w-xl">
            <h2 className="text-xl font-semibold text-gray-800">Additional Information</h2>
            <p className="text-gray-600 text-sm">Would you like to add any additional information not mentioned in your resume?</p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setShowAdditionalInfo(true);
                  setStep(3);
                }}
                className={`${primaryButtonClass} px-5 py-2 rounded-lg text-sm font-medium`}
              >
                Yes
              </button>
              <button
                onClick={() => handleSubmit('')}
                className={`${secondaryButtonClass} px-5 py-2 rounded-lg text-sm font-medium`}
              >
                No
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <AdditionalInfo
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              onSubmit={() => handleSubmit(additionalInfo)}
            />
          </div>
        );
      case 4:
        return (
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6 text-center">
              Analysis Results
            </h2>
            {renderResults()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold text-secondary-800 text-center mb-2">
                Resume Analyzer
              </h1>
              <p className="text-center text-secondary-500 max-w-lg mx-auto text-sm">
                Let our AI analyze your resume against the job description and provide personalized insights.
              </p>
              {step < 4 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                            step >= num
                              ? 'bg-primary-600 text-white'
                              : 'bg-secondary-100 text-secondary-400'
                          }`}
                        >
                          {num}
                        </div>
                        {num < 3 && (
                          <div
                            className={`w-12 h-1 mx-1 rounded ${
                              step > num ? 'bg-primary-600' : 'bg-secondary-100'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
