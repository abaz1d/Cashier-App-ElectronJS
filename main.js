const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

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
