import * as React from 'react';
import { Link } from 'react-router-dom';

// Add JSX namespace declaration to fix linter errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

const Hero = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#005BAA]">Semantic Search System</h1>
        </div>
        
        <p className="text-xl text-gray-600 mb-8">
          Smart and fast search within the university's document repository. 
          Supporting semantic search to help you easily find the information you need.
        </p>

        <div className="flex justify-center">
          <Link
            to="/get-started"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#005BAA] hover:bg-[#004080]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero; 