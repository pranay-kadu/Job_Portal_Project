import React from 'react';

const Header = () => {
  return (
    <>
      {/* Logo + Badges row */}
      <div className="flex items-center gap-4 flex-wrap">
        <img
          className="h-12"
          src="https://res.cloudinary.com/dtsuvx8dz/image/upload/v1706986565/hqatxpsjdg3zeql20jfe.png"
          alt="AI Portal"
        />
        <div className="inline-flex space-x-3">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold leading-5 text-blue-600 ring-1 ring-inset ring-blue-500/10">
            What's new
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold leading-5 text-blue-600 ring-1 ring-inset ring-blue-500/10">
            AI-Powered Accuracy
          </span>
        </div>
      </div>
      <h1 className="mt-8 text-4xl font-bold tracking-tight text-indigo-950 sm:text-5xl leading-tight">
        Revolutionize Your Career <br />
        with Next-Gen Resume Parsing
      </h1>
      <p className="mt-4 text-lg leading-8 text-gray-600">
        AI-powered analysis in seconds.
        Unlock the potential of your professional profile with <br />our advanced AI resume
        analyzer. Get instant feedback on your ATS score, skills, and <br />strategic improvements.
      </p>
    </>
  );
};

export default Header;
