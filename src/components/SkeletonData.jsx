import React from "react";
import { useSettings } from "../context/SettingsContext.jsx";

const SkeletonData = () => {
  const { settings } = useSettings();
  const isDark = settings.theme === "dark";
  const blockClass = isDark ? "bg-[#3F3F46]" : "bg-gray-200";
  return (
    <div className="w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-4">
            <div className={`w-4 h-4 rounded ${blockClass}`}></div>
          </td>

          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <div className={`w-32 h-3 rounded ${blockClass}`}></div>
                <div className={`w-24 h-3 rounded ${blockClass}`}></div>
              </div>
            </div>
          </td>

          <td className="px-4 py-4 text-right">
            <div className={`w-16 h-3 rounded ml-auto ${blockClass}`}></div>
          </td>

          <td className="px-4 py-4 text-right">
            <div className={`w-24 h-3 rounded ml-auto ${blockClass}`}></div>
          </td>

          <td className="px-4 py-4 text-right">
            <div className="flex justify-end gap-2">
              <div className={`w-12 h-6 rounded-full ${blockClass}`}></div>
              <div className={`w-12 h-6 rounded-full ${blockClass}`}></div>
            </div>
          </td>
        </tr>
      ))}
    </div>
  );
};

export default SkeletonData;
