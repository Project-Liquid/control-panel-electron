// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { UdpIPC } from "./utility/udpIPC";
import { FileStore } from "./utility/filestore";
//import Store from 'electron-store';

const udpAPI = new UdpIPC(ipcRenderer);

contextBridge.exposeInMainWorld("udp", udpAPI);

contextBridge.exposeInMainWorld("store", new FileStore(ipcRenderer));

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send("Hello");
});

//const store = new Store();

//contextBridge.exposeInMainWorld('electronStore', {
//    set: (key: string, value: object) => store.set(key, value),
//    get: (key: string) => store.get(key),
//});
