import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";

const ErrorPage = () => {
  const { settings } = useSettings();
  const isDark = settings.theme === "dark";
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 ${isDark ? "app-glow" : "bg-gray-50"}`}>
      <h1 className={`text-9xl font-extrabold tracking-widest ${isDark ? "text-[#3F3F46]" : "text-gray-300"}`}>404</h1>
      <p className={`text-2xl md:text-3xl font-semibold mt-4 ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>
        Oops! Page not found
      </p>
      <p className={`mt-2 text-center max-w-md ${isDark ? "text-[#A1A1AA]" : "text-gray-500"}`}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block accent-bg text-white px-6 py-3 rounded-md shadow-md hover:opacity-90 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default ErrorPage;
