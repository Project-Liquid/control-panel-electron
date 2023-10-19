import React from "react";
import { BeepDot } from "../components/ui";

export default function Telemetry() {
    return <main><Beeper /></main>;
}

function Beeper() {
    return <main className="max-w-screen-lg mx-auto px-10">
        <BeepDot state="error" />
        <span>Loading fuel...</span>
    </main>;
}