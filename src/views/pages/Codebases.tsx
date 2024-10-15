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
  CodebaseContainer,
  CodebaseCard,
  CodebaseCardMenu,
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

function getProjectName(codebase: string): string {
  let splits = codebase.split(/\/|\\/g);
  return splits[splits.length - 1];
}

function getProjectPath(codebase: string): string {
  let splits = codebase.split(/\/|\\/g);
  let path = splits.join("/");

  path = path
    .replace(/[a-zA-Z]+:\/[uU]sers\/[^/]+\//gi, "~/")
    .replace(/\/home\/[^/]+\//gi, "~/");

  return path;
}

export const Codebase = ({
  codebase,
  refresh,
}: {
  codebase: string;
  refresh: () => void;
}) => {
  let { callApi } = useContext(WebviewContext);
  return (
    <CodebaseCard>
      <CardContent>
        <Box>
          <Typography
            gutterBottom
            variant="h4"
            component="div"
            sx={{ fontSize: "15px" }}
          >
            {getProjectName(codebase)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "grey.500",
              align: "right",
              fontFamily: "Consolas",
            }}
          >
            {getProjectPath(codebase)}
          </Typography>
        </Box>
      </CardContent>
      <CodebaseCardMenu>
        <HoverIconButton
          onClick={() => {
            callApi("openInNewWindow", codebase);
          }}
        >
          <OpenInNew />
        </HoverIconButton>
        <DeleteButton
          onClick={() => {
            callApi("removeCodebase", codebase).then(() => {
              refresh();
            });
          }}
          color="error"
        >
          <Delete />
        </DeleteButton>
      </CodebaseCardMenu>
    </CodebaseCard>
  );
};

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
          <Codebase codebase={it} refresh={fetchCodebases} key={it} />
        ))}
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
