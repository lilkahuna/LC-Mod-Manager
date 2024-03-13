import { app, BrowserWindow, dialog, ipcMain, shell, webContents } from 'electron';
import { FirebaseApp, initializeApp } from "firebase/app";
import { FirebaseStorage, getStorage, ref, StorageReference, uploadBytes, uploadString } from "firebase/storage";
import path from 'node:path';
import { IUserSettings, ModStats } from "../src/Interfaces/Interfaces"
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
import fs from 'fs';

const defaultPath = app.getPath('userData')
const downloadPath = app.getPath('downloads')
var modsFilePath: string = ""


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM32etu7DmYYYM2pP1jV85TQ4xscozDBw",
  authDomain: "lc-mod-manager-storage.firebaseapp.com",
  projectId: "lc-mod-manager-storage",
  storageBucket: "lc-mod-manager-storage.appspot.com",
  messagingSenderId: "184954790771",
  appId: "1:184954790771:web:b4c9196c4706dae4891b06"
};

// Initialize Firebase
const db: FirebaseApp = initializeApp(firebaseConfig);
const storageApp: FirebaseStorage = getStorage(db)

function saveJsonFile(selectedFilePath: string[]) {
  // Get the only folder path
  const userData: IUserSettings = {
    filePath: selectedFilePath[0]
  }

  const jsonData = JSON.stringify(userData)
  
  fs.writeFile(defaultPath + "/UserPrefs.json", jsonData, (err) => {
    if (err) {
      console.error('Error writing JSON file:', err.message);
    } else {
      console.log('JSON file written successfully!');
    }
  })
}

function readJsonFile(filePath: string): IUserSettings
{
  const data: string = fs.readFileSync(filePath, 'utf8')
  const jsonData: IUserSettings = JSON.parse(data)

  return jsonData
}

// Function to open the file dialog
function runFirstTimeSetUp() {
  const options: Electron.OpenDialogOptions = {
    title: "Please Select a pathway",
    properties: ['openDirectory'],
  };

  dialog.showOpenDialog(options)
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        const filePaths = result.filePaths;
        console.log('Selected file paths:', filePaths);
        saveJsonFile(filePaths)
        // Create the main window only after a file is selected
        createMainWindow();
      } else {
        // No file selected, you can handle this case as needed
        app.quit();
      }
    })
    .catch((err) => {
      console.error(err);
      app.quit();
    });
}

function pushMods() {
  const options: Electron.OpenDialogOptions = {
    title: "Please Select a pathway",
    defaultPath: downloadPath,
    properties: ['multiSelections', 'openFile'],
  };

  dialog.showOpenDialog(options)
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        var file: Buffer = fs.readFileSync(result.filePaths[0])

        uploadBytes(ref(storageApp, "TestMods/"+result.filePaths[0]), new Blob([file])).then(() => console.log("File Upload Completed"))
          
      } else {
        console.log("Quit dialog")
      }
    })
    .catch((err) => {
      console.error(err);
      app.quit();
    });
}

ipcMain.on('push-mods' ,() => {
  pushMods()
})

ipcMain.handle('get-installed-mods', () => {
  let rawMods: string[] = fs.readdirSync(modsFilePath)
  let mods: ModStats[] = []
  
  for (let index = 0; index < rawMods.length; index++) {
    // Keeping DS_Store files from being in the mods array
    if (rawMods[index] != ".DS_Store")
    {
      mods.push({name: rawMods[index].split(".")[0].split("+")[0].split("-")[0].replace("_", " ").toUpperCase().split("1")[0], size: Number((fs.statSync(path.join(modsFilePath, rawMods[index])).size * 0.000001).toFixed(2))})
    }
  }
  return mods
})

// Function to create the main window
function createMainWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    fullscreenable: false,
    maxWidth: 800,
    minWidth: 600,
    maxHeight: 700,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  // Load the main content
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  // Event listener for window being closed
  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('open-external', (event, link) => {
  shell.openExternal(link)  
})


// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log("Quiting App")
    app.quit();
  }
});

// Recreate a window when the app is activated (on macOS)
app.on('activate', () => {
  // Also ensuring that the UserPrefs file has been creating
  if (BrowserWindow.getAllWindows().length === 0 && fs.existsSync(defaultPath + "/UserPrefs.json")) {
    createMainWindow();
  }
});

// Create a window when the app is ready
if (!fs.existsSync(defaultPath + "/UserPrefs.json"))
{
  app.whenReady().then(runFirstTimeSetUp)
  modsFilePath = readJsonFile(path.join(defaultPath, 'UserPrefs.json')).filePath
}
else
{
  app.whenReady().then(createMainWindow)
  modsFilePath = readJsonFile(path.join(defaultPath, 'UserPrefs.json')).filePath 
}
