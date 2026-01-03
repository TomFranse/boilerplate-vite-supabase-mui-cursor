import { Typography } from "@mui/material";

export const SupabaseDescription = () => {
  return (
    <Typography variant="body2" color="text.secondary" paragraph>
      Enter your Supabase project URL and publishable key to connect your app. This enables user
      authentication and allows you to use cloud database features. If you don't have a Supabase
      project yet,{" "}
      <Typography
        component="a"
        href="https://supabase.com"
        target="_blank"
        rel="noopener"
        sx={{ color: "primary.main", textDecoration: "underline" }}
      >
        create a free account
      </Typography>
      . You can skip this step and configure it later if you prefer to use browser storage for now.
    </Typography>
  );
};
