import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "./WebviewContext";
import { Chat } from "./Chat";
import { History } from "./History";

export const Sidebar = () => {
  const { callApi, addListener, removeListener } = useContext(WebviewContext);

  // const [isHistoryPage, setHistoryPage] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "chat" | "history" | "settings"
  >("chat");

  useEffect(() => {
    const showPage = (page: "chat" | "history" | "settings") => {
      console.log(page, "cooked");
      setCurrentPage(page);
    };
    addListener("showPage", showPage);

    return () => {
      removeListener("showPage", showPage);
    };
  }, []);

  return currentPage == "history" ? <History /> : <Chat />;
};
