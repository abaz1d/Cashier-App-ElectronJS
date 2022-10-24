const { app, BrowserWindow, ipcMain, screen, webContents } = require("electron");
const path = require("path");
const db = require("./config/database/db_config");
const remote = require('@electron/remote/main');
remote.initialize();

let mainWindow;
let productWindow;
mainWin = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  db.connect(function(err) {
    if (err){
      console.log('err', err);
    };
    console.log("Connected PostgreSQL!");
  });
}

ipcMain.on("load:product-window", (event, arg) => {
  productWin();
});

// Function to create child window of parent one
productWin = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  productWindow = new BrowserWindow({
    width: width,
    height: height,
    resizable: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  remote.enable(productWindow.webContents);

  // Child window loads settings.html file
  productWindow.loadFile(path.join(__dirname, "windows/product.html"));
  productWindow.webContents.on("did-finish-load", () => {
    mainWindow.hide();
  });

  productWindow.on("closed", () => {
    mainWindow.show();
    // console.log('productWindow', productWindow);
  });
}

app.whenReady().then(() => {
  mainWin();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWin();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
