# App Configuration File (`app.config.json`)

## Overview

The `app.config.json` file stores the current state of app configuration in a format that Cursor agent can read and understand. This file is automatically synced whenever configuration changes occur in the setup wizard.

## Purpose

- **Cursor Agent Access**: Allows Cursor agent to understand what features are enabled and what APIs are connected
- **Configuration State**: Tracks setup section status and enabled features
- **API References**: Contains references to configured APIs (without sensitive keys)
- **Theme Configuration**: Tracks whether a custom theme is configured

## Security

⚠️ **Important**: This file does **NOT** contain API keys or sensitive credentials. Those remain in `.env` file (which is gitignored).

The file contains:
- ✅ Setup section statuses
- ✅ Enabled features list
- ✅ API URLs and IDs (non-sensitive)
- ✅ Theme configuration status
- ❌ **NO API keys** (keys stay in `.env`)

## File Location

- **Path**: `app.config.json` (project root)
- **Git**: Committed to version control (no secrets, useful for team context)
- **Format**: JSON

## File Structure

```json
{
  "version": "1.0.0",
  "setup": {
    "completed": false,
    "sections": {
      "supabase": "completed",
      "airtable": "completed",
      "hosting": "skipped",
      "theme": "completed"
    },
    "enabledFeatures": ["supabase", "airtable", "theme"]
  },
  "configurations": {
    "supabase": {
      "configured": true,
      "url": "https://xxx.supabase.co",
      "keyLocation": ".env"
    },
    "airtable": {
      "configured": true,
      "baseId": "appXXX",
      "tableId": "tblXXX",
      "keyLocation": ".env"
    },
    "theme": {
      "custom": true,
      "hasCustomTheme": true
    }
  },
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## When It Updates

The file syncs when:

1. **Setup Completed**: When finishing setup wizard (syncs before cleanup runs)
2. **Manual Sync**: Call `syncConfiguration()` from any component/hook when needed

Note: Config does NOT sync automatically on every status change to avoid circular dependencies. The sync happens at the end of setup when the configuration is finalized, which is the most useful time for Cursor agent to read it.

## How It Works

### Architecture

1. **Service Layer** (`src/features/setup/services/configService.ts`):
   - `syncConfiguration()`: Builds config from current app state and writes to file
   - Reads from localStorage and environment variables
   - Calls `/api/write-config` endpoint

2. **API Endpoint** (`vite-plugin-dev-api.ts`):
   - `/api/write-config`: Dev-only endpoint that writes `app.config.json`
   - Only works in development mode (Vite dev server)

3. **Automatic Sync**:
   - `updateSetupSectionStatus()`: Syncs after status change
   - `writeEnvVariables()`: Syncs after env vars written
   - `saveCustomTheme()`: Syncs after theme saved
   - `removeCustomTheme()`: Syncs after theme removed
   - `finishSetup()`: Syncs before finishing setup

### Reading Configuration

**From App Code**:
```typescript
import { syncConfiguration } from "@features/setup/services/configService";

// Sync config (reads from localStorage/env and writes to file)
await syncConfiguration();
```

**From Cursor Agent**:
```bash
# Read the file directly
cat app.config.json

# Or parse in code
const config = JSON.parse(fs.readFileSync('app.config.json', 'utf-8'));
```

## Configuration Fields

### `version`
- **Type**: `string`
- **Description**: Configuration file format version
- **Example**: `"1.0.0"`

### `setup.completed`
- **Type**: `boolean`
- **Description**: Whether setup wizard has been completed
- **Example**: `false`

### `setup.sections`
- **Type**: `Record<SetupSectionId, SetupStatus>`
- **Description**: Status of each setup section
- **Values**: `"not-started" | "in-progress" | "completed" | "skipped"`
- **Example**: `{ "supabase": "completed", "airtable": "completed" }`

### `setup.enabledFeatures`
- **Type**: `SetupSectionId[]`
- **Description**: List of features that are completed (enabled)
- **Example**: `["supabase", "airtable", "theme"]`

### `configurations.supabase`
- **Type**: `SupabaseConfiguration`
- **Fields**:
  - `configured`: `boolean` - Whether Supabase is configured
  - `url`: `string | undefined` - Supabase project URL (if configured)
  - `keyLocation`: `".env"` - Where the API key is stored

### `configurations.airtable`
- **Type**: `AirtableConfiguration`
- **Fields**:
  - `configured`: `boolean` - Whether Airtable is configured
  - `baseId`: `string | undefined` - Airtable Base ID (if configured)
  - `tableId`: `string | undefined` - Airtable Table ID (if configured)
  - `keyLocation`: `".env"` - Where the API key is stored

### `configurations.theme`
- **Type**: `ThemeConfiguration`
- **Fields**:
  - `custom`: `boolean` - Whether a custom theme is configured
  - `hasCustomTheme`: `boolean` - Same as `custom` (for clarity)

### `lastUpdated`
- **Type**: `string` (ISO 8601 timestamp)
- **Description**: When the configuration was last synced
- **Example**: `"2024-01-15T10:30:00Z"`

## Usage Examples

### Check if Supabase is Configured

```typescript
const config = JSON.parse(fs.readFileSync('app.config.json', 'utf-8'));
if (config.configurations.supabase.configured) {
  console.log('Supabase URL:', config.configurations.supabase.url);
  console.log('API key location:', config.configurations.supabase.keyLocation);
}
```

### Get Enabled Features

```typescript
const config = JSON.parse(fs.readFileSync('app.config.json', 'utf-8'));
const enabledFeatures = config.setup.enabledFeatures;
console.log('Enabled features:', enabledFeatures);
// Output: ["supabase", "airtable", "theme"]
```

### Check Setup Status

```typescript
const config = JSON.parse(fs.readFileSync('app.config.json', 'utf-8'));
const supabaseStatus = config.setup.sections.supabase;
if (supabaseStatus === 'completed') {
  // Supabase setup is complete
}
```

## Related Files

- `src/features/setup/services/configService.ts`: Service for syncing configuration
- `src/features/setup/types/config.types.ts`: TypeScript types for configuration
- `vite-plugin-dev-api.ts`: API endpoint for writing config file
- `src/utils/setupUtils.ts`: Setup state management (syncs config on changes)
- `src/features/setup/services/envWriterService.ts`: Env writing (syncs config after write)
- `src/shared/theme/themeLoader.ts`: Theme management (syncs config on save/remove)

## Troubleshooting

### File Not Created

- Ensure Vite dev server is running (`pnpm dev`)
- Check browser console for errors
- Verify `/api/write-config` endpoint is accessible

### File Not Updating

- Configuration sync happens automatically but may fail silently
- Check browser console for errors
- Manually trigger sync: `await syncConfiguration()` in browser console

### Missing Data

- File only contains data available at sync time
- If env vars are added manually to `.env`, sync won't detect them until app reads them
- Restart dev server after manual `.env` changes

## Future Enhancements

Potential improvements:

1. **Manual Sync Button**: Add UI button to manually trigger sync
2. **Config Validation**: Validate config structure before writing
3. **Config History**: Track changes over time
4. **Config Diff**: Show what changed between syncs
5. **Read Config Service**: Service to read config file (for Cursor agent)
