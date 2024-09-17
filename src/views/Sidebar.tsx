import { useContext, useEffect } from "react";
import { WebviewContext } from "./WebviewContext";
import { Chat } from "./Chat";

export const Sidebar = () => {
  const { callApi, addListener, removeListener } = useContext(WebviewContext);

  useEffect(() => {
    const toggleSessionPage = () => {
      // logic for converting Chat view to Session view
    };

    addListener("showSessionPage", toggleSessionPage);

    return () => {
      removeListener("showSessionPage", toggleSessionPage);
    };
  }, []);

  return <Chat />;
};
