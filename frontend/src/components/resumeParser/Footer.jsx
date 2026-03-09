import React from 'react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="mt-6 text-lg leading-8 text-gray-300">
          &copy; 2025
          <span className="text-blue-400 font-semibold"> Resume Analyser</span>. All Rights Reserved.
        </div>

        <div className="flex gap-4">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <i className="fa-solid fa-angle-up"></i>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
