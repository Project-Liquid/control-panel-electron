import { IpcRenderer } from "electron";

export class FileStore {
    ipcRenderer: IpcRenderer;
    constructor(ipcRenderer: IpcRenderer) {
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);

        this.ipcRenderer = ipcRenderer;
    }
    set(key: string, value: unknown) {
        this.ipcRenderer.send("store-set", key, value);
    }
    get(key: string) {
        return this.ipcRenderer.sendSync("store-get", key);
    }
}
