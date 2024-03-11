import ModItem from '../Components/ModItem'
import React, { useEffect, useState } from 'react'
import img from '../assets/github.png'
import '../index.css'
import { ipcMain, ipcRenderer } from 'electron'

function App() {

  const [mods, setMods] = useState<string[]>([])

  useEffect(() => {
    window.ipcRenderer.sendSync('get-installed-mods')
    
  }, [])
  
  return (
    <>
      <div className='block m-4'>
        
        <div className='top-0 right-0 m-4 group fixed'>
          <a onClick={() => window.ipcRenderer.send('open-external', "https://github.com/lilkahuna")}>
            <img className='rounded-full h-16 w-16 hover:shadow-lg hover:shadow-indigo-500/50' src={img}></img>
          </a>
        </div>

        <div className='justify-center m-4'>
          <h1 className='text-center text-5xl text-indigo-500'>Company Mods</h1>
        </div>
        
        <div className='relative top-12 p-2'>
          <h1 className='text-center text-2xl text-indigo-500'>Installed Mods</h1>
          <div className='m-4 max-w-lg mx-auto border-4 bg-slate-200 border-slate-200 rounded-md shadow-md overflow-y-auto h-48'>
          {
            mods.map((file, index) => <ModItem key={index} modName={file} />)
          }
          </div>
        
          <div className="flex justify-center items-center space-x-4">
            <button className="hover:bg-indigo-400 bg-indigo-500 text-slate-200 px-4 py-2 rounded-md" onClick={() => window.ipcRenderer.send('push-mods')}>Push Mods</button>
          </div>
      
        </div>

      </div>
    </>
  )
}

export default App
