import React from "react";
import cn from "classnames";

type UIStyle = "default" | "neutral" | "primary" | "secondary" | "accent" | "ghost" | "info" | "success" | "warning" | "error";

interface BeepDotProps {
    state?: UIStyle,
}
export function BeepDot({ state = "primary" }: BeepDotProps) {
    const textStyle = {
        "default": "text-default",
        "neutral": "text-neutral",
        "primary": "text-primary",
        "secondary": "text-secondary",
        "accent": "text-accent",
        "ghost": "text-ghost",
        "info": "text-info",
        "success": "text-success",
        "warning": "text-warning",
        "error": "text-error",
    }[state];
    const badgeStyle = {
        "default": "badge-default",
        "neutral": "badge-neutral",
        "primary": "badge-primary",
        "secondary": "badge-secondary",
        "accent": "badge-accent",
        "ghost": "badge-ghost",
        "info": "badge-info",
        "success": "badge-success",
        "warning": "badge-warning",
        "error": "badge-error",
    }[state];
    return <span>
        <span className={cn("loading loading-ring relative translate-y-1/4 translate-x-1/4", textStyle)}></span>
        <span className={cn("badge badge-xs relative -translate-x-full", badgeStyle)}></span>
    </span>;
}