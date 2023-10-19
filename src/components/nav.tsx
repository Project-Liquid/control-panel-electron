import React, { CSSProperties, ReactNode, useState } from 'react';

interface NavProps {
    title: string,
    children: ReactNode,
    sidebarItems: ReactNode[],
    topRight: ReactNode,
}

export default function Nav({ title, children, sidebarItems, topRight }: NavProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return <div className="drawer drawer-end min-h-screen">
        <input type="checkbox" id="sidebar-drawer" className="drawer-toggle" checked={sidebarOpen} readOnly />
        <div className="drawer-content min-h-full flex flex-col">
            <div className="navbar bg-base-100 mt-[-0.25em] flex-none" style={{ "WebkitUserSelect": "none", "WebkitAppRegion": "drag" } as CSSProperties}>
                <div className="navbar-start"></div>
                <div className="navbar-center text-xl">{title}</div>
                <div className="navbar-end">
                    <div style={{ "WebkitAppRegion": "no-drag" } as CSSProperties}>
                        {topRight}
                    </div>
                    <div style={{ "WebkitAppRegion": "no-drag" } as CSSProperties}>
                        <button className="btn btn-ghost ml-2" onClick={() => setSidebarOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-grow">{children}</div>
        </div>
        <div className="drawer-side">
            <button className="drawer-overlay" aria-label="close sidebar" onClick={() => setSidebarOpen(false)}></button>
            <ul className="menu min-h-full w-80 p-4 text-base-content bg-base-200">
                <li className="menu-title">Views</li>
                {sidebarItems.map((item, idx) => <li key={idx} onClick={() => setSidebarOpen(false)}>{item}</li>)}
            </ul>
        </div>
    </div>;
}