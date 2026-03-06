import React from 'react'

/**
 * Reusable layout container.
 * Props:
 * - children: content inside the container
 * - className: additional Tailwind classes
 * - fluid: if true the container stretches to full width (keeps horizontal padding)
 * - as: element type to render (default: div)
 */
const Container = ({ children, className = "", as: Component = "div", fluid = false }) => {
  const widthClass = fluid ? "w-full" : "w-full max-w-6xl";
  return (
    <Component className={`${widthClass} px-4 sm:px-6 lg:px-8 mx-auto ${className}`.trim()}>
      {children}
    </Component>
  );
};



export default Container
