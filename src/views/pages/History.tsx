import { useContext, useEffect, useState } from "react";
import {
  // Box,
  Grid,
  Typography,
  // Card,
  CardContent,
  CardActionArea,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
// import { ChatBubbleOutline, ChatBubble } from "@mui/icons-material";
import { Message } from "../types";
import { WebviewContext } from "../WebviewContext";
import {
  SessionCard,
  SessionContainer,
  // Fonttype
} from "./History.styles";

interface Session {
  id: string;
  messages: Message[];
  lastUpdated: Date;
}

export const History = () => {
  const { callApi } = useContext(WebviewContext);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "0",
      messages: [
        {
          role: "user",
          content: "why is this error caused",
        },
      ],
      lastUpdated: new Date(2024, 8, 16, 16, 30),
    },
    {
      id: "1",
      messages: [
        {
          role: "user",
          content: "what is the reason for this existing",
        },
      ],
      lastUpdated: new Date(2024, 8, 16, 12, 30),
    },
    {
      id: "2",
      messages: [
        {
          role: "user",
          content: "what is going on here dude",
        },
      ],
      lastUpdated: new Date(2024, 8, 16, 8, 30),
    },
  ]);

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
    return messages[0].content;
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
            <CardActionArea onClick={() => openSessionChat(session)}>
              <CardContent>
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
              </CardContent>
            </CardActionArea>
          </SessionCard>
        ))}
      </ul>
    </SessionContainer>
  );
};
