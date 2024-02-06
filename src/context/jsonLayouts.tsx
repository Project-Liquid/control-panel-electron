import React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export const LayoutStoreContext = React.createContext<{ layouts: Record<string, string>, setLayouts: (layouts: Record<string, string>) => void }>({ layouts: {}, setLayouts: (_text: Record<string, string>) => { } });
