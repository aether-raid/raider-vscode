import React, { useState } from "react";
import { Box, Grid, Typography, TextField } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

export const Settings = () => {
  const [apiKey1, setApiKey1] = useState("");
  const [apiKey2, setApiKey2] = useState("");
  const [apiKey3, setApiKey3] = useState("");

  return (
    <Box>
      <Grid container alignItems="center">
        <ArrowBackIcon />
        <Typography variant="h6">Settings</Typography>
      </Grid>
      <Typography variant="subtitle1">API Keys</Typography>
      <TextField
        label="API Key 1"
        value={apiKey1}
        onChange={(e) => setApiKey1(e.target.value)}
        fullWidth
      />
      <TextField
        label="API Key 2"
        value={apiKey2}
        onChange={(e) => setApiKey2(e.target.value)}
        fullWidth
      />
      <TextField
        label="API Key 3"
        value={apiKey3}
        onChange={(e) => setApiKey3(e.target.value)}
        fullWidth
      />
    </Box>
  );
};
