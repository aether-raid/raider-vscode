import {
  Box,
  CardContent,
  Grid,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
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
import {
  ArrowBack,
  Delete,
  FolderOpen,
  OpenInNew,
  Search,
} from "@mui/icons-material";

export const Codebases = () => {
  let { callApi } = useContext(WebviewContext);

  const [codebases, setCodebases] = useState<string[]>([]);

  const fetchCodebases = async () => {
    setCodebases(await callApi("getCodebases"));
  };

  useEffect(() => {
    fetchCodebases();

    let interval = setInterval(() => {
      fetchCodebases();
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  function getProjectName(codebase: string): string {
    let splits = codebase.split(/\/|\\/g);
    return splits[splits.length - 1];
  }

  function getProjectPath(codebase: string): string {
    let splits = codebase.split(/\/|\\/g);
    let path = splits.join("/");

    // path = path.replace(/[a-zA-Z]+:\/Users\/[^/]+/gi, "~/");

    path = path
      .replace(/[a-zA-Z]+:\/[uU]sers\/[^/]+\//gi, "~/")
      .replace(/\/home\/[^/]+\//gi, "~/");

    return path;
  }

  return (
    <CodebaseContainer>
      <Grid container alignItems="center">
        <IconButton onClick={() => callApi("navigateTo", "chat")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" component="div">
          Reference Codebases
        </Typography>
      </Grid>
      <ul>
        {codebases.map((it) => (
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
                  {/* {it} */}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "grey.500",
                    align: "right",
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
              <DeleteButton
                onClick={() => {
                  callApi("removeCodebase", it).then(() => {
                    fetchCodebases();
                  });
                }}
                color="error"
              >
                <Delete />
              </DeleteButton>
            </CodebaseCardMenu>
          </CodebaseCard>
        ))}
      </ul>
      {/* <Fab
        size="medium"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        aria-label="Add"
        color="primary"
        onClick={() => {
          callApi("openAddCodebase");
          fetchCodebases();
        }}
      >
        <Add />
      </Fab> */}
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
