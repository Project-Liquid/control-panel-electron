// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { UdpIPC } from "./utility/udpIPC";
import { FileStore } from "./utility/filestore";
//import Store from 'electron-store';

const udpAPI = new UdpIPC(ipcRenderer);

contextBridge.exposeInMainWorld("udp", udpAPI);

contextBridge.exposeInMainWorld("store", new FileStore(ipcRenderer));

contextBridge.exposeInMainWorld("openFileDialog", (cb: (filePaths: string[]) => void) => {
    ipcRenderer.once("file-selected", (_event, filePaths: string[]) => cb(filePaths));
    ipcRenderer.send("open-file-dialog");
});

contextBridge.exposeInMainWorld("newTimestampedFile", (dirname: string, cb: (filename: string) => void) => {
    ipcRenderer.once("new-timestamped-file", (_event, filename) => cb(filename))
    ipcRenderer.send("new-timestamped-file", dirname);
});

contextBridge.exposeInMainWorld("appendFile", (filepath: string, data: string) => {
    ipcRenderer.send("append-file", filepath, data);
})

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send("Hello");
});

//const store = new Store();

//contextBridge.exposeInMainWorld('electronStore', {
//    set: (key: string, value: object) => store.set(key, value),
//    get: (key: string) => store.get(key),
//});
