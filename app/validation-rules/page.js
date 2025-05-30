'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ValidationRulesPage() {
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [sourceType, setSourceType] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [rules, setRules] = useState([
    { columnName: '', dataType: '', allowNull: false, regex: '', min: '', max: '' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('dataSource');
    if (stored) {
      const data = JSON.parse(stored);
      if (Array.isArray(data.columns)) setColumns(data.columns);
      setSourceType(data.apiUrl ? 'API' : data.mongoUri ? 'MongoDB' : data.s3Path ? 'S3' : 'File');
      setSourceName(data.apiUrl || data.mongoUri || data.s3Path || data.fileName || '');
    }
    // Restore previous rules if available
    const storedRules = localStorage.getItem('validationRules');
    if (storedRules) {
      try {
        const parsed = JSON.parse(storedRules);
        if (Array.isArray(parsed) && parsed.length > 0) setRules(parsed);
      } catch {}
    }
  }, []);

  // Handle rule changes
  const handleRuleChange = (index, key, value) => {
    const updatedRules = [...rules];
    updatedRules[index][key] = value;
    setRules(updatedRules);
  };

  const addRule = () => {
    setRules([...rules, { columnName: '', dataType: '', allowNull: false, regex: '', min: '', max: '' }]);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const runValidation = () => {
    localStorage.setItem('validationRules', JSON.stringify(rules));
    router.push('/results');
  };

  // Stepper style helpers
  const stepLine = (active) =>
    `flex-1 border-t-2 transition-all duration-300 ${active ? 'border-blue-500' : 'border-gray-300'}`;
  const stepCircle = (active, done) =>
    `w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold 
     ${done ? 'bg-green-500 border-green-500 text-white' : active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-400 text-blue-500'}`;

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 px-2 sm:px-0 bg-[#f6f9fc]">
      {/* Stepper */}
      <div className="w-full max-w-3xl flex items-center justify-center mb-8 select-none">
        <div className="flex flex-1 items-center">
          <div className={stepCircle(false, true)}><span className="text-lg">&#10003;</span></div>
          <div className={stepLine(true)}></div>
          <div className={stepCircle(true, false)}>2</div>
          <div className={stepLine(false)}></div>
          <div className={stepCircle(false, false)}>3</div>
        </div>
      </div>
      {/* Step Labels */}
      <div className="flex max-w-2xl w-full justify-between mb-8">
        <div className="flex flex-col items-center flex-1">
          <span className="font-medium text-green-600">Data Source</span>
          <span className="text-xs text-gray-500">Upload or connect your data</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-medium text-blue-600">Validation Rules</span>
          <span className="text-xs text-gray-500">Define validation criteria</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-medium text-blue-400">Results</span>
          <span className="text-xs text-gray-400">View validation results</span>
        </div>
      </div>
      {/* Card */}
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center mb-3">
          <span className="text-blue-600 mr-2 text-2xl">🔎</span>
          <h2 className="text-xl font-bold">Setup Validation Rules</h2>
        </div>
        <p className="mb-5 text-gray-600">Define validation rules for each column in your dataset</p>
        {/* Data Source Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-3 mb-4 text-blue-900">
          <div className="font-semibold">Data Source: <span className="text-blue-800">{sourceName}</span></div>
          <div className="text-xs text-blue-800">Type: {sourceType}</div>
        </div>
        {/* Available columns as tags */}
        {columns.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold text-gray-900 mb-2">Available Columns</div>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => (
                <span key={col} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 border">{col}</span>
              ))}
            </div>
          </div>
        )}
        {/* Validation Rules */}
        <div className="font-semibold text-gray-900 mb-2">Validation Rules</div>
        {rules.map((rule, index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-4 items-end">
            {/* Column Name */}
            <select
              className="col-span-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
              value={rule.columnName}
              onChange={(e) => handleRuleChange(index, 'columnName', e.target.value)}
            >
              <option value="">Column</option>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
            {/* Data Type */}
            <select
              className="col-span-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
              value={rule.dataType}
              onChange={(e) => handleRuleChange(index, 'dataType', e.target.value)}
            >
              <option value="">Data Type</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </select>
            {/* Allow Null */}
            <div className="col-span-1 flex items-center gap-2">
              <label htmlFor={`allowNull-${index}`} className="text-sm font-medium text-gray-700">Allow Null</label>
              <input
                id={`allowNull-${index}`}
                type="checkbox"
                checked={rule.allowNull}
                onChange={(e) => handleRuleChange(index, 'allowNull', e.target.checked)}
                className="rounded border-gray-300 accent-blue-600"
              />
            </div>
            {/* Min Value */}
            <input
              type="text"
              value={rule.min}
              onChange={(e) => handleRuleChange(index, 'min', e.target.value)}
              placeholder="Min Value"
              className="col-span-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
            />
            {/* Max Value */}
            <input
              type="text"
              value={rule.max}
              onChange={(e) => handleRuleChange(index, 'max', e.target.value)}
              placeholder="Max Value"
              className="col-span-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
            />
            {/* Regex */}
            <input
              type="text"
              value={rule.regex}
              onChange={(e) => handleRuleChange(index, 'regex', e.target.value)}
              placeholder="Regex Pattern"
              className="col-span-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900"
            />
            {/* Remove Rule */}
            {rules.length > 1 && (
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="ml-2 px-2 py-1 text-xs text-red-500 font-medium rounded hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {/* Add/Back/Run buttons */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={() => router.push('/data-source')}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-base font-medium hover:bg-gray-200 text-black"
          >
            Back
          </button>
          <button
            onClick={addRule}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-base font-medium hover:bg-gray-100 text-black"
          >
            + Add Rule
          </button>
          <button
            onClick={runValidation}
            className="flex-1 bg-[#131a25] hover:bg-blue-900 text-white text-base font-semibold py-3 rounded-lg shadow-sm transition"
          >
            Run Validation
          </button>
        </div>
      </div>
    </div>
  );
}
