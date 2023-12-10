// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { UdpController } from "./utility/udpController";

// Ask main.ts to send the udp handle object
//const udp: UdpController = ipcRenderer.sendSync("request-udp-controller");

//// Expose the udp handle to the renderer scripts
//contextBridge.exposeInMainWorld("udpController", udp);
