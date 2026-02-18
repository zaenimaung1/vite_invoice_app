import React from 'react'

/**
 * Reusable layout container.
 * Props:
 * - children: content inside the container
 * - className: additional Tailwind classes
 * - fluid: if true the container stretches to full width (keeps horizontal padding)
 * - as: element type to render (default: div)
 */
const Container = ({ children, className }) => {
  return (
    <div className={`w-full md:w-[720px]  lg:w-[1000px] mx-auto ${className}`}>
      {children}
    </div>
  );
};



export default Container