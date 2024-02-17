import { useEffect, useState } from "react";
import { FileStore } from "./filestore";

// JSON start code for the custom ui view
// TODO: save these using electron-store
const defaultLayout = {
    "ASI Test 01": `{
"inputs": {
    "P0": {"name": "N2O inlet", "type": "pres"},
    "P1": {"name": "N2O tank", "type": "pres"},
    "P2": {"name": "Ethane tank", "type": "pres"},
    "P3": {"name": "Ethane inlet run", "type": "pres"},
    "P4": {"name": "Chamber", "type": "pres"},
    "T0": {"name": "Thermocouple 0", "type": "temp"},
    "T1": {"name": "Thermocouple 1", "type": "temp"},
    "T2": {"name": "Thermocouple 2", "type": "temp"}
},
"actions": {
    "OFF": "VDW001020304050;SPK0;",
    "CLOSE": "VDW1020304150;SPK0;",
    "ARM 5sec": "VDW10410030;WAI50;VDW2151;WAI500;VDW1020304150;",
    "RELEASE 10sec": "VDW001020304150;WAI25;VDW11;WAI100;VDW40;WAI900;VDW1041;",
    "FIRE 3sec": "CLR;SPK1;WAI25;VDW0131;WAI300;VDW0030;WAI50;SPK0;VDW1020304150;",
    "RUN 3sec": "CLR;WAI25;VDW0131;WAI300;VDW0030;WAI50;VDW1020304150;",
    "ABORT FIRE": "CLR;VDW0030;WAI50;SPK0;VDW2050;",
    "VENT TANK REGION 10sec": "VDW0030;WAI25;VDW11214051;WAI1000;VDW001020304150;"
},
"valves": {
    "0": "N2O Run",
    "1": "N2O Vent",
    "2": "N2O Tank",
    "3": "Ethane Run",
    "4": "Ethane Vent",
    "5": "Ethane Tank"
},
"spark": true
}`};

declare global {
    interface Window {
        store: FileStore;
    }
}
export function useJsonLayouts() {
    const [jsonLayouts, _setJsonLayouts] = useState<Record<string, string>>({});

    useEffect(() => {
        // Initially load the saved layouts from store
        const storedLayouts = window.store.get("layouts");
        if (storedLayouts) {
            _setJsonLayouts(storedLayouts);
        } else {
            _setJsonLayouts(defaultLayout);
            window.store.set("layouts", defaultLayout);
        }
    }, []); // Do this only once, at the start

    const setJsonLayouts = (layouts: Record<string, string>) => {
        // Set the layouts in state and also update the store
        _setJsonLayouts(layouts);
        window.store.set("layouts", layouts);
    };

    return { jsonLayouts, setJsonLayouts };
}
