import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon, TableChart } from "@mui/icons-material";
import type { AirtableTableStructure } from "@shared/services/airtableService";

interface TableStructureDisplayProps {
  structure: AirtableTableStructure | null;
  loading?: boolean;
  error?: string | null;
}

/**
 * Get human-readable field type name
 */
const getFieldTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    singleLineText: "Single Line Text",
    multilineText: "Multiline Text",
    email: "Email",
    url: "URL",
    number: "Number",
    percent: "Percent",
    currency: "Currency",
    singleSelect: "Single Select",
    multipleSelects: "Multiple Selects",
    date: "Date",
    dateTime: "Date & Time",
    phoneNumber: "Phone Number",
    checkbox: "Checkbox",
    rating: "Rating",
    duration: "Duration",
    attachment: "Attachment",
    collaborator: "Collaborator",
    multipleCollaborators: "Multiple Collaborators",
    link: "Link",
    multipleRecordLinks: "Multiple Record Links",
    rollup: "Rollup",
    count: "Count",
    formula: "Formula",
    createdTime: "Created Time",
    lastModifiedTime: "Last Modified Time",
    button: "Button",
  };

  return typeMap[type] || type;
};

export const TableStructureDisplay = ({
  structure,
  loading,
  error,
}: TableStructureDisplayProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Fetching table structure...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (!structure) {
    return null;
  }

  return (
    <Box>
      <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Table found:</strong> {structure.name}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Found {structure.fields.length} field{structure.fields.length !== 1 ? "s" : ""}
        </Typography>
      </Alert>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <TableChart />
          Table Structure
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Review the fields in your Airtable table:
        </Typography>
      </Box>

      <Stack spacing={2}>
        {structure.fields.map((field) => (
          <Card key={field.id} variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ fontWeight: (theme) => theme.typography.fontWeightMedium }}
                >
                  {field.name}
                </Typography>
                <Chip
                  label={getFieldTypeLabel(field.type)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              {field.options && Object.keys(field.options).length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Options: {JSON.stringify(field.options)}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
