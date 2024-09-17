import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';

interface Session {
  query: string;
  timestamp: Date;
}

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const addSession = (query: string) => {
    setSessions((prevSessions: Session[]) => [...prevSessions, { query, timestamp: new Date() }]);
  };

  const handleUserQuery = (query: string) => {
    addSession(query); // Call addSession when you receive a user query
  };

  return (
    <Box>
      <Grid container alignItems="center">
        <ChatBubbleOutline />
        <Typography variant="h6">Sessions</Typography>
      </Grid>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            <Typography variant="body2">
              {session.query} - {session.timestamp.toLocaleString()}
            </Typography>
          </li>
        ))}
      </ul>
      <button onClick={() => handleUserQuery('Example query')}>Send Query</button>
    </Box>
  );
};

export default SessionsPage ;