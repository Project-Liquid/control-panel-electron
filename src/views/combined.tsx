import React, { useState } from "react";
import { PressureSensor, TempSensor } from "../components/sensor";
import classNames from "classnames";

export default function Combined() {
    return <main className="flex min-w-full min-h-full">
        <div className="shrink-0 basis-3/4 flex flex-col">
            <div className="shrink-0 basis-2/3 flex">
                <Stages />
                <Manual />
            </div>
            <div className="shrink-0 basis-1/3 flex"><Grapher /></div>
        </div>
        <div className="shrink-0 basis-1/4 flex"><Display /></div>
    </main>;
}

function Stages() {
    return <div className="shrink-0 basis-2/3 grid place-items-center outline-dashed">Stages</div>;
}

function Manual() {
    //return <div className="grow grid place-items-center outline-dashed">Manual</div>
    const [on, setOn] = useState(false);
    return <div className="shrink-0 basis-1/3 grid grid-cols-3 p-4 gap-4 h-fit items-center">
        <span className="text-xs uppercase">Name</span><span className="text-xs uppercase">Off</span><span className="text-xs uppercase">Powered</span>
        <ManualValve on={on} setOn={setOn} />
    </div>
}

interface ManualValveProps {
    on: boolean,
    setOn: (open: boolean) => void,
}
function ManualValve({ on, setOn }: ManualValveProps) {
    return <>
        <span>Ethane Tank</span>
        <button className={classNames("btn", !on && "btn-primary")} onClick={() => setOn(false)}>Open</button>
        <button className={classNames("btn outline outline-4 outline-warning", on && "btn-primary")} onClick={() => setOn(true)}>Closed</button>
    </>
}

function Display() {
    //return <div className="grow grid place-items-center outline-dashed">Display</div>
    const [psiStr, setPsiStr] = useState("180");
    return <div className="grow">
        <PressureSensor name="Ethane Tank" psi={parseFloat(psiStr)} />
        <PressureSensor name="Ethane Run Line" psi={parseFloat(psiStr)} />
        <TempSensor name="Engine Temperature" deg={parseFloat(psiStr)} />
        <input className="ml-4 block" type="text" onChange={e => setPsiStr(e.target.value)} value={psiStr} />
    </div>
}

function Grapher() {
    return <div className="flex-1 grid place-items-center outline-dashed">
        <div className="">Graph</div>
    </div>;
}