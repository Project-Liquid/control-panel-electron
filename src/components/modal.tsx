import React, { ReactNode, useRef } from "react";
import cn from "classnames";

interface ModalProps {
    trigger: (openModal: () => void) => ReactNode,
    content: (closeModal: () => void) => ReactNode,
    modalBoxClassName?: string,
}
export default function Modal({ trigger, content, modalBoxClassName }: ModalProps) {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    return <>
        {trigger(() => {
            if (modalRef.current !== null) {
                modalRef.current.showModal();
            }
        })}
        <dialog className="modal" ref={modalRef}>
            <div className={cn("modal-box", modalBoxClassName)}>
                {content(() => {
                    if (modalRef.current !== null) {
                        modalRef.current.close();
                    }
                })}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </>
}