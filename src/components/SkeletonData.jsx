import React from 'react'

const SkeletonData = () => {
  return (
    <div className='w-full'>   {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-4">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </td>

          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <div className="w-32 h-3 bg-gray-200 rounded"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </td>

          <td className="px-4 py-4 text-right">
            <div className="w-16 h-3 bg-gray-200 rounded ml-auto"></div>
          </td>

          <td className="px-4 py-4 text-right">
            <div className="w-24 h-3 bg-gray-200 rounded ml-auto"></div>
          </td>

          <td className="px-4 py-4 text-right">
            <div className="flex justify-end gap-2">
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </td>
        </tr>
      ))}</div>
  )
}

export default SkeletonData