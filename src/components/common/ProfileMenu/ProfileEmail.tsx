import { Typography } from "@mui/material";

interface ProfileEmailProps {
  email: string;
}

export const ProfileEmail = ({ email }: ProfileEmailProps) => {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {email}
    </Typography>
  );
};
