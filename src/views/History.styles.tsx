import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import styled from "@emotion/styled";

export const SessionContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: calc(100vw-0px);
  height: 100vh;
  padding: 0px;
  overflow: hidden;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 20px;
`;

export const SessionCard = styled(Card)`
  max-width: 100%;
  color: white;
  background-color: #007acc;
  margin: 5px 10px;
  border-radius: 10px;
  white-space: pre-line;
`;

/**
 * 
 *   &:hover {
    background-color: #005a9e;
  }
 */
