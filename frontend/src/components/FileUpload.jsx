const FileUpload = ({ label, onChange, accept = ".pdf", file }) => {
  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
        file ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-gray-50'
      } border-dashed rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-opacity-70 ${
        file ? 'hover:bg-green-100' : 'hover:bg-gray-100'
      }`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {!file ? (
            <>
              <svg className="w-8 h-8 mb-4 text-blue-500 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold hover:text-gray-700 transition-colors">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">{label} (PDF)</p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 mb-4 text-green-500 transition-transform duration-300 hover:scale-110" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="mb-2 text-sm text-green-600 font-semibold">File uploaded successfully!</p>
              <p className="text-xs text-green-500">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1 transition-colors hover:text-gray-700">(Click to change file)</p>
            </>
          )}
        </div>
        <input type="file" className="hidden" accept={accept} onChange={onChange} />
      </label>
    </div>
  );
};

export default FileUpload;
