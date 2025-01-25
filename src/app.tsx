// React & co
import React from "react";
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
import { useJsonLayouts } from "./utility/useJsonLayouts";

function App() {
    const { jsonLayouts, setJsonLayouts } = useJsonLayouts();

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
