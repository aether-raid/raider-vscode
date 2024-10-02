import { Button, Typography, Box, IconButton } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { keyframes } from "@mui/system";

const flashAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

export const Disconnected = ({ onReconnect }: { onReconnect: () => void }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f8d7da" // Light red background
    >
      {/* Error icon */}
      <IconButton>
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: "#f44336", // Red color
            animation: `${flashAnimation} 1.5s infinite`,
          }}
        />
      </IconButton>

      {/* Flashing text */}
      <Typography
        variant="h4"
        sx={{
          color: "#f44336", // Red color
          fontWeight: "bold",
          mt: 2,
          animation: `${flashAnimation} 1.5s infinite`,
          align: "center",
          textAlign: "center",
        }}
      >
        System Disconnected!
      </Typography>

      {/* Reconnect button */}
      <Button
        variant="contained"
        color="error"
        onClick={onReconnect}
        sx={{ mt: 4, fontSize: "16px", fontWeight: "bold" }}
      >
        Reconnect
      </Button>
    </Box>
  );
};
