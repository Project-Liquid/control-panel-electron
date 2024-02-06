import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface MenuLinkProps {
    to: string;
    children: ReactNode;
    icon: ReactNode;
}
export function MenuLink({ to, icon, children }: MenuLinkProps) {
    return <Link to={to}>{icon} <span className="ml-2">{children}</span></Link>;
}
