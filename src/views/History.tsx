import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";

interface Session {
  query: string;
  workspace: string;
  timestamp: Date;
}

export const History = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      query: "why is this error caused",
      workspace: "raider-chat",
      timestamp: new Date(2024, 8, 16, 16, 30),
    },
    {
      query: "what is the reason for this existing",
      workspace: "raider-chat",
      timestamp: new Date(2024, 8, 16, 12, 30),
    },
    {
      query: "what is going on here dude",
      workspace: "raider-chat",
      timestamp: new Date(2024, 8, 16, 8, 30),
    },
  ]);

  // const addSession = (query: string) => {
  //   setSessions((prevSessions: Session[]) => [
  //     ...prevSessions,
  //     { query, workspace: "raider-chat", timestamp: new Date() },
  //   ]);
  // };

  // const handleUserQuery = (query: string) => {
  //   addSession(query); // Call addSession when you receive a user query
  // };

  return (
    <Box>
      <Grid container alignItems="center">
        <ChatBubbleOutline />
        <Typography variant="h6">History</Typography>
      </Grid>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            <Box>
              <Typography variant="body2">
                {session.query} - {session.timestamp.toLocaleString()}
              </Typography>
            </Box>
          </li>
        ))}
      </ul>
      {/* <button onClick={() => handleUserQuery('Example query')}>Send Query</button> */}
    </Box>
  );
};
