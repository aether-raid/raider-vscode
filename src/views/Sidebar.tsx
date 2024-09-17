import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "./WebviewContext";
import { Chat } from "./Chat";
import { History } from "./History";

type Page = "chat" | "history" | "codebases" | "settings";

export const Sidebar = () => {
  const { callApi, addListener, removeListener } = useContext(WebviewContext);

  // const [isHistoryPage, setHistoryPage] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("chat");

  useEffect(() => {
    const showPage = (page: Page) => {
      setCurrentPage(page);
    };
    addListener("showPage", showPage);

    return () => {
      removeListener("showPage", showPage);
    };
  }, []);

  return currentPage == "history" ? <History /> : <Chat />;
};
