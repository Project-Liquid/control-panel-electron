import React, { ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import Nav from "./components/nav";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { IcnCombined, IcnControl, IcnCustom, IcnTelemetry } from "./components/icons";
import Modal from "./components/modal";
import Combined from "./views/combined";
import Telemetry from "./views/telemetry";
import Control from "./views/control";
import cn from "classnames";
import CustomView from "./views/customview";
import { JSONToLayout } from "./utility/layout";

// UDP (renderer side)
//import { UdpIPC } from './utility/udpIPC';

//declare global {
//    interface Window {
//        udp: UdpIPC
//    }
//}

//window.udp.startHandshake();
//window.udp.addListener(console.log);

// JSON start code for the custom ui view
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

interface MenuLinkProps {
    to: string,
    children: ReactNode,
    icon: ReactNode,
}
function MenuLink({ to, icon, children }: MenuLinkProps) {
    return <Link to={to}>{icon} <span className="ml-2">{children}</span></Link>
}

function App() {
    const [jsonText, setJsonText] = useState(defaultJson);
    const validated = JSONToLayout(jsonText);

    return <HashRouter>
        <Nav title="A&C Control Panel"
            sidebarItems={[
                <MenuLink to="/" icon={<IcnCombined />}>Combined</MenuLink>,
                <MenuLink to="/control" icon={<IcnControl />}>Control only</MenuLink>,
                <MenuLink to="/telemetry" icon={<IcnTelemetry />}>Telemetry only</MenuLink>,
                <MenuLink to="/custom" icon={<IcnCustom />}>{validated.kind === "success" && validated.result.name || "Custom"}</MenuLink>,
            ]}
            topRight={
                <Modal trigger={(openModal) => <button className="btn btn-ghost normal-case" onClick={openModal}>Setup</button>}>
                    <h1 className="mb-3">Insert JSON for a custom ui layout:</h1>
                    <textarea className="textarea textarea-bordered w-full text-lg font-mono" rows={15} value={jsonText} onChange={e => setJsonText(e.target.value)}></textarea>
                    <code className="bg-neutral block my-3 relative p-4 pb-8 text-neutral-content rounded-md">
                        <div className={
                            cn("badge absolute bottom-3 right-4", validated.kind === "success" ? "badge-success" : "badge-error")
                        }>
                            {
                                validated.kind === "success" ? "valid" : (validated.kind === "syntax" ? "syntax error" : "invalid")
                            }
                        </div>
                        {validated.kind === "success" ? JSON.stringify(validated.result) : validated.error}
                    </code>
                </Modal>
            }>
            <Routes>
                <Route path="/combined" element={<Combined />} />
                <Route path="/" element={<Control />} />
                <Route path="/telemetry" element={<Telemetry />} />
                <Route path="/custom" element={<CustomView layout={validated.kind === "success" ? validated.result : null} />} />
            </Routes>
        </Nav>
    </HashRouter >
}

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
