import { Box, Typography, Card, IconButton } from "@mui/material";
import styled from "@emotion/styled";

export const CodebaseContainer = styled(Box)`
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

export const CodebaseCard = styled(Card)`
  max-width: 100%;
  color: white;
  background-color: #000053;
  margin: 10px 10px;
  border-radius: 10px;
  white-space: pre-line;
  display: flex;
  flex-direction: row;
  align-items: start;
`;

export const CodebaseCardView = styled(Box)`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
`;

export const CodebaseCardMenu = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
`;

export const DeleteButton = styled(IconButton)`
  &:hover {
    color: #ff7f7f;
  }
  padding-bottom: 10px;
`;

export const HoverIconButton = styled(IconButton)`
  &:hover {
    color: #aaa;
  }
`;

export const Fonttype = styled(Typography)`
  font-size: 15px;
`;

/**
 * 
 *   &:hover {
    background-color: #005a9e;
  }
 */
