import React from "react";

const Footer = () => {
  return (
    <div>
      <div className="w-full bg-[#284258] text-white py-8">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold tracking-wide mb-2">Job Portal</h3>
          <p className="text-gray-200 text-sm mb-4">
            Connecting Talent with Opportunities
          </p>
          <p className="text-gray-300 text-xs">
            &copy; {new Date().getFullYear()} Job Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
