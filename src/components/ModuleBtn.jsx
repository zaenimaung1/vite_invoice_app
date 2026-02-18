import React from 'react'
import { Link } from 'react-router'

const ModuleBtn = ({name , icon ,url}) => {
  return (
    <Link to={url} className="flex flex-col items-center justify-center p-15 bg-white rounded-lg shadow-md hover:bg-gray-50 transition ">
      <span>{icon}</span>
      <br />
      <span className='text-sm '>{name}</span>
    </Link>
  )
}

export default ModuleBtn