import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'node:path';
import {IUserSettings} from "../src/Interfaces/Interfaces"
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

import fs from 'fs';

const defaultPath = app.getPath('userData')
const downloadPath = app.getPath('downloads')
const modsFilePath: string = readJsonFile(path.join(defaultPath, 'UserPrefs.json')).filePath 


function saveJsonFile(selectedFilePath: string[]) {
  // Get the only folder path
  const userData: IUserSettings = {
    filePath: selectedFilePath[0]
  }

  const jsonData = JSON.stringify(userData)
  fs.writeFile(defaultPath + "/UserPrefs.json", jsonData, (err: unknown) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('JSON file written successfully!');
    }
  })
  console.log(defaultPath)
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

function installMods() {
  const options: Electron.OpenDialogOptions = {
    title: "Please Select a pathway",
    defaultPath: downloadPath,
    properties: ['multiSelections', 'openFile'],
  };

  dialog.showOpenDialog(options)
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        const filePaths = result.filePaths;
        console.log('Selected file paths:', filePaths);
      } else {
        console.log("Quit dialog")
      }
    })
    .catch((err) => {
      console.error(err);
      app.quit();
    });
}

ipcMain.on('install-mods' ,() => {
  installMods()
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

ipcMain.on('open-external', (_event: unknown, link: string) => {
  shell.openExternal(link)
})

function getAllMods(dir: string) : string[]
{
  var mods: string[] 
  mods = fs.readdirSync(dir)
  return mods
}

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
if (fs.existsSync(defaultPath + "/UserPrefs.json"))
{
  app.whenReady().then(createMainWindow)
}
else
{
  app.whenReady().then(runFirstTimeSetUp)
}
