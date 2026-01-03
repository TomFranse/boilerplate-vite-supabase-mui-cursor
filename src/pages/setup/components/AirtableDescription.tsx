import { Alert, Typography, List, ListItem, ListItemText } from "@mui/material";

export const AirtableDescription = () => {
  return (
    <>
      <Typography variant="body2" color="text.secondary" paragraph>
        You can configure Airtable as an alternative data backend. Airtable is data-only;
        authentication still requires Supabase. If you don't have an Airtable account yet,{" "}
        <Typography
          component="a"
          href="https://airtable.com"
          target="_blank"
          rel="noopener"
          sx={{ color: "primary.main", textDecoration: "underline" }}
        >
          create a free account
        </Typography>
        . You can also skip this step and use Supabase or browser storage.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> To use Airtable, you'll need:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Personal Access Token (from Airtable account settings)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Base ID (found in your base's API documentation)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Table ID (the name of your table, e.g., 'My Table')" />
          </ListItem>
        </List>
      </Alert>
    </>
  );
};
