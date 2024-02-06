import React, { ReactNode, useContext, useState } from "react";
import Modal from "./modal";
import { LayoutStoreContext } from "../context/jsonLayouts";

// TODO: setup modal stores its own json text, then puts this into context
// TODO: button to apply changes
interface NewLayoutModalProps {
    trigger: (openModal: () => void) => ReactNode,
    onCreated?: (newName: string) => void,
}
export function NewLayoutModal({ trigger, onCreated }: NewLayoutModalProps) {
    const { layouts, setLayouts } = useContext(LayoutStoreContext);
    const [newName, setNewName] = useState("");
    return <Modal trigger={trigger} content={
        closeModal => <form>
            <h1 className="mb-3">Enter a name for the new layout:</h1>
            <div className="flex flex-row space-x-3">
                <input type="text" value={newName} className="input flex-1" onChange={(e) => setNewName(e.target.value)} />
                <button className="btn btn-primary" onClick={() => {
                    if (newName && layouts[newName] == undefined) {
                        const newLayouts = { ...layouts };
                        newLayouts[newName] = "{}";
                        setLayouts(newLayouts);
                        if (onCreated) onCreated(newName);
                        closeModal();
                    }
                }}>Done</button>
            </div>
        </form>} />;
}
