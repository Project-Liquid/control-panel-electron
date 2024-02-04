// React & co
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

// Components
import Nav from "./components/nav";
import { IcnCombined, IcnControl, IcnCustom, IcnTelemetry } from "./components/icons";

// Views
import Combined from "./views/combined";
import Telemetry from "./views/telemetry";
import Control from "./views/control";
import CustomView from "./views/customview";

// Utilities
import { JSONToLayout } from "./utility/layout";
import SetupModal from "./components/setupModal";
import { MenuLink } from "./components/MenuLink";
import { LayoutStoreContext } from "./context/jsonLayouts";

// JSON start code for the custom ui view
// TODO: store a record object with many named layout objects
// TODO: save these using electron-store
const defaultJson = `{
"name": "Engine Test 01",
"inputs": {
    "0": {"name": "Ethane tank", "type": "pres"},
    "1": {"name": "N2O tank", "type": "pres"},
    "2": {"name": "Ethane run", "type": "pres"},
    "3": {"name": "N2O run", "type": "pres"},
    "4": {"name": "Injector", "type": "temp"}
},
"actions": {
    "Abort": "ABO",
    "Seal tanks": "PDW 6:1 7:1",
    "Run": "PDW 8:1 9:1"
}
}`;

const jsonLayouts: Record<string, string> = {}

function App() {
    const [jsonText, setJsonText] = useState(defaultJson);
    const validated = JSONToLayout(jsonText);

    return <LayoutStoreContext.Provider value={{ jsonText: jsonText, setJsonText: setJsonText }}>
        <HashRouter>
            <Nav title="A&C Control Panel"
                sidebarItems={[
                    <MenuLink to="/" icon={<IcnCombined />}>Combined</MenuLink>,
                    <MenuLink to="/control" icon={<IcnControl />}>Control only</MenuLink>,
                    <MenuLink to="/telemetry" icon={<IcnTelemetry />}>Telemetry only</MenuLink>,
                    <MenuLink to="/custom" icon={<IcnCustom />}>{validated.kind === "success" && validated.result.name || "Custom"}</MenuLink>,
                ]}
                topRight={
                    <SetupModal validated={validated} />
                }>
                <Routes>
                    <Route path="/combined" element={<Combined />} />
                    <Route path="/" element={<Control />} />
                    <Route path="/telemetry" element={<Telemetry />} />
                    <Route path="/custom" element={<CustomView layout={validated.kind === "success" ? validated.result : null} />} />
                </Routes>
            </Nav>
        </HashRouter >
    </LayoutStoreContext.Provider>
}

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
