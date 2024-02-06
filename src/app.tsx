// React & co
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

// Components
import Nav from "./components/nav";

// Views
import Debug from "./views/debug";
import CustomView from "./views/customview";

// Utilities
import { LayoutStoreContext } from "./context/jsonLayouts";
import { TeensyContext, useTeensyStateReceiver } from "./context/teensyContext";

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
    "ARM": "VDW10410030;WAI50;VDW2151;",
    "RELEASE": "VDW001020304150;WAI25;VDW1140;",
    "FIRE 3sec": "SPK1;WAI25;VDW0131;WAI300;VDW0030;WAI50;SPK0;VDW2050;",
    "ABORT FIRE": "CLR;VDW0030;WAI50;SPK0;VDW2050;",
    "VENT TANK REGION": "VDW0030;WAI25;VDW11214051;"
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

function App() {
    const [jsonLayouts, setJsonLayouts] = useState<Record<string, string>>(defaultLayout);

    // Start heartbeating, listen for messages, parse them, update state
    const teensyRenderState = useTeensyStateReceiver();

    return <TeensyContext.Provider value={teensyRenderState}>
        <LayoutStoreContext.Provider value={{ layouts: jsonLayouts, setLayouts: setJsonLayouts }}>
            <HashRouter>
                <Nav title="A&C Control Panel">
                    <Routes>
                        <Route path="/" element={<Debug />} />
                        {/*<Route path="/combined" element={<Combined />} />
                        <Route path="/telemetry" element={<Telemetry />} />*/}
                        <Route path="/custom/:name" element={<CustomView />} />
                    </Routes>
                </Nav>
            </HashRouter >
        </LayoutStoreContext.Provider>
    </TeensyContext.Provider>
}

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
