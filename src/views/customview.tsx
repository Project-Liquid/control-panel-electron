import React, { useState } from "react";
import Layout from "../utility/layout";
import { PressureSensor, TempSensor } from "../components/sensor";
import { IcnControl, IcnRecord } from "../components/icons";
import cn from "classnames";

interface CustomViewProps {
    layout: Layout | null,
}
export default function CustomView({ layout }: CustomViewProps) {
    const [recording, setRecording] = useState(false); // TODO: do this for real
    return <main className="min-h-full flex items-stretch">
        {!layout && <div className="m-auto max-w-xl">No custom layout has been defined</div>}
        {
            layout && <>
                {layout.recorder && <div className="flex-0 px-5 border-r-2 border-neutral-content flex flex-col items-center space-y-3">
                    <span className="text-xs uppercase">Recorder</span>
                    <button className={cn("btn btn-circle", recording ? "btn-error" : "btn-outline")} onClick={() => setRecording(!recording)}><IcnRecord /></button>
                </div>}
                <div className="flex-1 flex justify-center space-x-3">
                    {layout.actions && <div className="flex-1 max-w-md">
                        <h1 className="text-xl text-secondary w-full text-center">Actions</h1>
                        {Object.entries(layout.actions).map(([name, command], idx) => <button key={idx} className="btn block w-full my-1" onClick={() => console.log(command)}>{name}</button>)}
                    </div>}
                    <div className="flex-1 max-w-md">
                        {layout.inputs && Object.entries(layout.inputs).map(([input, { name, type }], idx) => <div key={idx}>
                            {type === "pres" && <PressureSensor name={name} psi={50} />}
                            {type === "temp" && <TempSensor name={name} deg={50} />}
                        </div>)}
                    </div>
                </div>

            </>
        }
    </main>
}
