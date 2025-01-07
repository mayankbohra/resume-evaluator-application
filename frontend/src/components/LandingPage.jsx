import { motion } from 'framer-motion';

const LandingPage = ({ onStart }) => {
  const features = [
    {
      icon: "📊",
      title: "AI-Powered Analysis",
      description: "Advanced AI algorithms analyze your resume against job descriptions for precise matching."
    },
    {
      icon: "💡",
      title: "Smart Suggestions",
      description: "Get tailored recommendations to improve your resume and increase your chances of success."
    },
    {
      icon: "📝",
      title: "Resume Generation",
      description: "Automatically generate an improved version of your resume based on the analysis."
    },
    {
      icon: "🎯",
      title: "Detailed Scoring",
      description: "Receive a comprehensive score and evaluation of your resume's compatibility with the job."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto text-center"
    >
      <motion.h1
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-4xl md:text-5xl font-display font-bold text-secondary-800 mb-6"
      >
        Resume Analyzer & Enhancer
      </motion.h1>

      <motion.p
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-secondary-600 mb-12 max-w-2xl mx-auto"
      >
        Optimize your job applications with our AI-powered resume analysis tool. Get instant feedback,
        personalized suggestions, and an improved version of your resume tailored to your target job.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-secondary-700 mb-2">{feature.title}</h3>
            <p className="text-secondary-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-secondary-800 mb-4">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex-1 max-w-xs">
            <div className="text-3xl mb-3">1️⃣</div>
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">Upload Documents</h3>
            <p className="text-secondary-600 text-sm">Upload your resume and the job description you're targeting</p>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="text-3xl mb-3">2️⃣</div>
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">AI Analysis</h3>
            <p className="text-secondary-600 text-sm">Our AI analyzes the match and identifies improvement areas</p>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="text-3xl mb-3">3️⃣</div>
            <h3 className="text-lg font-semibold text-secondary-700 mb-2">Get Results</h3>
            <p className="text-secondary-600 text-sm">Receive detailed feedback and an improved version of your resume</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onStart}
        className="mt-12 px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700
          transition-colors duration-300 transform hover:scale-105"
      >
        Get Started
      </motion.button>
    </motion.div>
  );
};

export default LandingPage;
