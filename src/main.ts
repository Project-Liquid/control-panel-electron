import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { UdpController } from './utility/udpController';
import Store from "electron-store";
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Electron store initialize for renderer
const store = new Store();
console.log(app.getPath('userData'));
ipcMain.on("store-set", (_event, key: string, value: unknown) => {
  store.set(key, value);
});
ipcMain.on("store-get", (event, key: string) => {
  event.returnValue = store.get(key, null);
});

// File dialog opening
ipcMain.on("open-file-dialog", event => {
  dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  }).then(result => {
    if (!result.canceled) {
      event.reply("file-selected", result.filePaths);
    }
  }).catch(console.log);
});

// Create new timestamped file
ipcMain.on("new-timestamped-file", (event, dirname) => {
  const now = new Date();
  const newFileName = path.join(dirname, `${now.toISOString()}.txt`);
  fs.writeFile(newFileName, '', (err) => {
    if (err) {
      console.error('Error creating file:', err);
      return;
    } else {
      event.reply("new-timestamped-file", newFileName);
    }
  });
})

ipcMain.on("append-file", (event, filepath, data) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fs.appendFile(filepath, data, (err) => {
    console.log("appendFile ", filepath, data, err);
  });
})

const udp = new UdpController();
const processListenerRemovers: Record<number, () => void> = {};
ipcMain.on("udp-ipcregister", event => {
  console.log("Adding listener at", event.processId, processListenerRemovers[event.processId]);
  if (processListenerRemovers[event.processId] != undefined) {
    // Remove the old listener for this process
    processListenerRemovers[event.processId]();
  }
  processListenerRemovers[event.processId] = udp.addListener(message => {
    //console.log(processListenerRemovers);
    event.reply("udp-receive", message);
  });
});
ipcMain.on("udp-send", (_event, command: string) => {
  udp.send(command);
});
ipcMain.on("udp-start-handshake", (event, interval: number) => {
  udp.startHandshake(interval, () => {
    event.reply("udp-handshake-connected");
  });
});
ipcMain.on("udp-get-computer-info", event => {
  event.returnValue = udp.computerAddress;
});
ipcMain.on("udp-get-teensy-info", event => {
  event.returnValue = udp.teensyRemoteInfo;
});
//udp.addListener(console.log);
//setTimeout(() => {
//  udp.socket.emit("message", Buffer.from("HSK"), {
//    address: "169.254.44.72",
//    family: "IPv4",
//    port: 5190,
//    size: 0,
//  });
//}, 2000);
//setTimeout(() => {
//  udp.socket.emit("message", Buffer.from("PAR88"), {
//    address: "169.254.44.72",
//    family: "IPv4",
//    port: 5190,
//    size: 0,
//  });
//}, 5000);

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.on("close", () => {
    // Unregister the closed window from receiving udp messages
    const pid = mainWindow.webContents.getProcessId();
    if (pid in processListenerRemovers) {
      processListenerRemovers[pid]();
      delete processListenerRemovers[pid];
    }
  });

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
