const LoadingState = ({ message }) => {
  return (
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>
      <div className="font-display">{message}</div>
    </div>
  );
};

export default LoadingState;
