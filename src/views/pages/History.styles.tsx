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
  padding-bottom: 13px;
`;

export const SessionCard = styled(Card)`
  max-width: 100%;
  color: white;
  background-color: #000053;
  margin: 5px 5px;
  border-radius: 10px;
  white-space: pre-line;
`;

export const Fonttype = styled(Typography)`
  font-size:15px;

`;

/**
 * 
 *   &:hover {
    background-color: #005a9e;
  }
 */
