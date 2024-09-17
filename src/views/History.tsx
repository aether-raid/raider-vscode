import React, { useState } from "react";
import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
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

  return (
    <Box>
      <Grid container alignItems="center">
        <ChatBubbleOutline />
        <Typography variant="h6">History</Typography>
      </Grid>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            {/* Wrap each session with a Card component */}
            <Card>
              <CardContent>
                <Typography variant="body2">
                  {session.query} - {session.timestamp.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Box>
  );
};
