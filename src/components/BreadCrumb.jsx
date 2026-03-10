import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext.jsx";

const BreadCrumb = ({ currentPageTitle, link }) => {
  const { t, settings } = useSettings();
  const isDark = settings.theme === "dark";
  return (
    <div className="w-full flex flex-wrap gap-3 mb-5">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className={`inline-flex items-center text-sm font-medium ${
                isDark ? "text-[#A3E635] font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg
                className="w-4 h-4 me-1.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                />
              </svg>
              {t("home")}
            </Link>
          </li>

          {link &&
            link.map((item, index) => (
              <li key={index} className="inline-flex items-center">
                <Link
                  to={item.path}
                  className={`inline-flex items-center text-sm font-medium ${
                    isDark ? "text-[#A3E635] font-bold": "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                className={`w-3.5 h-3.5 rtl:rotate-180 ${isDark ? "text-black" : "text-gray-400"}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m9 5 7 7-7 7"
                />
              </svg>

                  {item.title}
                </Link>
              </li>
            ))}

          <li aria-current="page">
            <div className="flex items-center space-x-1.5">
              <svg
                className={`w-3.5 h-3.5 rtl:rotate-180 ${isDark ? "text-[#71717A]" : "text-gray-400"}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m9 5 7 7-7 7"
                />
              </svg>
              <span className={`inline-flex max-w-[200px] truncate items-center text-sm font-medium sm:max-w-none ${
                isDark ? "text-[#A1A1AA]" : "text-gray-500"
              }`}>
                {currentPageTitle}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default BreadCrumb;
