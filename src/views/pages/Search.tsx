import { useContext, useState } from "react";
import { WebviewContext } from "../WebviewContext";
import { Box, CardContent, Grow, IconButton, Typography } from "@mui/material";
import {
  SearchContainer,
  SearchField,
  SearchResultCard,
  SearchResultCardActionArea,
  SearchResultCardMenu,
  SearchResultContainer,
  getIcon,
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
              {getIcon(result.type) && (
                <IconButton size="small">{getIcon(result.type)}</IconButton>
              )}{" "}
              {result.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500", align: "right" }}
            >
              {result.url.replace(/https?:\/\//i, "")}
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
          {/* {getIcon() && <IconButton size="small">{getIcon()}</IconButton>} */}
        </SearchResultCardMenu>
      </SearchResultCardActionArea>
    </SearchResultCard>
  );
};

export const Search = () => {
  const { callApi } = useContext(WebviewContext);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Codebase[]>([]);

  const [disabled, setDisabled] = useState(false);

  const search = async () => {
    if (searchText && searchText.length > 0) {
      setDisabled(true);
      let results = await callApi("search", searchText);
      setDisabled(false);
      console.log(`raider-chat web-raider search results (client): ${results}`);
      setSearchResults(results);
    }
  };

  return (
    <SearchContainer>
      <SearchField
        input={searchText}
        setInput={setSearchText}
        handleSearch={search}
        disabled={disabled}
      />
      <SearchResultContainer>
        {searchResults.map((result, index) => (
          <SearchResult key={index} result={result} />
        ))}
      </SearchResultContainer>
    </SearchContainer>
  );
};
