import ModItem from '../Components/ModItem'
import img from '../assets/github.png'
import '../index.css'

function App() {

  return (
    <>
      <div className='block m-4'>
        
        <div className='top-0 right-0 m-4 group fixed'>
          <a onClick={() => window.ipcRenderer.send('open-external', "https://github.com/lilkahuna")}>
            <img className='rounded-full h-16 w-16 hover:shadow-lg hover:shadow-indigo-500/50 rotate-back-and-forth' src={img}></img>
          </a>
        </div>

        <div className='justify-center m-4'>
          <h1 className='text-center text-5xl text-indigo-500'>Company Mods</h1>
        </div>
        
        <div className='relative top-12 p-2'>
          <h1 className='text-center text-2xl text-indigo-500'>Installed Mods:</h1>
          <div className='m-4 max-w-lg mx-auto border-4 bg-slate-200 border-slate-200 rounded-md shadow-md overflow-y-auto h-48'>
            <ModItem modName='MoreCompanyMod' filePath='path/aaa'/>
            <ModItem modName='MoreCompanyMod' filePath='path/aaa'/>
            <ModItem modName='MoreCompanyMod' filePath='path/aaa'/>
          </div>
        
          <div className="flex justify-center items-center space-x-4">
            <button className="hover:bg-indigo-400 bg-indigo-500 text-slate-200 px-4 py-2 rounded-md" onClick={() => window.ipcRenderer.send('install-mods')}>Install Mods</button>
            <button className="hover:bg-indigo-400 bg-indigo-500 text-slate-200 px-4 py-2 rounded-md" onClick={() =>  window.open('https://www.nexusmods.com/lethalcompany/mods/', '_blank')}>Need Mods?</button>

          </div>
      
        </div>

      </div>
    </>
  )
}

export default App
