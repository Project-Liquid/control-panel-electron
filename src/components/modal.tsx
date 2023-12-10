import React, { ReactNode, useRef } from "react";

interface ModalProps {
    children?: ReactNode,
    trigger: (openModal: () => void) => ReactNode,
}
export default function Modal({ children, trigger }: ModalProps) {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    return <>
        {trigger(() => {
            if (modalRef.current !== null) {
                modalRef.current.showModal();
            }
        })}
        <dialog className="modal" ref={modalRef}>
            <div className="modal-box w-11/12 max-w-5xl h-3/4">
                {children}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </>
}