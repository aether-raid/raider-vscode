import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "./WebviewContext";
import { Chat } from "./pages/Chat";
import { History } from "./pages/History";
import { Settings } from "./pages/settings";
import { Codebases } from "./pages/Codebases";
import { Search } from "./pages/Search";

type Page = "chat" | "history" | "codebases" | "settings" | "search";

export const Sidebar = () => {
  const { addListener, removeListener } = useContext(WebviewContext);

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

  return currentPage == "history" ? (
    <History />
  ) : currentPage == "settings" ? (
    <Settings />
  ) : currentPage == "codebases" ? (
    <Codebases />
  ) : currentPage == "search" ? (
    <Search />
  ) : (
    <Chat />
  );
};
