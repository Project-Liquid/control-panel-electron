import React, { CSSProperties } from "react";

// 0.8 => safe max
// 0.4 => opt
// -0.15 => safe min
//const pressureColorMap = (value: number) => {
//    const param = 0.4 + 1.2 * (1 / (1 + Math.exp(- (value - 750) / 50)) - 1 / 2);
//    console.log(value, param, param * 240);
//    return `hsl(${param * 240}, 100%, 40%)`;
//};

const PRES_CEIL = 100;

const pressureColorMap = (value: number) => {
    return `hsl(${(1 - value / PRES_CEIL) * 240}, 100%, 40%)`;
}

const tempColorMap = (value: number) => {
    return `hsl(${(1 - Math.min(value, 200) / 200) * 240}, 100%, 40%)`;
}

const ERR_COL = "hsl(-50, 100%, 40%)";

interface SensorProps {
    pct: number,
    color: string,
    readout: string,
    label: string,
    supLabel: string,
    big?: boolean,
}
export function Sensor({ pct, color, readout, label, supLabel, big = false }: SensorProps) {
    return <div className="p-4 flex justify-between items-center">
        <div className="flex flex-col justify-between">
            <div className="uppercase text-xs">{supLabel}</div>
            <div className="text-lg">{label}</div>
        </div>
        {big ?
            <div className="radial-progress border-4 border-base-200" style={{ "--value": pct, "--size": "6rem", "color": color } as CSSProperties}>
                <span className="text-base-content">{readout}</span>
            </div> :
            <div>
                <span className="text-base-content mr-3 text-lg font-mono">{readout}</span>
                <div className="radial-progress border-4 border-base-200" style={{ "--value": pct, "--size": "3rem", "color": color, "--thickness": "0.4rem" } as CSSProperties} />
            </div>
        }
    </div>;
}

interface PressureSensorProps {
    psi: number,
    name: string,
}
export function PressureSensor({ psi, name }: PressureSensorProps) {
    return <Sensor pct={isNaN(psi) ? 100 : 100 * psi / PRES_CEIL} color={isNaN(psi) ? ERR_COL : pressureColorMap(psi)} readout={isNaN(psi) ? "ERR" : `${psi.toFixed(2)} psi`} label={name} supLabel="Pressure Transducer" />;
}

interface TempSensorProps {
    deg: number,
    name: string,
}
export function TempSensor({ deg, name }: TempSensorProps) {
    return <Sensor pct={isNaN(deg) ? 100 : 100 * deg / 500} color={isNaN(deg) ? ERR_COL : tempColorMap(deg)} readout={isNaN(deg) ? "ERR" : `${deg.toFixed(2)} °C`} label={name} supLabel="Thermocouple" />;
}