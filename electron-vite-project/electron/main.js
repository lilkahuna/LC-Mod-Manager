import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'node:path';
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
let win
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
import fs from 'fs';


const defaultPath = app.getPath('userData')
const downloadPath = app.getPath('downloads')
var modsFilePath = ""

function saveJsonFile(selectedFilePath) {
  // Get the only folder path
  const userData = {
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

function readJsonFile(filePath)
{
  const data = fs.readFileSync(filePath, 'utf8')
  const jsonData = JSON.parse(data)

  return jsonData
}

// Function to open the file dialog
function runFirstTimeSetUp() {
  const options = {
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

ipcMain.on('push-mods', () => {
  const options = {
    title: "Please Select a pathway",
    defaultPath: downloadPath,
    properties: ['multiSelections', 'openFile'],
  };

  dialog.showOpenDialog(options)
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        const {MongoClient, GridFSBucket, ObjectId} = require('mongodb')
        const client = new MongoClient('mongodb+srv://Lilkahuna:VeL08QojBxofQ014@cluster0.l4he5ba.mongodb.net/')
        const bucket = new GridFSBucket(client.db('sample_mflix'))

        result.filePaths.forEach((file, index) => {
          fs.createReadStream(file).pipe(bucket.openUploadStream(path.basename(file)))
        })
        
      } else {
        console.log("Quit dialog")
      }
    })
    .catch((err) => {
      console.error(err);
      app.quit();
    });
})

ipcMain.handle('get-installed-mods', () => {
  let rawMods = fs.readdirSync(modsFilePath)
  
  return {mods: rawMods, dir: modsFilePath}
})

ipcMain.on('pull-mods', () => {
  const {MongoClient, GridFSBucket, ObjectId} = require('mongodb')
  const client = new MongoClient('mongodb+srv://Lilkahuna:VeL08QojBxofQ014@cluster0.l4he5ba.mongodb.net/')
  const bucket = new GridFSBucket(client.db('sample_mflix'))
  bucket.find({}).toArray().then((files) => files.forEach((file) => bucket.openDownloadStreamByName(file.filename).pipe(fs.createWriteStream(path.join(modsFilePath, file.filename)))))
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
