import dgram from "node:dgram";
import { TeensyCommand, handshake } from "./teensyCommands";
import { TeensyMessage, TeensyMessageId, TeensyParseResult, parseFromTeensy } from "./teensyReceive";

const TEENSY_IP = "169.254.44.72";
const TEENSY_UDP_PORT = 5190;

export class ParsedUdpController {
    socket: dgram.Socket;
    computerAddress: {
        address: string;
        family: string;
        port: number;
    } | null;
    teensyRemoteInfo: {
        address: string;
        family: "IPv4" | "IPv6";
        port: number;
        size: number;
    } | null;
    listeners: ((message: TeensyParseResult) => void)[];
    handshakeRunning: boolean;
    constructor() {
        this.send = this.send.bind(this);
        this.startHandshake = this.startHandshake.bind(this);
        this.addListener = this.addListener.bind(this);
        this.addParsedListener = this.addParsedListener.bind(this);
        this.startReceiving = this.startReceiving.bind(this);

        this.socket = dgram.createSocket("udp4");
        this.computerAddress = null;
        this.teensyRemoteInfo = null;
        this.listeners = [];
        this.handshakeRunning = false;

        this.socket.on("listening", () => {
            console.log("Listening on:", this.socket.address());
            this.computerAddress = this.socket.address();
        });

        this.startReceiving();

        this.socket.bind(TEENSY_UDP_PORT);
    }
    send(message: TeensyCommand) {
        this.socket.send(message as string, TEENSY_UDP_PORT, TEENSY_IP);
    }
    startReceiving() {
        // All essential "on message" listeners for the socket should be registered here.
        // This is so that we can put them all back at once if/when they get removed

        // Set up a general listener for all udp messages. This listener attempts to parse each incoming message, then passes on the result to all listeners registered on this object (using addListener or addRawListener)
        this.socket.on("message", (message, remote) => {
            if (remote.address !== TEENSY_IP) {
                console.log(`WARNING: I received a udp message but not from the expected IP address for the teensy (${TEENSY_IP}). Proceeding anyway.`);
                // TODO: maybe don't proceed if we get unknown origin messages?
            }
            const parsed = parseFromTeensy(message.toString());
            for (const listener of this.listeners) {
                listener(parsed);
            }
        })
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
    // Registers a listener that accepts a "parse result" for every new message. Returns a function that can be used to unregister the listener.
    addParsedListener(listener: (message: TeensyParseResult) => void): () => void {
        this.listeners.push(listener);

        // Return a callback that unregisters the listener
        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
    }
    startHandshake(interval = 1000, onConnect?: () => void) {
        if (this.handshakeRunning) {
            return;
        }
        this.handshakeRunning = true;

        // Reset record of teensy contact
        this.teensyRemoteInfo = null;

        // When we hear back, record that we have heard back
        this.socket.on("message", (message, remote) => {
            const parsed = parseFromTeensy(message.toString());
            if (
                parsed.kind === "success" &&
                parsed.message.id === TeensyMessageId.handshake
            ) {
                this.teensyRemoteInfo = remote;

                // Remove this listener and add the essential message listener
                this.socket.removeAllListeners("message");
                this.startReceiving();

                this.handshakeRunning = false;

                // Optionally run some user code
                if (onConnect) onConnect();
            } else {
                console.log(`WARNING: I received a udp message but could not identify it as a handshake message.\n${parsed.kind === "error" ? parsed.reason : parsed.message}\nThe message: ${message}\nReceived from: ${JSON.stringify(remote)}`);
            }
        });

        // Function that periodically (and asynchronously) checks if teensy is connected, and if not sends a handshake message
        const scan = () => {
            console.log("Scanning...");
            if (this.teensyRemoteInfo === null) {
                this.send(handshake());
                setTimeout(scan, interval)
            }
        };

        // Start looking
        scan();
    }
}

export class UdpController {
    socket: dgram.Socket;
    computerAddress: {
        address: string;
        family: string;
        port: number;
    } | null;
    teensyRemoteInfo: {
        address: string;
        family: "IPv4" | "IPv6";
        port: number;
        size: number;
    } | null;
    listeners: ((message: string) => void)[];
    handshakeRunning: boolean;
    constructor() {
        this.send = this.send.bind(this);
        this.startHandshake = this.startHandshake.bind(this);
        this.addListener = this.addListener.bind(this);
        this.startReceiving = this.startReceiving.bind(this);

        this.socket = dgram.createSocket("udp4");
        this.computerAddress = null;
        this.teensyRemoteInfo = null;
        this.listeners = [];
        this.handshakeRunning = false;

        this.socket.on("listening", () => {
            console.log("Listening on:", this.socket.address());
            this.computerAddress = this.socket.address();
        });

        this.startReceiving();

        // "169.254.44.50"
        this.socket.bind(TEENSY_UDP_PORT, undefined, () => console.log("Socket bind successful!"));
    }
    send(message: string) {
        //console.log("udpController: socket.send(", message, TEENSY_UDP_PORT, TEENSY_IP, ")");
        this.socket.send(message, TEENSY_UDP_PORT, TEENSY_IP);
    }
    startReceiving() {
        // All essential "on message" listeners for the socket should be registered here.
        // This is so that we can put them all back at once if/when they get removed

        // Set up a general listener for all udp messages. This listener attempts to parse each incoming message, then passes on the result to all listeners registered on this object (using addListener or addRawListener)
        this.socket.on("message", (message, remote) => {
            if (remote.address !== TEENSY_IP) {
                console.log(`WARNING: I received a udp message but not from the expected IP address for the teensy (${TEENSY_IP}). Proceeding anyway.`);
                // TODO: maybe don't proceed if we get unknown origin messages?
            }
            // Just assume whoever's talking to us is the teensy (maybe not secure)
            this.teensyRemoteInfo = remote;
            for (const listener of this.listeners) {
                listener(message.toString());
            }
        })
    }
    // Registers a listener that accepts a string for every new message. Returns a function that can be used to unregister the listener.
    addListener(listener: (message: string) => void): () => void {
        this.listeners.push(listener);

        // Return a callback that unregisters the listener
        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
            console.log("Removed listener: ", this.listeners, "remaining");
        }
    }
    startHandshake(interval = 1000, onConnect?: () => void) {
        if (this.handshakeRunning) {
            return;
        }
        this.handshakeRunning = true;

        // Reset record of teensy contact
        this.teensyRemoteInfo = null;

        // When we hear back, record that we have heard back
        this.socket.on("message", (message, remote) => {
            const parsed = parseFromTeensy(message.toString());
            if (
                parsed.kind === "success" &&
                parsed.message.id === TeensyMessageId.handshake
            ) {
                this.teensyRemoteInfo = remote;

                // Remove this listener and add the essential message listener
                this.socket.removeAllListeners("message");
                this.startReceiving();

                this.handshakeRunning = false;

                // Optionally run some user code
                if (onConnect) onConnect();
            } else {
                console.log(`WARNING: I received a udp message but could not identify it as a handshake message.\n${parsed.kind === "error" ? parsed.reason : parsed.message}\nThe message: ${message}\nReceived from: ${JSON.stringify(remote)}`);
            }
        });

        // Function that periodically (and asynchronously) checks if teensy is connected, and if not sends a handshake message
        const scan = () => {
            console.log("Scanning...");
            if (this.teensyRemoteInfo === null) {
                this.send(handshake());
                setTimeout(scan, interval)
            }
        };

        // Start looking
        scan();
    }
}
