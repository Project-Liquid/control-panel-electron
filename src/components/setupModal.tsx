import React, { useContext } from "react";
import cn from "classnames";

import Modal from "./modal";
import { LayoutParseError, LayoutParseResult } from "../utility/layout";
import { LayoutStoreContext } from "../context/jsonLayouts";

interface SetupModalProps {
    validated: LayoutParseResult | LayoutParseError,
}

// TODO: setup modal stores its own json text, then puts this into context
// TODO: button to apply changes

export default function SetupModal({ validated }: SetupModalProps) {
    const { jsonText, setJsonText } = useContext(LayoutStoreContext);

    return <Modal trigger={(openModal) => <button className="btn btn-ghost normal-case" onClick={openModal}>Setup</button>}>
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
}