import styled from "@emotion/styled";
import {
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  OutlinedInput,
  IconButton,
  Card,
  CardActionArea,
} from "@mui/material";
import { ThemeButton, fontArray } from "../theme/theme";
import { Search } from "@mui/icons-material";

import githubLogo from "../assets/github-logo.svg";

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
        placeholder="Search..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onEnter}
        endAdornment={
          <SearchInputIconContainer position="end">
            <IconButton onClick={handleSearch}>
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

export const RemoteIcon = ({
  type,
  width,
  height,
}: {
  type: "github" | "gitlab" | "bitbucket" | "gitee";
  width: number;
  height: number;
}) => {
  if (type === "github") {
  }

  let iconUrl =
    type === "github"
      ? "../assets/github-logo.svg" // "https://cdn0.iconfinder.com/data/icons/shift-logotypes/32/Github-512.png"
      : type === "gitlab"
      ? "/static/gitlab-logo.svg" // "https://www.cloudservices.store/site/wp-content/uploads/2020/10/logo-extra-whitespace.png"
      : type === "bitbucket"
      ? "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/44_Bitbucket_logo_logos-512.png"
      : type === "gitee"
      ? "https://avatars.githubusercontent.com/u/95162452?v=4"
      : "";
  return <img src={iconUrl} width={width} height={height} />;
};
