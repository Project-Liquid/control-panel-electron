import React, { useContext, useState } from "react";
import { JSONToLayout } from "../utility/layout";
import { PressureSensor, TempSensor } from "../components/sensor";
import { IcnRecord } from "../components/icons";
import cn from "classnames";
import { LayoutStoreContext } from "../context/jsonLayouts";
import { useParams } from "react-router";
import { TeensyContext } from "../context/teensyContext";

export default function CustomView() {
    const { udpSend } = useContext(TeensyContext);
    const { layouts } = useContext(LayoutStoreContext)
    const { name } = useParams();
    const validated = name ? JSONToLayout(layouts[name]) : null;
    const layout = (validated && validated.kind == "success") ? validated.result : null;

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
                        {Object.entries(layout.actions).map(([name, command], idx) => <button key={idx} className="btn block w-full my-1" onClick={
                            () => udpSend(command)
                        }>{name}</button>)}
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