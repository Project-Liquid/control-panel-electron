import React, { useContext, useEffect, useState } from "react";
import cn from "classnames";

import Modal from "./modal";
import { JSONToLayout } from "../utility/layout";
import { LayoutStoreContext } from "../context/jsonLayouts";
import { NewLayoutModal } from "./NewLayoutModal";
import { TeensyContext } from "../context/teensyContext";

export default function SetupModal() {
    const { layouts, setLayouts } = useContext(LayoutStoreContext);
    const { chooseRecordingDirectory } = useContext(TeensyContext);
    const [jsonText, setJsonText] = useState("");
    const validated = JSONToLayout(jsonText);
    const [layoutName, setLayoutName] = useState("");

    useEffect(() => {
        // Load the accurate layout text when the layouts / current layout changes
        if (layouts[layoutName] != undefined) setJsonText(layouts[layoutName]);
    }, [layouts, layoutName]);

    return <Modal modalBoxClassName="w-11/12 max-w-5xl h-3/4"
        trigger={
            openModal => {
                return <button className="btn btn-ghost normal-case" onClick={openModal}>Edit</button>;
            }
        } content={
            closeModal => <>
                <div className="h-full flex flex-col justify-between">
                    <div>
                        <div className="mb-5 space-x-5">
                            <h1 className="inline">Insert JSON for a custom ui layout:</h1>
                            <select className="inline select select-bordered w-full max-w-xs" value={layoutName} onChange={(e) => setLayoutName(e.target.value)}>
                                <option disabled value="">Layout name:</option>
                                {Object.entries(layouts).map(([name]) => <option value={name} key={name}>{name}</option>)}
                            </select>
                            <NewLayoutModal trigger={
                                openModal => <button className="btn btn-neutral" onClick={openModal}>New layout</button>
                            } onCreated={newName => setLayoutName(newName)} />
                            <button className="btn btn-neutral" onClick={() => chooseRecordingDirectory()}>Choose File</button>
                        </div>
                        <div className="w-full flex flex-row space-x-3">
                            <textarea className="basis-2/3 textarea textarea-bordered text-lg font-mono" rows={12} value={jsonText} onChange={e => setJsonText(e.target.value)} disabled={layoutName == ""} placeholder={layoutName == "" ? "No layout selected" : ""}></textarea>
                            <code className="basis-1/3 bg-neutral block my-3 relative p-4 pb-8 text-neutral-content rounded-md max-h-40 overflow-y-scroll">
                                <div className={
                                    cn("badge absolute bottom-3 right-4", validated.kind === "success" ? "badge-success" : "badge-error")
                                }>
                                    {
                                        validated.kind === "success" ? "valid" : (validated.kind === "syntax" ? "syntax error" : "invalid")
                                    }
                                </div>
                                {validated.kind === "success" ? JSON.stringify(validated.result) : validated.error}
                            </code>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <div className="space-x-2">
                            <button className={cn("btn", (validated.kind === "success" && layouts[layoutName] != jsonText) ? "btn-primary" : "btn-disabled")} onClick={() => {
                                // If the current jsonText is valid, create a new layouts object and store the new text
                                if (validated.kind === "success") {
                                    const newLayouts = { ...layouts };
                                    newLayouts[layoutName] = jsonText;
                                    setLayouts(newLayouts);
                                }
                            }}>{(layouts[layoutName] == jsonText) ? "Saved" : "Save"}</button>
                            <button className="btn btn-neutral" onClick={closeModal}>Close</button>
                        </div>
                        <button className={cn("btn", (layoutName === "") ? "btn-disabled" : "btn-error")} onClick={() => {
                            if (layoutName !== "") {
                                const newLayouts = { ...layouts };
                                delete newLayouts[layoutName];
                                setLayouts(newLayouts);
                                setLayoutName("");
                            }

                        }}>Delete layout</button>
                    </div>
                </div>
            </>
        } />
}