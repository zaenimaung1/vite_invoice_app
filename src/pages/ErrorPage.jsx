import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-9xl font-extrabold text-gray-300 tracking-widest">404</h1>
      <p className="text-2xl md:text-3xl font-semibold text-gray-700 mt-4">
        Oops! Page not found
      </p>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default ErrorPage;