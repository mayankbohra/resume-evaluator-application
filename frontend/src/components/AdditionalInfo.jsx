const AdditionalInfo = ({ value, onChange, onSubmit }) => {
  return (
    <div className="w-full max-w-2xl">
      <textarea
        value={value}
        onChange={onChange}
        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Please provide any additional information you'd like to share..."
      ></textarea>
      <button
        onClick={onSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Submit
      </button>
    </div>
  );
};

export default AdditionalInfo;
