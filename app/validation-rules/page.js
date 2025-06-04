'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import yaml from 'yaml';

export default function ValidationRulesPage() {
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [sourceType, setSourceType] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [rules, setRules] = useState([
    { columnName: '', dataType: '', allowNull: false, regex: '', min: '', max: '' },
  ]);
  const [schemaText, setSchemaText] = useState('');
  const [schemaFileName, setSchemaFileName] = useState('');
  const [parseError, setParseError] = useState('');

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
    const storedSchema = localStorage.getItem('expectedSchema');
    if (storedSchema) {
      try {
        const parsed = JSON.parse(storedSchema);
        if (parsed.schemaText) setSchemaText(parsed.schemaText);
        if (parsed.schemaFileName) setSchemaFileName(parsed.schemaFileName);
        if (Array.isArray(parsed.rules) && parsed.rules.length) {
          setRules(parsed.rules);
          setColumns(parsed.rules.map(r => r.columnName));
        }
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

  const convertSchema = (obj) => {
    if (!obj) return [];
    let arr = [];
    if (Array.isArray(obj)) arr = obj;
    else if (Array.isArray(obj.columns)) arr = obj.columns;
    else if (typeof obj === 'object')
      arr = Object.entries(obj).map(([name, def]) => ({ columnName: name, ...def }));
    return arr.map((r) => ({
      columnName: r.columnName || r.name || r.field || '',
      dataType: r.dataType || r.type || '',
      allowNull: r.allowNull ?? false,
      regex: r.regex || '',
      min: r.min ?? '',
      max: r.max ?? ''
    }));
  };

  const parseSchemaString = (text, filename = '') => {
    if (!text) return;
    try {
      setParseError('');
      const ext = filename.split('.').pop().toLowerCase();
      let data;
      if (ext === 'yml' || ext === 'yaml') data = yaml.parse(text);
      else if (ext === 'json') data = JSON.parse(text);
      else {
        try { data = JSON.parse(text); }
        catch { data = yaml.parse(text); }
      }
      const newRules = convertSchema(data);
      if (newRules.length) {
        setRules(newRules);
        setColumns(newRules.map(r => r.columnName));
        localStorage.setItem('expectedSchema', JSON.stringify({ schemaFileName: filename, schemaText: text, rules: newRules }));
      }
    } catch (err) {
      setParseError('Failed to parse schema: ' + err.message);
    }
  };

  const handleSchemaFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSchemaFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const txt = reader.result;
      setSchemaText(txt);
      parseSchemaString(txt, file.name);
    };
    reader.readAsText(file);
  };

  const handleParseClick = () => parseSchemaString(schemaText, schemaFileName);

  const clearSchema = () => {
    setSchemaFileName('');
    setSchemaText('');
    setParseError('');
    localStorage.removeItem('expectedSchema');
  };

  const runValidation = () => {
    localStorage.setItem('validationRules', JSON.stringify(rules));
    localStorage.setItem('expectedSchema', JSON.stringify({ schemaFileName, schemaText, rules }));
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
        {/* Schema Input */}
        <div className="mb-6">
          <div className="font-semibold text-gray-900 mb-2">Schema Definition</div>
          {schemaFileName && (
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700">{schemaFileName}</span>
              <button type="button" onClick={clearSchema} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
          )}
          <input type="file" accept=".json,.yml,.yaml" onChange={handleSchemaFileChange} className="mb-2 text-sm" />
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 h-32 mb-2"
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder="Paste JSON or YAML schema here"
          />
          <div className="flex items-center">
            <button type="button" onClick={handleParseClick} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 text-black mr-2">Load Schema</button>
            {parseError && <span className="text-red-600 text-sm">{parseError}</span>}
          </div>
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
