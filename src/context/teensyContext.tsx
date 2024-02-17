import React, { useEffect, useRef, useState } from "react";
import { UdpIPC } from "../utility/udpIPC";
import { FileStore } from "../utility/filestore";

declare global {
    interface Window {
        udp: UdpIPC,
        store: FileStore,
        openFileDialog: (cb: (filePaths: string[]) => void) => void,
        newTimestampedFile: (dirname: string, cb: (filename: string) => void) => void,
        appendFile: (filepath: string, data: string) => void,
    }
}

interface TeensyContextInterface {
    connected: boolean,
    inputs: Record<string, string>,
    valves: Record<string, string>,
    spark: boolean,
    udpSend: (command: string) => void,
    recording: boolean,
    setRecording: (v: boolean) => void,
    chooseRecordingDirectory: () => void,
}

export const TeensyContext = React.createContext<TeensyContextInterface>({
    connected: false,
    inputs: {},
    valves: {},
    spark: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    udpSend: () => { },
    recording: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setRecording: () => { },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    chooseRecordingDirectory: () => { },
});

const LOS_HEARTBEATS = 2;
const HEARTBEAT_MILLIS = 250;
const MESSAGE_LOG_BUFSIZE = 100;

export function useMessageLog() {
    const messageLog = useRef<string[]>([]);
    const recordingFile = useRef("");

    const flushMessages = () => {
        //console.log("flushMessages", recordingFile.current);
        window.appendFile(recordingFile.current, messageLog.current.join("\n"));
        //let newMessageLog: string[] | null = window.store.get("messageLog");
        //if (newMessageLog === null) {
        //    newMessageLog = messageLog.current;
        //} else {
        //    newMessageLog.push(...messageLog.current);
        //}
        //window.store.set("messageLog", newMessageLog);
        messageLog.current = [];
    };

    const recordMessage = (message: string) => {
        const now = new Date();
        messageLog.current.push(`${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}.${now.getMilliseconds()}, ${message}`);

        if (messageLog.current.length > MESSAGE_LOG_BUFSIZE) {
            flushMessages();
        }
    };

    return {
        recordMessage, flushMessages, recordingFile
    }
}

export function useTeensyStateReceiver(): TeensyContextInterface {
    // Teensy connection state for render purposes
    const [connected, setConnected] = useState(false);

    // Whether we are recording a log
    const [recording, setRecording] = useState(false);
    const recordingDirectory = useRef("");

    // This tracks most recent state to be used in the udp listener
    // If these were useState and not refs, we'd need to reregister the listener on almost every message
    const teensyStateModel = useRef<{
        heartbeatCount: number,
        recording: boolean,
        inputs: Record<string, string>,
        valves: Record<string, string>,
        spark: boolean,
    }>({
        heartbeatCount: 0,
        recording: false,
        inputs: {},
        valves: {},
        spark: false,
    });
    // Render state, which is manually updated from teensyStateModel
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [valves, setValves] = useState<Record<string, string>>({});
    const [spark, setSpark] = useState(false);

    const { recordMessage, flushMessages, recordingFile } = useMessageLog();

    const udpSend = (message: string) => {
        if (teensyStateModel.current.recording) {
            // TODO: write the message to a file
            recordMessage("g, " + message);
            console.log("g, ", message);
        }
        // Actually send message over udp
        window.udp.send(message);
    };

    // Setup heartbeat timer
    useEffect(() => {
        const interval = setInterval(() => {
            if (teensyStateModel.current.heartbeatCount >= LOS_HEARTBEATS) {
                setConnected(false);
            }
            udpSend("ECH"); // Echo command
            teensyStateModel.current.heartbeatCount++;
        }, HEARTBEAT_MILLIS);
        // If this code must be rerun, first get rid of the old interval
        return () => clearInterval(interval);
    }, []); // Never rerun this code if possible


    // Register the udp listener
    useEffect(() => {
        return window.udp.addListener(message => {
            // Store that we are connected and reset the missed heartbeat counter
            setConnected(true);
            teensyStateModel.current.heartbeatCount = 0;

            if (teensyStateModel.current.recording) {
                // TODO: write the message to a file
                recordMessage("t, " + message);
                //console.log("t, ", message);
            }

            const code = message.slice(0, 3);
            if (code === "VDW") {
                //console.log("VDW received");
                for (let i = 3; i < message.length; i += 2) {
                    if (message.length - i >= 2) {
                        teensyStateModel.current.valves[message[i]] = message[i + 1];
                    }
                }
                //console.log("calling setValves");
                setValves({ ...teensyStateModel.current.valves });
            } else if (code === "SPK") {
                if (message.length >= 4) {
                    teensyStateModel.current.spark = (message[3] == "1");
                    setSpark(teensyStateModel.current.spark);
                }
            } else if (code === "DAT") {
                let inputCode = "";
                let inputValue = "";
                for (let i = 3; ;) {
                    if (inputCode === "") {
                        if (message[i + 1] !== undefined) {
                            inputCode = message[i] + message[i + 1];
                            i += 2;
                        } else {
                            break;
                        }
                    } else {
                        if (message[i] === undefined || message[i] === "P" || message[i] === "T") {
                            teensyStateModel.current.inputs[inputCode] = inputValue;
                            inputCode = "";
                            inputValue = "";
                            if (message[i] === undefined) break;
                        } else {
                            inputValue += message[i];
                            i++;
                        }
                    }
                }
                setInputs({ ...teensyStateModel.current.inputs });
            }
        });
    }, []); // Never rerun this - it shouldn't ever rely on the render state, just refs
    return {
        connected, inputs, valves, spark, udpSend, recording,
        setRecording: (v: boolean) => {
            if (v === false) {
                flushMessages();
            } else {
                if (recordingDirectory.current == "") {
                    alert("No directory selected!");
                    return;
                } else {
                    window.newTimestampedFile(recordingDirectory.current, filename => {
                        recordingFile.current = filename;
                    });
                }
            }
            teensyStateModel.current.recording = v;
            setRecording(v);
        },
        chooseRecordingDirectory: () => window.openFileDialog(filePaths => {
            if (filePaths.length > 0) {
                recordingDirectory.current = filePaths[0];
                console.log(recordingDirectory.current);
            }
        }),
    };
}
