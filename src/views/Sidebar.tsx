import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "./WebviewContext";
import { Chat } from "./pages/Chat";
import { History } from "./pages/History";
import { Settings } from "./pages/settings";
import { Codebases } from "./pages/Codebases";
import { Search } from "./pages/Search";
import { Disconnected } from "./pages/DisconnectWarning";

type Page =
  | "chat"
  | "history"
  | "codebases"
  | "settings"
  | "search"
  | "disconnected";

export const Sidebar = () => {
  const { addListener, removeListener } = useContext(WebviewContext);

  // const [isHistoryPage, setHistoryPage] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("chat");

  useEffect(() => {
    const showPage = (page: Page) => {
      setCurrentPage(page);
    };

    const disconnect = () => {
      setCurrentPage("disconnected");
    };

    addListener("showPage", showPage);
    addListener("disconnectServer", disconnect);

    return () => {
      removeListener("showPage", showPage);
      removeListener("disconnectServer", disconnect);
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
  ) : currentPage == "disconnected" ? (
    <Disconnected onReconnect={() => {}} />
  ) : (
    <Chat />
  );
};
