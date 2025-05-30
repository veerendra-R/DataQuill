// components/Header.js
"use client";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-bold text-gray-900">Data Validator</h1>
      {/* Desktop Nav */}
      <nav className="hidden sm:flex space-x-6 text-sm font-medium text-gray-900">
        <a href="/" className="hover:text-blue-600">Overview</a>
        <a href="/data-source" className="hover:text-blue-600">Data Sources</a>
        <a href="/validation-rules" className="hover:text-blue-600">Validations</a>
        <a href="/results" className="hover:text-blue-600">Reports</a>
      </nav>
      {/* Burger for mobile */}
      <button
        className="sm:hidden flex items-center p-2 rounded hover:bg-gray-100"
        aria-label="Open menu"
        onClick={() => setOpen(!open)}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-gray-900" viewBox="0 0 24 24">
          {open ? (
            // X icon
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            // Burger icon
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          )}
        </svg>
      </button>
      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border-b shadow-md sm:hidden z-40">
          <nav className="flex flex-col p-4 space-y-2 text-base font-medium">
            <a href="/" className="hover:text-blue-600 text-black" onClick={() => setOpen(false)}>Overview</a>
            <a href="/data-source" className="hover:text-blue-600 text-black" onClick={() => setOpen(false)}>Data Sources</a>
            <a href="/validation-rules" className="hover:text-blue-600 text-black" onClick={() => setOpen(false)}>Validations</a>
            <a href="/results" className="hover:text-blue-600 text-black" onClick={() => setOpen(false)}>Reports</a>
          </nav>
        </div>
      )}
    </header>
  );
}
