const { app, BrowserWindow, ipcMain, screen, webContents } = require("electron");
const path = require("path");
const db = require("./config/database/db_config");
const remote = require('@electron/remote/main');
remote.initialize();

let mainWindow;
let productWindow;
let editDataModal
mainWin = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
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

//--------------------------------------------------------

ipcMain.on("load:product-window", (event, arg) => {
  productWin();
});

// Function to create child window of parent one
productWin = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  productWindow = new BrowserWindow({
    width: width,
    height: height,
    minHeight: 600,
    minWidth: 800,
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

//--------------------------------------------------------

ipcMain.on("load:edit", (event, msgDocId, msgForm, msgWidth, msgHeight, msgRowId) => {
  editData(msgDocId, msgForm, msgWidth, msgHeight, msgRowId);
});

editData = (docId, modalForm, modalWidth, modalHeight, rowId) => {
  let parentWin
  switch (docId) {
    case 'product-data':
      parentWin = productWindow;
      break;
  }
  editDataModal = new BrowserWindow({
    width: modalWidth,
    height: modalHeight,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: parentWin,
    modal: true,
    title: 'Edit Data',
    frame: true,
    // autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  remote.enable(editDataModal.webContents);
  editDataModal.loadFile(`modals/edit-data.html`);
  editDataModal.webContents.on("did-finish-load", () => {
    editDataModal.webContents.send('res:form', docId, modalForm, rowId);
  });
  editDataModal.on("closed", () => {
    editDataModal = null;
  });
}
//--------------------------------------------------------

ipcMain.on('update:success', (event, msgDocId) => {
  switch (msgDocId) {
    case 'product-data':
      productWindow.webContents.send('update:success', 'Success');
      // break;
  }
  editDataModal.close();
})

ipcMain.on('close:edit', () => {
  editDataModal.close();
})

//--------------------------------------------------------

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
