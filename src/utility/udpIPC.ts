import { IpcRenderer } from "electron";
import { TeensyMessage, TeensyMessageId, TeensyParseResult } from "./teensyReceive";
import { TeensyCommand } from "./teensyCommands";

// This is just a render-side API for the main-side UdpController class. It forwards all commands over electron's inter-process communication system (IPC)
export class ParsedUdpIPC {
    ipcRenderer: IpcRenderer;
    listeners: ((message: TeensyParseResult) => void)[];
    constructor(ipcRenderer: IpcRenderer) {
        this.send = this.send.bind(this);
        this.startHandshake = this.startHandshake.bind(this);
        this.addParsedListener = this.addParsedListener.bind(this);
        this.addListener = this.addListener.bind(this);
        this.getComputerInfo = this.getComputerInfo.bind(this);
        this.getTeensyInfo = this.getTeensyInfo.bind(this);

        this.ipcRenderer = ipcRenderer;

        this.listeners = [];

        // Set up to forward incoming messages to listeners
        this.ipcRenderer.on("udp-receive", (_event, message: TeensyParseResult) => {
            for (const listener of this.listeners) {
                listener(message);
            }
        })

        // Alert the main process that a udp listener is available on this renderer
        this.ipcRenderer.send("udp-ipcregister");
    }
    send(message: TeensyCommand) {
        this.ipcRenderer.send("udp-send", message);
    }
    startHandshake(interval = 1000, onConnect?: () => void) {
        this.ipcRenderer.send("udp-start-handshake", interval);
        if (onConnect) {
            this.ipcRenderer.on("udp-handshake-connected", onConnect);
        }
    }
    // Registers a listener that accepts a "parse result" for every new message. Returns a function that can be used to unregister the listener.
    addParsedListener(listener: (message: TeensyParseResult) => void): () => void {
        this.listeners.push(listener);

        // Return a callback that unregisters the listener
        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
    }
    // Registers a listener that accepts a message, optionally requiring that the message matches the provided id. Returns a function that can be used to unregister the listener.
    addListener(listener: (message: TeensyMessage) => void, id?: TeensyMessageId): () => void {
        return this.addParsedListener((result: TeensyParseResult) => {
            if (result.kind !== "success" || (id && result.message.id !== id)) {
                return; // Ignore non-matches
            }
            listener(result.message);
        });
    }
    getComputerInfo(): { address: string, family: string, port: number } | null {
        return this.ipcRenderer.sendSync("udp-get-computer-info");
    }
    getTeensyInfo(): {
        address: string;
        family: "IPv4" | "IPv6";
        port: number;
        size: number;
    } | null {
        return this.ipcRenderer.sendSync("udp-get-teensy-info");
    }
}

export class UdpIPC {
    ipcRenderer: IpcRenderer;
    listeners: ((message: string) => void)[];
    constructor(ipcRenderer: IpcRenderer) {
        this.broadcastToListeners = this.broadcastToListeners.bind(this);
        this.send = this.send.bind(this);
        this.startHandshake = this.startHandshake.bind(this);
        this.addListener = this.addListener.bind(this);
        this.getComputerInfo = this.getComputerInfo.bind(this);
        this.getTeensyInfo = this.getTeensyInfo.bind(this);

        this.ipcRenderer = ipcRenderer;

        this.listeners = [];

        // Set up to forward incoming messages to listeners
        this.ipcRenderer.on("udp-receive", (_event, message: string) => {
            this.broadcastToListeners(message);
        })

        // Alert the main process that a udp listener is available on this renderer
        this.ipcRenderer.send("udp-ipcregister");
    }
    broadcastToListeners(message: string) {
        for (const listener of this.listeners) {
            listener(message);
        }
    }
    send(message: string) {
        this.ipcRenderer.send("udp-send", message);
    }
    startHandshake(interval = 1000, onConnect?: () => void) {
        this.ipcRenderer.send("udp-start-handshake", interval);
        if (onConnect) {
            this.ipcRenderer.on("udp-handshake-connected", onConnect);
        }
    }
    // Registers a listener that accepts a string for every new message. Returns a function that can be used to unregister the listener.
    addListener(listener: (message: string) => void): () => void {
        this.listeners.push(listener);

        // Return a callback that unregisters the listener
        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
    }
    getComputerInfo(): { address: string, family: string, port: number } | null {
        return this.ipcRenderer.sendSync("udp-get-computer-info");
    }
    getTeensyInfo(): {
        address: string;
        family: "IPv4" | "IPv6";
        port: number;
        size: number;
    } | null {
        return this.ipcRenderer.sendSync("udp-get-teensy-info");
    }
}