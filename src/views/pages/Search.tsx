import { useContext, useState } from "react";
import { WebviewContext } from "../WebviewContext";
import {
  Box,
  CardActionArea,
  CardContent,
  Grow,
  IconButton,
  Typography,
} from "@mui/material";
import {
  HoverIconButton,
  SearchContainer,
  SearchField,
  SearchResultCard,
  SearchResultCardActionArea,
  SearchResultCardMenu,
  SearchResultContainer,
} from "./Search.styles";
import { Check, ContentCopy } from "@mui/icons-material";

type Codebase = {
  type: "github" | "gitlab" | "bitbucket" | "gitee";
  name: string;
  url: string;
};

const SearchResult = ({ result }: { result: Codebase }) => {
  const { callApi } = useContext(WebviewContext);

  const [copied, setCopied] = useState(false);
  const [showCopy, setCopy] = useState(false);

  const handleCopy = () => {
    callApi("writeToClipboard", result.url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <SearchResultCard
      onMouseOver={() => setCopy(true)}
      onMouseOut={() => setCopy(false)}
    >
      <SearchResultCardActionArea onClick={handleCopy}>
        <CardContent>
          <Box>
            <Typography
              gutterBottom
              variant="h4"
              component="div"
              sx={{ fontSize: "15px" }}
            >
              {result.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500", align: "right" }}
            >
              {result.url}
            </Typography>
          </Box>
        </CardContent>
        <SearchResultCardMenu>
          {showCopy && (
            <IconButton
              size="large"
              sx={{ marginBottom: "auto", marginTop: "auto" }}
              onClick={handleCopy}
              color={copied ? "success" : "default"}
            >
              {!copied ? (
                <Grow in={!copied}>
                  <ContentCopy />
                </Grow>
              ) : (
                <Grow in={copied}>
                  <Check />
                </Grow>
              )}
            </IconButton>
          )}
        </SearchResultCardMenu>
      </SearchResultCardActionArea>
    </SearchResultCard>
  );
};

export const Search = () => {
  const { callApi } = useContext(WebviewContext);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Codebase[]>([]);

  const search = async () => {
    let results = await callApi("search", searchText);
    setSearchResults(results);
  };

  return (
    <SearchContainer>
      <SearchField
        input={searchText}
        setInput={setSearchText}
        handleSearch={search}
      />
      <SearchResultContainer>
        {searchResults.map((result, index) => (
          <SearchResult key={index} result={result} />
        ))}
      </SearchResultContainer>
    </SearchContainer>
  );
};
