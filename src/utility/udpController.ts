import dgram from "node:dgram";
import { AddressInfo } from "node:net";
import { TeensyCommand, handshake } from "./teensyCommands";
import { TeensyMessage, TeensyMessageId, TeensyParseResult, parseFromTeensy } from "./teensyReceive";

const TEENSY_IP = "169.254.44.72";
const TEENSY_UDP_PORT = 5190;

export class UdpController {
    socket: dgram.Socket;
    computerAddress: AddressInfo | null;
    teensyRemoteInfo: dgram.RemoteInfo | null;
    listeners: ((message: TeensyParseResult, remote?: dgram.RemoteInfo) => void)[];
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

        this.socket.on("listening", () => {
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
                // TODO: probably don't proceed if we get unknown origin messages?
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
    startHandshake(interval = 1000) {
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
            } else {
                console.log(`WARNING: I received a udp message but could not identify it as a handshake message.\n${parsed.kind === "error" ? parsed.reason : parsed.message}\nThe message: ${message}\nReceived from: ${remote}`);
            }
        });

        // Function that periodically (and asynchronously) checks if teensy is connected, and if not sends a handshake message
        const scan = () => {
            if (this.teensyRemoteInfo === null) {
                this.send(handshake());
                setTimeout(scan, interval)
            }
        };

        // Start looking
        scan();
    }
}
