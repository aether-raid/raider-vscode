import {
  Box,
  CardContent,
  Grid,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
  TextField,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "../WebviewContext";
import {
  CodebaseCard,
  CodebaseCardMenu,
  CodebaseContainer,
  DeleteButton,
  HoverIconButton,
} from "./Codebases.styles";
import { ArrowBack, Delete, FolderOpen, OpenInNew, Search, ContentCopy, GitHub } from "@mui/icons-material";
import { GitlabIcon } from './icons'; // Replace with correct GitLab icon

export const Codebases = () => {
  const { callApi } = useContext(WebviewContext);

  const [codebases, setCodebases] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCodebases, setFilteredCodebases] = useState<string[]>([]);

  // Mock function to get the repository type
  const getRepositoryType = (codebase: string) => {
    return codebase.includes("github") ? "github" : "gitlab";
  };

  // Mock function to get the project name
  const getProjectName = (codebase: string) => {
    return codebase.split("/").pop(); // Extracts the last part of the path
  };

  // Mock function to get the project path
  const getProjectPath = (codebase: string) => {
    return codebase;
  };

  // Fetch codebases (replace this with real API call if available)
  const fetchCodebases = () => {
    setCodebases([
      "https://github.com/sampleproject1",
      "https://gitlab.com/sampleproject2",
    ]);
  };

  useEffect(() => {
    fetchCodebases();
  }, []);

  useEffect(() => {
    const filtered = codebases.filter((codebase) =>
      codebase.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCodebases(filtered);
  }, [codebases, searchTerm]);

  return (
    <CodebaseContainer>
      <Grid container alignItems="center">
        <IconButton onClick={() => callApi("navigateTo", "chat")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" component="div">
          Reference Codebases
        </Typography>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginLeft: 2 }}
        />
      </Grid>
      <ul>
        {filteredCodebases.map((it) => {
          const repositoryType = getRepositoryType(it);
          return (
            <CodebaseCard key={it}>
              <CardContent>
                <Box>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="div"
                    sx={{ fontSize: "15px" }}
                  >
                    {getProjectName(it)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.500",
                      textAlign: "right",
                      fontFamily: "Consolas",
                    }}
                  >
                    {getProjectPath(it)}
                  </Typography>
                </Box>
              </CardContent>
              <CodebaseCardMenu>
                <HoverIconButton
                  onClick={() => {
                    callApi("openInNewWindow", it);
                  }}
                >
                  <OpenInNew />
                </HoverIconButton>
                <HoverIconButton
                  onClick={() => {
                    navigator.clipboard.writeText(it);
                  }}
                >
                  <ContentCopy />
                </HoverIconButton>
                {/* Render GitHub or GitLab icon here */}
                <Box display="flex" justifyContent="center" mt={1}>
                  {repositoryType === "github" ? <GitHub /> : <GitlabIcon />}
                </Box>
                <DeleteButton
                  onClick={() => {
                    callApi("removeCodebase", it);
                    fetchCodebases();
                  }}
                  color="error"
                >
                  <Delete />
                </DeleteButton>
              </CodebaseCardMenu>
            </CodebaseCard>
          );
        })}
      </ul>
      <SpeedDial
        FabProps={{ size: "medium" }}
        ariaLabel="Speed Dial"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<FolderOpen />}
          tooltipTitle="Add Local Folder"
          onClick={() => {
            callApi("openAddCodebase");
            fetchCodebases();
          }}
        />
        <SpeedDialAction
          icon={<Search />}
          tooltipTitle="Search Codebases"
          onClick={() => {
            callApi("navigateTo", "search");
          }}
        />
      </SpeedDial>
    </CodebaseContainer>
  );
};
