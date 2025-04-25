import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

// Add JSX namespace declaration to fix linter errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const categories = [
  { id: "all", name: "All" },
  { id: "academic", name: "Academic" },
  { id: "administrative", name: "Administrative" },
  { id: "financial", name: "Financial" }
];

const forms = [
  {
    id: 1,
    title: "Student ID Card Replacement Request",
    category: "administrative",
    description: "Request a new student ID card if lost or damaged"
  },
  {
    id: 2,
    title: "Course Registration Form",
    category: "academic",
    description: "Register for courses in the current semester"
  },
  {
    id: 3,
    title: "Tuition Payment Form",
    category: "financial",
    description: "Process tuition payment for the semester"
  },
  {
    id: 4,
    title: "Leave of Absence Request",
    category: "administrative",
    description: "Request temporary leave from studies"
  }
];

export default function SearchForms() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredForms = forms.filter(form => {
    const matchesCategory = selectedCategory === "all" || form.category === selectedCategory;
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      <Navbar />
      <main className="flex flex-col items-center px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Search Forms</h1>
        <p className="text-gray-600 mb-8">
          Find and access the forms you need quickly and easily
        </p>

        {/* Search and Filter Section */}
        <div className="w-full max-w-4xl mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search forms..."
              className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#005BAA]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#005BAA] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {filteredForms.map((form) => (
            <Card key={form.id} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{form.title}</h3>
                <p className="text-gray-600 mb-4">{form.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 capitalize">{form.category}</span>
                  <button className="px-4 py-2 bg-[#005BAA] text-white rounded-md hover:bg-[#004080] transition-colors">
                    View Form
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
} 