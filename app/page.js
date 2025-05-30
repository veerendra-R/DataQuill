'use client';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaBolt, FaChartLine, FaDatabase } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 sm:px-0 py-10 flex flex-col items-center">
      {/* Hero Section */}
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 text-gray-900">Data Validation Tool</h1>
      <p className="text-center text-gray-600 max-w-2xl mb-7">
        Ensure data quality and integrity across your organization with our powerful, easy-to-use validation platform.
        Define custom rules, validate datasets, and get actionable insights to improve your data pipeline.
      </p>
      <button
        className="bg-[#131a25] hover:bg-blue-900 text-white font-semibold px-8 py-3 rounded-lg shadow mb-12 transition text-lg"
        onClick={() => router.push('/data-source')}
      >
        Start Validating Data
      </button>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full max-w-5xl mb-14">
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center shadow">
          <FaShieldAlt className="text-blue-500 text-3xl mb-2" />
          <div className="font-semibold mb-1 text-center text-black">Data Integrity Protection</div>
          <div className="text-sm text-gray-500 text-center">
            Ensure your data meets quality standards with comprehensive validation rules and real-time error detection.
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center shadow">
          <FaBolt className="text-blue-500 text-3xl mb-2" />
          <div className="font-semibold mb-1 text-center text-black">Lightning Fast Processing</div>
          <div className="text-sm text-gray-500 text-center">
            Process large datasets quickly with our optimized validation engine that scales with your needs.
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center shadow">
          <FaChartLine className="text-blue-500 text-3xl mb-2" />
          <div className="font-semibold mb-1 text-center text-black">Detailed Analytics</div>
          <div className="text-sm text-gray-500 text-center">
            Get comprehensive insights into data quality issues with detailed reports and visualizations.
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center shadow">
          <FaDatabase className="text-blue-500 text-3xl mb-2" />
          <div className="font-semibold mb-1 text-center text-black">Multiple Data Sources</div>
          <div className="text-sm text-gray-500 text-center">
            Support for CSV, JSON, API endpoints, MongoDB, and S3 buckets – validate data from anywhere.
          </div>
        </div>
      </div>

      {/* How It Works */}
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">How It Works</h2>
      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-10">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xl text-blue-600 mb-2">1</div>
          <div className="font-semibold mb-1 text-black">Connect Your Data</div>
          <div className="text-xs text-gray-500 text-center">
            Upload files or connect to your data sources including APIs, databases, and cloud storage.
          </div>
        </div>
        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xl text-blue-600 mb-2">2</div>
          <div className="font-semibold mb-1 text-black">Define Rules</div>
          <div className="text-xs text-gray-500 text-center">
            Set up custom validation rules based on data types, formats, ranges, and business logic.
          </div>
        </div>
        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xl text-blue-600 mb-2">3</div>
          <div className="font-semibold mb-1 text-black">Get Results</div>
          <div className="text-xs text-gray-500 text-center">
            View detailed validation results with insights into data quality issues and recommendations.
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-8">
        <div className="font-bold text-blue-800 text-lg mb-1">Ready to Improve Your Data Quality?</div>
        <div className="text-blue-700 mb-4 text-sm">Start validating your data today and ensure quality across your entire data pipeline.</div>
        <button
          className="bg-[#131a25] hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded shadow"
          onClick={() => router.push('/data-source')}
        >
          Get Started Now
        </button>
      </div>
    </div>
  );
}
