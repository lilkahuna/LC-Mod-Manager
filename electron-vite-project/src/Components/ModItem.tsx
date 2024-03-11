import React from 'react'
import { IModItemProps } from '../Interfaces/Interfaces'

const ModItem: React.FC<IModItemProps> = ( {modName, size} ) => {

  return (
    <div className='h-2/5 w-full py-1 px-2 border-b-4 border-indigo-800 rounded-b bg-slate-200'>
      <h1 className='text-xl text-black'>{modName}</h1>
      <p className='text-lg text-black'>{size}</p>
    </div>
  )
}

export default ModItem
