import * as React from 'react';
import { createRoot } from "react-dom/client";

import { Chat } from "./components/Chat";

function App() {
    return <Chat />;
}


const root = createRoot(document.getElementById("root")!);

root.render(<App />)