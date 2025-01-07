import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AdditionalInfo from './components/AdditionalInfo';
import ModernLoader from './components/ModernLoader';
import LandingPage from './components/LandingPage';
import { analyzeResume } from './services/api';
import { useScrollTop } from './hooks/useScrollTop';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [step, setStep] = useState(0); // Start with landing page
  const [files, setFiles] = useState({
    resume: null,
    jobDescription: null,
  });
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState({
    title: 'Initializing Analysis',
    description: 'Starting the resume analysis process...'
  });

  // Scroll to top when step changes
  useScrollTop(step);

  useEffect(() => {
    let timeoutIds = [];

    if (isLoading) {
      // Schedule loading messages
      timeoutIds.push(setTimeout(() => {
        setLoadingMessage({
          title: 'Extracting Information',
          description: 'Analyzing the job description requirements...'
        });
      }, 20000));

      timeoutIds.push(setTimeout(() => {
        setLoadingMessage({
          title: 'Processing Resume',
          description: 'Extracting key details from your resume...'
        });
      }, 40000));

      timeoutIds.push(setTimeout(() => {
        setLoadingMessage({
          title: 'Evaluating Compatibility',
          description: 'Checking how well your resume matches the job requirements...'
        });
      }, 60000));

      timeoutIds.push(setTimeout(() => {
        setLoadingMessage({
          title: 'Final Steps',
          description: 'Generating an improved version of your resume...'
        });
      }, 100000));
    }

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [isLoading]);

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

  const renderStepIndicator = (currentStep) => {
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center gap-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                  ${currentStep >= num
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-400'
                  } transition-colors duration-300`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`w-12 h-1 mx-1 rounded
                    ${currentStep > num ? 'bg-primary-600' : 'bg-secondary-100'}
                    transition-colors duration-300`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm text-secondary-600 text-center">
          Step {currentStep} of 3
        </div>
      </div>
    );
  };

  const renderBackButton = (targetStep) => (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setStep(targetStep)}
      className="mb-6 text-secondary-600 hover:text-secondary-800 transition-colors flex items-center gap-2 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Back
    </motion.button>
  );

  const renderStep = () => {
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="py-12"
        >
          <ModernLoader message={loadingMessage} />
        </motion.div>
      );
    }

    switch (step) {
      case 0:
        return <LandingPage onStart={() => setStep(1)} />;
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-4xl mx-auto text-center"
          >
            {renderBackButton(0)}
            {renderStepIndicator(1)}

            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6">
              Upload Your Documents
            </h2>

            {/* Side by side upload boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <FileUpload
                  label="Upload Resume"
                  onChange={handleFileChange('resume')}
                  file={files.resume}
                />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <FileUpload
                  label="Upload Job Description"
                  onChange={handleFileChange('jobDescription')}
                  file={files.jobDescription}
                />
              </div>
            </div>

            {files.resume && files.jobDescription && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setStep(2)}
                className={`${primaryButtonClass} px-8 py-3 rounded-lg text-sm font-medium transform hover:scale-105 transition-all duration-300`}
              >
                Continue
              </motion.button>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-4xl mx-auto text-center"
          >
            {renderBackButton(1)}
            {renderStepIndicator(2)}

            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6">
              Additional Information
            </h2>
            <p className="text-secondary-600 text-lg mb-8">
              Would you like to add any additional information not mentioned in your resume?
            </p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setShowAdditionalInfo(true);
                  setStep(3);
                }}
                className={`${primaryButtonClass} px-6 py-3 rounded-lg text-sm font-medium`}
              >
                Yes
              </button>
              <button
                onClick={() => handleSubmit('')}
                className={`${secondaryButtonClass} px-6 py-3 rounded-lg text-sm font-medium`}
              >
                No
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-4xl mx-auto text-center"
          >
            {renderBackButton(2)}
            {renderStepIndicator(3)}

            <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6">
              Additional Information
            </h2>
            <AdditionalInfo
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              onSubmit={() => handleSubmit(additionalInfo)}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-display font-bold text-secondary-800 mb-8 text-center">
              Analysis Results
            </h2>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {/* Score Card */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                  <h3 className="text-xl font-semibold mb-2 opacity-90">Overall Score</h3>
                  <div className="flex items-end justify-center gap-2">
                    <p className="text-5xl font-bold">{result?.["Evaluating Score"]}</p>
                    <p className="text-2xl mb-1">/10</p>
                  </div>
                </div>
              </div>

              {/* Evaluation Summary */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-secondary-200 transition-all duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-secondary-700">Evaluation Summary</h3>
                <p className="text-secondary-600 leading-relaxed">
                  {result?.["Evaluating Statement"]}
                </p>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-secondary-200 transition-all duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-secondary-700">
                  Improvement Suggestions
                </h3>
                <ul className="space-y-3">
                  {result?.Suggestions?.map((suggestion, index) => (
                    <li key={index} className="flex gap-3 text-secondary-600 group">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm transition-colors group-hover:bg-primary-200">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download Section */}
              <div className="lg:col-span-2 flex justify-center mt-6">
                {result?.improved_resume_path && (
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
                    className={`${primaryButtonClass} px-8 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transform hover:scale-105 transition-all duration-300`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Improved Resume
                  </button>
                )}
              </div>

              {/* Back to Home Button */}
              <div className="lg:col-span-2 flex justify-center mt-6">
                <button
                  onClick={handleReset}
                  className={`${secondaryButtonClass} px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transform hover:scale-105 transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                  </svg>
                  Start New Analysis
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${step === 0 ? '' : 'bg-white rounded-xl shadow-lg'} p-6 md:p-8 transition-shadow duration-300 hover:shadow-xl`}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
