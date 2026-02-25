
import React from 'react'
import { Link } from 'react-router'

const ModuleBtn = ({name , icon ,url}) => {
  return (
    <Link to={url} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition relative overflow-hidden" style={{ minWidth: 100, minHeight: 100 }}>
      {/* Top colored bar */}
      <div className="absolute top-0 left-0 w-full h-2 rounded-t-lg accent-bg" />
      <div className="flex flex-col items-center justify-center flex-1 z-10 pt-4 w-full">
        <span>{icon}</span>
        <br />
        <span className='text-sm dark:text-black'>{name}</span>
      </div>
    </Link>
  )
}

export default ModuleBtn
