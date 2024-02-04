import React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
export const LayoutStoreContext = React.createContext<{ jsonText: string, setJsonText: (text: string) => void }>({ jsonText: "", setJsonText: (_text: string) => { } });
