'use client';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

// Group all errors by row, mapping each column with its error and value
function groupErrorsByRow(failedRows, columns) {
  const map = new Map();
  failedRows.forEach(({ row, column, error, values }) => {
    if (!map.has(row)) map.set(row, { values, errors: {}, errorList: [] });
    map.get(row).errors[column] = error;
    map.get(row).errorList.push({ column, error });
  });
  return Array.from(map.entries()).map(([rowNum, val]) => ({
    rowNum,
    values: val.values,
    errors: val.errors,
    errorList: val.errorList
  }));
}

export default function ResultsPage() {
  const [summary, setSummary] = useState({ checked: 0, passed: 0, failed: 0 });
  const [failedRows, setFailedRows] = useState([]);
  const [allFailed, setAllFailed] = useState(false);
  const [columns, setColumns] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const dataSource = JSON.parse(localStorage.getItem('dataSource') || '{}');
    const rules = JSON.parse(localStorage.getItem('validationRules') || '[]');
    const rows = Array.isArray(dataSource.rows) ? dataSource.rows : [];
    setColumns(dataSource.columns || []);

    let passed = 0, failed = 0;
    const failedRowsList = [];
    // For each row, check all rules
    rows.forEach((row, rowIndex) => {
      const isEmpty = Object.values(row).every(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
      );
      if (isEmpty) return; // Ignore empty row
      let rowHasError = false;
      rules.forEach(rule => {
        const value = row[rule.columnName];
        let reason = "";
        if (!rule.allowNull && (value === undefined || value === null || value === "")) {
          reason = "Value required";
        } else if (rule.dataType === "number" && value && isNaN(Number(value))) {
          reason = "Must be a number";
        } else if (rule.dataType === "date" && value && isNaN(Date.parse(value))) {
          reason = "Invalid date";
        } else if (rule.regex && value && !(new RegExp(rule.regex).test(value))) {
          reason = "Regex failed";
        } else if (rule.min && value && Number(value) < Number(rule.min)) {
          reason = `Min value ${rule.min}`;
        } else if (rule.max && value && Number(value) > Number(rule.max)) {
          reason = `Max value ${rule.max}`;
        }
        if (reason) {
          failedRowsList.push({ row: rowIndex + 2, column: rule.columnName, error: reason, values: row });
          rowHasError = true;
        }
      });
      if (rowHasError) failed++;
      else passed++;
    });

    setSummary({ checked: rows.length, passed, failed });
    setFailedRows(failedRowsList);
    setAllFailed(passed === 0 && failed > 0);
  }, []);

  // Download CSV for failed rows
  const handleDownload = () => {
    if (!failedRows.length) return;
    const csv = [
      ['Row Number', ...columns, 'Error Column', 'Error Message'],
      ...failedRows.map(r =>
        [r.row, ...columns.map(col => r.values?.[col] ?? ""), r.column, r.error]
      )
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed_rows.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Display only top 3 failed rows for preview
  const grouped = groupErrorsByRow(failedRows, columns).slice(0, 3);

  // Stepper color logic
  const stepDone = "bg-green-500 border-green-500 text-white";
  const stepActive = allFailed ? "bg-red-500 border-red-500 text-white" : "bg-blue-500 border-blue-500 text-white";
  const stepLine = "border-t-2 flex-1 my-auto";

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-[#f6f9fc]">
      {/* Stepper */}
      <div className="w-full max-w-3xl flex items-center justify-center mb-8 select-none">
        <div className="flex flex-1 items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold border-2 ${stepDone}`}>1</div>
          <div className={`${stepLine} border-blue-500`}></div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold border-2 ${stepDone}`}>2</div>
          <div className={`${stepLine} ${allFailed ? 'border-red-500' : 'border-blue-500'}`}></div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold border-2 ${stepActive}`}>3</div>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Validation Tool</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl">
        Validate your data integrity with custom rules and get detailed insights into data quality issues across your datasets.
      </p>
      {/* Step labels */}
      <div className="flex max-w-2xl w-full justify-between mb-8">
        <div className="flex flex-col items-center flex-1">
          <span className="font-medium text-green-600">Data Source</span>
          <span className="text-xs text-gray-500">Upload or connect your data</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="font-medium text-green-600">Validation Rules</span>
          <span className="text-xs text-gray-500">Define validation criteria</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className={allFailed ? "font-medium text-red-500" : "font-medium text-blue-600"}>Results</span>
          <span className="text-xs text-gray-500">View validation results</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-500 mb-1">Total Rows</div>
          <div className="text-2xl font-bold text-blue-700">{summary.checked}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-500 mb-1">Passed</div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">{summary.passed}</span>
            <span className="text-xs text-gray-500">{summary.checked ? `${((summary.passed / summary.checked) * 100).toFixed(1)}%` : '0%'}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-500 mb-1">Failed</div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-600">{summary.failed}</span>
            <span className="text-xs text-gray-500">{summary.checked ? `${((summary.failed / summary.checked) * 100).toFixed(1)}%` : '0%'}</span>
          </div>
        </div>
      </div>

      {/* Validation Failed Alert */}
      {failedRows.length > 0 && (
        <div className="w-full max-w-4xl my-4">
          <div className="bg-red-100 border border-red-400 text-red-800 px-6 py-3 rounded flex items-center">
            <span className="mr-2 text-xl">✗</span>
            <div>
              <span className="font-semibold">Validation Failed</span>
              <div className="text-xs">{failedRows.length} rows failed validation and need attention.</div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Rows Table */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow px-4 py-6 mt-2 mb-8">
        <div className="font-bold text-lg mb-2 text-black">Failed Rows</div>
        <div className="text-xs text-gray-500 mb-4">
          Showing {grouped.length} of {failedRows.length} failed rows
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">ID</th>
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-semibold text-gray-700">{col}</th>
                ))}
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Errors</th>
              </tr>
            </thead>
            <tbody>
            {grouped.map(({ rowNum, values, errors, errorList }, idx) => (
              <tr key={idx} className="text-black"> {/* <-- Only row color removed */}
                <td className="px-3 py-2">{rowNum}</td>
                {columns.map(col => (
                  <td
                    key={col}
                    className={`px-3 py-2 ${errors[col] ? "bg-red-100" : ""}`}
                  >
                    <div className={errors[col] ? "font-semibold text-red-600" : ""}>
                      {values && (values[col] !== undefined && values[col] !== null && values[col] !== "")
                        ? values[col]
                        : <span className="italic text-gray-400">Empty</span>
                      }
                    </div>
                    {errors[col] && (
                      <span className="block bg-red-500 text-white text-xs font-medium rounded-full px-2 py-0.5 mt-1 w-fit">
                        {errors[col]}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {errorList.map(({ column, error }, i) => (
                      <span key={i} className="bg-red-500 text-white text-xs font-medium rounded-full px-3 py-1">
                        {column}: {error}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {grouped.length === 0 && (
              <tr>
                <td className="px-3 py-2 text-gray-400 italic" colSpan={columns.length + 2}>No failed rows to display.</td>
              </tr>
            )}
          </tbody>

          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-6 gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/validation-rules')}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 text-black"
            >
              Back to Rules
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('dataSource');
                localStorage.removeItem('validationRules');
                router.push('/data-source');
              }}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 text-black"
            >
              Start Over
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white border border-gray-400 rounded-md text-sm text-black font-medium flex items-center hover:bg-gray-100"
          >
            <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
            </svg>
            Download Failed Rows
          </button>
        </div>
      </div>
    </div>
  );
}
