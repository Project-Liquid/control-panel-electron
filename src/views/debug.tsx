import React, { useEffect, useRef, useState } from "react";
import { UdpIPC } from "../utility/udpIPC";

declare global {
    interface Window {
        udp: UdpIPC
    }
}

export default function Debug() {
    const [cmd, setCmd] = useState("");
    const [log, setLog] = useState<string[]>([]);
    const logRef = useRef(log);
    logRef.current = log;
    const [cptInfo, setCptInfo] = useState("pending...");
    const [tsyInfo, setTsyInfo] = useState("pending...");
    useEffect(() => {
        setInterval(() => {
            setTsyInfo(JSON.stringify(window.udp.getTeensyInfo()));
            setCptInfo(JSON.stringify(window.udp.getComputerInfo()));
        }, 1000);

        return window.udp.addListener(message => {
            const newLog = [...logRef.current];
            newLog.unshift((new Date()).toLocaleTimeString() + " " + message);
            setLog(newLog);
        });
    }, [])
    return <main className="p-3 m-auto max-w-md">
        <div className="text-primary">Command: </div>
        <form>
            <input type="text" className="input input-primary mr-3" value={cmd} onChange={e => setCmd(e.target.value)} />
            <button className="btn" onClick={() => {
                window.udp.send(cmd);
                setCmd("");
            }}>Send</button>
        </form>

        <h2>Computer info:</h2>
        <p>{cptInfo}</p>
        <h2>Teensy info:</h2>
        <p>{tsyInfo}</p>
        <hr />
        <h2>Message log:</h2>
        <div className="overflow-y-scroll max-h-40 p-3 border-slate-950 border">
            <ol className="">
                {log.map((msg, idx) => <li key={idx}>{msg}</li>)}
            </ol>
        </div>
    </main>;
}