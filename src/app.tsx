import React from "react";
import { createRoot } from "react-dom/client";
import Nav from "./components/nav";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { IcnCombined, IcnControl, IcnTelemetry } from "./components/icons";
import Combined from "./views/combined";
import Telemetry from "./views/telemetry";
import Control from "./views/control";

function App() {
    return <HashRouter>
        <Nav title="A&C Control Panel"
            sidebarItems={[
                <Link to="/"><IcnCombined /> Combined</Link>,
                <Link to="/control"><IcnControl /> Control only</Link>,
                <Link to="/telemetry"><IcnTelemetry /> Telemetry only</Link>]}
            topRight={
                <button className="btn btn-ghost normal-case">Setup</button>
            }>
            <Routes>
                <Route path="/" element={<Combined />} />
                <Route path="/control" element={<Control />} />
                <Route path="/telemetry" element={<Telemetry />} />
            </Routes>
        </Nav>
    </HashRouter>
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);