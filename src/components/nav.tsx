import React, { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { themeChange } from 'theme-change'

interface NavProps {
    title: string,
    children: ReactNode,
    sidebarItems: ReactNode[],
    topRight: ReactNode,
}

export default function Nav({ title, children, sidebarItems, topRight }: NavProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(() => {
        themeChange(false);
    }, []);

    return <div className="drawer drawer-end min-h-screen">
        <input type="checkbox" id="sidebar-drawer" className="drawer-toggle" checked={sidebarOpen} readOnly />
        <div className="drawer-content min-h-full flex flex-col">
            <div className="navbar bg-base-100 mt-[-0.25em] flex-none" style={{ "WebkitUserSelect": "none", "WebkitAppRegion": "drag" } as CSSProperties}>
                <div className="navbar-start">
                    <div className="w-24"></div>
                    <div style={{ "WebkitAppRegion": "no-drag" } as CSSProperties}>
                        <label className="flex cursor-pointer gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
                            <input type="checkbox" data-toggle-theme="light,dark" data-act-class="ACTIVECLASS" className="toggle" />
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        </label>
                    </div>
                </div>
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