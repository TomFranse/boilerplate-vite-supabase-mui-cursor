import { Box, TextField } from "@mui/material";

interface AirtableFormFieldsProps {
  apiKey: string;
  baseId: string;
  tableId: string;
  onApiKeyChange: (value: string) => void;
  onBaseIdChange: (value: string) => void;
  onTableIdChange: (value: string) => void;
}

export const AirtableFormFields = ({
  apiKey,
  baseId,
  tableId,
  onApiKeyChange,
  onBaseIdChange,
  onTableIdChange,
}: AirtableFormFieldsProps) => {
  return (
    <Box sx={{ my: 3 }}>
      <TextField
        label="Airtable API Key"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        fullWidth
        margin="normal"
        type="password"
        placeholder="pat..."
        helperText="Personal Access Token from Airtable account settings"
      />
      <TextField
        label="Airtable Base ID"
        value={baseId}
        onChange={(e) => onBaseIdChange(e.target.value)}
        fullWidth
        margin="normal"
        placeholder="app..."
        helperText="Found in your base's API documentation"
      />
      <TextField
        label="Airtable Table ID"
        value={tableId}
        onChange={(e) => onTableIdChange(e.target.value)}
        fullWidth
        margin="normal"
        placeholder="My Table"
        helperText="The name of your table (e.g., 'My Table')"
      />
    </Box>
  );
};
