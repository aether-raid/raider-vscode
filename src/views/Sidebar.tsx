import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "./WebviewContext";
import { Chat } from "./Chat";
import { History } from "./History";

export const Sidebar = () => {
  const { callApi, addListener, removeListener } = useContext(WebviewContext);

  const [isHistoryPage, setHistoryPage] = useState(false);

  useEffect(() => {
    const toggleSessionPage = () => {
      // logic for converting Chat view to Session view
      setHistoryPage(true);
    };
    const toggleChatPage = () => {
      // logic for converting Chat view to Session view
      setHistoryPage(false);
    };

    addListener("showHistoryPage", toggleSessionPage);
    addListener("showChatPage", toggleChatPage);

    return () => {
      removeListener("showHistoryPage", toggleSessionPage);
      removeListener("showChatPage", toggleChatPage);
    };
  }, []);

  return isHistoryPage ? <History /> : <Chat />;
};
