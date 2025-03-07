import React, { useContext } from "react";
import { JSONToLayout } from "../utility/layout";
import { PressureSensor, TempSensor } from "../components/sensor";
import { IcnRecord, IcnSpark } from "../components/icons";
import cn from "classnames";
import { LayoutStoreContext } from "../context/jsonLayouts";
import { useParams } from "react-router";
import { TeensyContext } from "../context/teensyContext";

export default function CustomView() {
    const { udpSend, spark, valves, recording, setRecording } = useContext(TeensyContext);
    const { layouts } = useContext(LayoutStoreContext)
    const { name } = useParams();
    const validated = name ? JSONToLayout(layouts[name]) : null;
    const layout = (validated && validated.kind == "success") ? validated.result : null;

    return <main className="min-h-full flex items-stretch">
        {!layout && <div className="m-auto max-w-xl">Layout "{name}" does not exist. Choose an existing layout from the menu or click "edit" to create a new one.</div>}
        {
            layout && <>
                {(layout.recorder || layout.spark) && <div className="flex-0 px-5 border-r-2 border-neutral-content flex flex-col items-center space-y-3">

                    {layout.recorder && <>
                        <span className="text-xs uppercase">Recorder</span>
                        <button className={cn("btn btn-circle", recording ? "btn-error" : "btn-outline")} onClick={() => setRecording(!recording)}><IcnRecord /></button>
                    </>}
                    {layout.spark && <>
                        <span className="text-xs uppercase">Spark Plug</span>
                        <button className={cn("btn btn-circle", spark ? "btn-error" : "btn-outline")} onClick={
                            spark ? (() => udpSend("SPK0")) : (() => udpSend("SPK1"))
                        }><IcnSpark /></button>
                    </>}

                </div>}
                <div className="flex-1 flex justify-center space-x-3">
                    {(layout.actions || layout.valves) && <div className="flex-1 max-w-xs space-y-3">
                        {layout.actions && <>
                            <h1 className="text-xl text-secondary w-full text-center">Actions</h1>
                            <div className="space-y-1">
                                {Object.entries(layout.actions).map(([name, command], idx) => <button key={idx} className="btn block w-full my-1" onClick={
                                    () => udpSend(command)
                                }>{name}</button>)}
                            </div>

                        </>}

                        {layout.valves && <>
                            <h1 className="text-xl text-secondary w-full text-center">Valves</h1>
                            <div className="space-y-1 max-w-xs m-auto">
                                {Object.entries(layout.valves).map(([code, name], idx) => <div key={idx} className="flex justify-between items-center">
                                    <span>{name}</span>
                                    <span className="space-x-3">
                                        <button className={cn("btn", (valves[code] === "0") ? "btn-error" : "")} onClick={() => udpSend("VDW" + code + "0")}>Off</button>
                                        <button className={cn("btn", (valves[code] === "1") ? "btn-success" : "")} onClick={() => udpSend("VDW" + code + "1")}>On</button>
                                    </span>
                                </div>)}
                            </div>
                        </>}
                    </div>}
                    <div className="flex-1 max-w-md">
                        {// eslint-disable-next-line @typescript-eslint/no-unused-vars
                            layout.inputs && Object.entries(layout.inputs).map(([input, { name, type }], idx) => <div key={idx}>
                                {type === "pres" && <PressureTracker name={name} input={input} />}
                                {type === "temp" && <TempTracker name={name} input={input} />}
                            </div>)}
                    </div>
                </div>

            </>
        }
    </main >
}

interface PressureTrackerProps {
    name: string,
    input: string,
}

function PressureTracker({ name, input }: PressureTrackerProps) {
    const { inputs } = useContext(TeensyContext);
    return <PressureSensor name={name} psi={parseFloat(inputs[input])} />
}

interface TempTrackerProps {
    name: string,
    input: string,
}

function TempTracker({ name, input }: TempTrackerProps) {
    const { inputs } = useContext(TeensyContext);
    return <TempSensor name={name} deg={parseFloat(inputs[input])} />
}
