import React, { useEffect, useRef, useState } from "react";
import { UdpIPC } from "../utility/udpIPC";

declare global {
    interface Window {
        udp: UdpIPC
    }
}

export const TeensyContext = React.createContext<{
    connected: boolean,
    inputs: Record<string, string>,
    valves: Record<string, string>,
    spark: boolean,
    udpSend: (command: string) => void,
    recording: boolean,
    setRecording: (v: boolean) => void,
}>({
    connected: false,
    inputs: {},
    valves: {},
    spark: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    udpSend: () => { },
    recording: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setRecording: () => { },
});

const LOS_HEARTBEATS = 3;
const HEARTBEAT_MILLIS = 500;

export function useTeensyStateReceiver() {
    // Teensy connection state for render purposes
    const [connected, setConnected] = useState(false);

    // Whether we are recording a log
    const [recording, setRecording] = useState(false);

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
    const udpSend = (message: string) => {
        if (teensyStateModel.current.recording) {
            // TODO: write the message to a file
            console.log("RECORDING-out:", message);
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
                console.log("RECORDING-in:", message);
            }

            const code = message.slice(0, 3);
            if (code === "VDW") {
                for (let i = 3; i < message.length; i += 2) {
                    if (message.length - i >= 2) {
                        teensyStateModel.current.valves[message[i]] = message[i + 1];
                    }
                }
                setValves(teensyStateModel.current.valves);
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
                setInputs(teensyStateModel.current.inputs);
            }
        });
    }, []); // Never rerun this - it shouldn't ever rely on the render state, just refs
    return {
        connected, inputs, valves, spark, udpSend, recording,
        setRecording: (v: boolean) => {
            teensyStateModel.current.recording = v;
            setRecording(v);
        }
    };
}
