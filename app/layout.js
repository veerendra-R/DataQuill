import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'Data Validator',
  description: 'Clean and validate your datasets easily',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f9fafb] text-gray-900 min-h-screen">
        <Header />
        <main className="flex-1 px-4 sm:px-10 py-8 bg-[#f9fafb] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
