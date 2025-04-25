import * as React from 'react';

// Add JSX namespace declaration to fix linter errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

const Features = () => {
  const features = [
    {
      title: 'Natural Language',
      description: 'Search using everyday language and questions',
    },
    {
      title: 'Save Results',
      description: 'Bookmark and organize your favorite findings',
    },
    {
      title: 'Search History',
      description: 'Easily access your past searches and results',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-[#005BAA] mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features; 