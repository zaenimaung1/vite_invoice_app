
import React from "react";
import { Link } from "react-router";
import { useSettings } from "../context/SettingsContext.jsx";

const ModuleBtn = ({ name, icon, url }) => {
  const { settings } = useSettings();
  const isDark = settings.theme === "dark";
  return (
    <Link
      to={url}
      className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition relative overflow-hidden ${
        isDark
          ? "bg-[#2A2D34] border border-[#2E2E33] hover:bg-[#32353D]"
          : "bg-white border border-gray-200 hover:bg-gray-50"
      }`}
      style={{ minWidth: 100, minHeight: 100 }}
    >
      {/* Top colored bar */}
      <div className="absolute top-0 left-0 w-full h-2 rounded-t-lg accent-bg" />
      <div className="flex flex-col items-center justify-center flex-1 z-10 pt-4 w-full">
        <span>{icon}</span>
        <br />
        <span className={`text-sm ${isDark ? "text-[#F5F5F5]" : "text-gray-700"}`}>{name}</span>
      </div>
    </Link>
  )
}

export default ModuleBtn
