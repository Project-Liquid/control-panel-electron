// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { UdpIPC } from "./utility/udpIPC";

const udpAPI = new UdpIPC(ipcRenderer);

contextBridge.exposeInMainWorld("udp", udpAPI);

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send("Hello");
});
