import { useContext, useEffect, useState } from "react";
import {
  // Box,
  Grid,
  Typography,
  // Card,
  CardContent,
  CardActionArea,
  IconButton,
  Fab,
  Box,
} from "@mui/material";
import { Add, ArrowBack as ArrowBackIcon, Delete } from "@mui/icons-material";
// import { ChatBubbleOutline, ChatBubble } from "@mui/icons-material";
import { Message } from "../types";
import { WebviewContext } from "../WebviewContext";
import {
  DeleteButton,
  SessionCard,
  SessionCardMenu,
  SessionContainer,
  // SessionCardView,
  // Fonttype
} from "./History.styles";

interface Session {
  id: string;
  messages: Message[];
  lastUpdated: Date;
}

export const History = () => {
  const { callApi } = useContext(WebviewContext);

  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      setSessions(
        (await callApi("getSessions")).map((it) => ({
          id: it.id,
          lastUpdated: new Date(it.lastUpdated),
          messages: it.messages,
        }))
      );
    };
    fetchSessions();

    let interval = setInterval(() => {
      fetchSessions();
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  function getFirstQuery(messages: Message[]): string {
    let content = messages[0].content.trim();
    return content.length > 40 ? content.slice(0, 40).trim() + "..." : content;
  }

  function openSessionChat(session: Session) {
    callApi("openSessionChat", session.id);
  }

  return (
    <SessionContainer>
      <Grid container alignItems="center">
        <IconButton onClick={() => callApi("navigateTo", "chat")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="div">
          History
        </Typography>
      </Grid>
      <ul>
        {sessions.map((session, index) => (
          <SessionCard key={index}>
            <CardActionArea
              onClick={() => openSessionChat(session)}
              sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              <CardContent>
                {/* <SessionCardView> */}
                <Box>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="div"
                    sx={{ fontSize: "15px" }}
                  >
                    {getFirstQuery(session.messages)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", align: "right" }}
                  >
                    {session.lastUpdated.toLocaleString()}
                  </Typography>
                </Box>
                {/* </SessionCardView> */}
              </CardContent>
            </CardActionArea>
            <SessionCardMenu>
              <DeleteButton
                onClick={() => {
                  callApi("deleteSession", session.id);
                }}
                color="error"
              >
                <Delete />
              </DeleteButton>
            </SessionCardMenu>
          </SessionCard>
        ))}
      </ul>
      <Fab
        size="medium"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        aria-label="Add"
        color="primary"
        onClick={() => {
          callApi("newSession");
        }}
      >
        <Add />
      </Fab>
    </SessionContainer>
  );
};
