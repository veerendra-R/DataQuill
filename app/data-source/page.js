'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

const SOURCE_TABS = [
  { key: 'file', label: 'File Upload' },
  { key: 'api', label: 'API Endpoint' },
  { key: 'mongo', label: 'MongoDB' },
  { key: 's3', label: 'S3 Bucket' }
];

export default function DataSourcePage() {
  const [tab, setTab] = useState('file');
  const [apiUrl, setApiUrl] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [s3Path, setS3Path] = useState('');
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const router = useRouter();

  // CSV upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    if (file && file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: false,
        complete: (results) => {
          if (results.meta.fields) {
            setColumns(results.meta.fields);
            setRows(results.data);
          }
        }
      });
    }
  };
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
  
  const handleNext = () => {
    const payload = {
      apiUrl, mongoUri, s3Path, fileName: file?.name || '', columns, rows
    };
    localStorage.setItem('dataSource', JSON.stringify(payload));
    router.push('/validation-rules');
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 px-2 sm:px-0">
      {/* Page Title & Description */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-gray-900 tracking-tight">Data Validation Tool</h1>
      <p className="text-center text-gray-600 mb-8 max-w-xl">
        Validate your data integrity with custom rules and get detailed insights into data quality issues across your datasets.
      </p>
      {/* Stepper */}
      <div className="flex justify-center gap-10 mb-10">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold border-2 border-blue-600">1</div>
          <div className="text-base font-medium mt-2">Data Source</div>
          <div className="text-xs text-gray-500 text-center">Upload or connect<br />your data</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold border-2 border-blue-400">2</div>
          <div className="text-base font-medium mt-2 text-gray-900">Validation Rules</div>
          <div className="text-xs text-gray-400 text-center">Define validation<br />criteria</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-blue-600 font-bold border-2 border-blue-400">3</div>
          <div className="text-base font-medium mt-2 text-gray-900">Results</div>
          <div className="text-xs text-gray-400 text-center">View validation<br />results</div>
        </div>
      </div>
      {/* Card */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <span className="mr-2 text-blue-600 text-2xl">🧾</span>
          Select Data Source
        </h2>
        <p className="mb-4 text-gray-600">Choose how you want to import your data for validation</p>
        {/* Tabs */}
        <div className="flex border rounded overflow-hidden mb-6 bg-gray-50">
          {SOURCE_TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              className={`flex-1 px-3 py-2 text-sm font-medium transition ${
                tab === tabItem.key
                  ? 'bg-white text-blue-600 shadow font-semibold'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setTab(tabItem.key)}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
        {/* Tab Contents */}
        {tab === 'file' && (
          <div>
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 mb-4 flex flex-col items-center justify-center">
              <span className="text-4xl mb-2 text-gray-400">📄</span>
              <p className="font-medium text-gray-700 mb-2">Drop your file here or click to browse</p>
              <label className="inline-block cursor-pointer text-blue-600 font-medium">
                <input
                  type="file"
                  accept=".csv,.json,.parquet"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm rounded shadow-sm border border-gray-300">
                  Choose file
                </span>
              </label>
              <div className="text-xs text-gray-400 mt-2">Supports CSV, JSON, and Parquet files</div>
              {file && (
                <div className="mt-4 w-full flex flex-col items-center">
                  <div className="bg-green-100 text-green-800 rounded px-4 py-2 w-full max-w-md text-left text-sm font-medium border border-green-300 mb-1">
                    Selected: <span className="font-semibold">{file.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    Size: <span className="font-semibold">{formatFileSize(file.size)}</span>
                  </div>
                </div>
              )}
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 rounded-lg mt-2 shadow-sm transition disabled:bg-gray-400"
              onClick={handleNext}
              disabled={!file}
            >
              Continue with File
            </button>
          </div>
        )}
        {tab === 'api' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter API URL"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white text-gray-900"
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 rounded-lg mt-2 shadow-sm transition disabled:bg-gray-400"
              onClick={handleNext}
              disabled={!apiUrl}
            >
              Continue with API
            </button>
          </div>
        )}
        {tab === 'mongo' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter MongoDB URI"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white text-gray-900"
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 rounded-lg mt-2 shadow-sm transition disabled:bg-gray-400"
              onClick={handleNext}
              disabled={!mongoUri}
            >
              Continue with MongoDB
            </button>
          </div>
        )}
        {tab === 's3' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter S3 Path"
              value={s3Path}
              onChange={(e) => setS3Path(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white text-gray-900"
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 rounded-lg mt-2 shadow-sm transition disabled:bg-gray-400"
              onClick={handleNext}
              disabled={!s3Path}
            >
              Continue with S3
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
