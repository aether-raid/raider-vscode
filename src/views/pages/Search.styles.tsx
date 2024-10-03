import styled from "@emotion/styled";
import {
  Box,
  InputAdornment,
  OutlinedInput,
  IconButton,
  Card,
  CardActionArea,
} from "@mui/material";
import { fontArray } from "../theme/theme";
import { Search } from "@mui/icons-material";

import { GitHub } from "@mui/icons-material";
// Import GitLab, Bitbucket, Gitee icons from react-icons
import { FaGitlab, FaBitbucket } from "react-icons/fa";
import { SiGitee } from "react-icons/si";

export const SearchContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: calc(100vw-0px);
  height: 100vh;
  padding: 0px;
  overflow: hidden;
`;

export const SearchInputContainer = styled(Box)`
  position: sticky;
  top: 0;
  margin-left: 10px;
  margin-right: 10px;
`;

export const SearchInput = styled(OutlinedInput)`
  background-color: #313244;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  font-family: ${fontArray};
  width: 100%;

  & .Mui-focused {
    outline: none;
  }
`;

export const SearchInputIconContainer = styled(InputAdornment)`
  align-items: center;
  justify-content: bottom;
  display: flex;
  flex-direction: row;
  column-gap: 0.5rem;
  margin-top: auto;
  margin-bottom: 0.75rem;
`;

export type SearchFieldProps = {
  input: string;
  setInput: (it: string) => void;
  handleSearch: () => void;
};

export const SearchField = ({
  input,
  setInput,
  handleSearch,
}: SearchFieldProps) => {
  const onEnter = (evt: React.KeyboardEvent) => {
    if (evt.key === "Enter") {
      evt.preventDefault();
      handleSearch();
    }
  };
  return (
    <SearchInputContainer>
      <SearchInput
        maxRows={10}
        placeholder="Search now..."
        multiline
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onEnter}
        endAdornment={
          <SearchInputIconContainer position="end">
            <IconButton
              aria-label="send chat"
              edge="end"
              onClick={handleSearch}
              disabled={input && input.length == 0 ? true : false}
            >
              <Search />
            </IconButton>
          </SearchInputIconContainer>
        }
      />
    </SearchInputContainer>
  );
};

export const SearchResultContainer = styled(Box)`
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

export const SearchResultCard = styled(Card)`
  max-width: 100%;
  color: white;
  background-color: #000053;
  margin: 10px 10px;
  border-radius: 10px;
  white-space: pre-line;
`;

export const SearchResultCardActionArea = styled(CardActionArea)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const SearchResultCardView = styled(Box)`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
`;

export const SearchResultCardMenu = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
`;

export const HoverIconButton = styled(IconButton)`
  &:hover {
    color: #aaa;
  }
  padding-bottom: 10px;
`;

export const GithubIcon = GitHub;
export const GitlabIcon = FaGitlab; // Use GitLab from react-icons
export const BitbucketIcon = FaBitbucket; // Use Bitbucket from react-icons
export const GiteeIcon = SiGitee; // Use Gitee from react-icons

export const getIcon = (type: string) => {
  switch (type) {
    case "github":
      return <GithubIcon />;
    case "gitlab":
      return <GitlabIcon />;
    case "bitbucket":
      return <BitbucketIcon />;
    case "gitee":
      return <GiteeIcon />;
    default:
      return null;
  }
};
