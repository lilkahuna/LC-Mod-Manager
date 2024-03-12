import React from 'react'
import { IModItemProps } from '../Interfaces/Interfaces'

const ModItem: React.FC<IModItemProps> = ( {modName, size} ) => {

  return (
    <div className='h-2/5 w-full py-1 px-2 border-b-4 border-indigo-800 rounded-md bg-gradient-to-r bg-slate-700 hover:bg-slate-500'>
      <h1 className='text-xl text-white'>{modName}</h1>
      <p className='text-lg text-white'>{`${size} MB`}</p>
    </div>
  )
}

export default ModItem
