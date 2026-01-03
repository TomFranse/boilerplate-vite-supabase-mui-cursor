# Vite MUI Supabase Starter

A modern, production-ready boilerplate for building React applications with TypeScript, Vite, Material-UI, and Supabase. This starter enforces strict architectural rules and includes authentication and todos features as examples.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React with TypeScript
- 🎨 **Material-UI (MUI)** - Comprehensive UI component library
- 🗄️ **Supabase** - Backend-as-a-Service for authentication and database (optional)
- 🧭 **React Router** - Client-side routing
- 📏 **ESLint + GTS + Prettier** - Code quality and style enforcement (see [ARCHITECTURE.md](./ARCHITECTURE.md#code-quality-tools))
- 🧪 **Vitest** - Fast unit testing framework
- 🏗️ **Strict Architecture** - Enforced folder structure and import rules
- 🔒 **Authentication** - Complete auth flow (login, signup, logout) - requires Supabase
- ✅ **Todos Feature** - Example CRUD implementation with browser storage fallback
- 💾 **Browser Storage** - Todos work without Supabase using local storage

## Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 8.x or higher (recommended) or npm/yarn
- **Supabase Account** (optional) - [Sign up here](https://supabase.com) if you want to use authentication and database features

### Windows Users: Configure Line Endings

**IMPORTANT:** Configure Cursor to use Linux line endings!

This ensures that every new file you create uses Linux endings, and existing files don't get converted back to Windows endings when you save them.

1. Open Cursor
2. Press `Ctrl + ,` to open Settings
3. Search for `files.eol`
4. Change the setting from `auto` (or `\r\n`) to `\n`

## Quick Start Guide

### Step 1: Clone and Install

Open Cursor in the folder where you want to create your project, then run:

```bash
git clone https://github.com/TomFranse/boilerplate-vite-supabase-mui-cursor .
pnpm install
```

**Note:** You may see TypeScript compilation errors during installation. These are normal and won't prevent the app from running. Vite transpiles TypeScript on the fly for the dev server.

### Step 2: Start the Development Server

```bash
pnpm dev
```

The app will open at `http://localhost:5173/` (or another port if 5173 is in use) and automatically redirect you to the setup wizard.

### Step 3: Complete the Setup Wizard

When you first run the app, a setup wizard will guide you through configuration. You have two options:

#### Option A: Skip Supabase (Start Simple) ⚡

- Click **"Skip Database Setup"** in the wizard
- Todos will work using browser local storage
- Perfect for frontend development and testing
- You can configure Supabase later anytime

**What works without Supabase:**
- ✅ Todos feature (saved in browser)
- ✅ All UI components and frontend features
- ✅ Theme customization

#### Option B: Configure Supabase (Full Features) 🚀

1. **Get Supabase Credentials:**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to **Project Settings → API**
   - Copy your **Project URL** and **Publishable Key** (previously called "anon key")

2. **In the Setup Wizard:**
   - Enter your Supabase URL and publishable key
   - Click **"Test Connection"**
   - Copy the environment variables shown
   - Create a `.env` file in the project root:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
     ```
   - **Note:** The legacy `VITE_SUPABASE_ANON_KEY` also works for backward compatibility
   - **Important:** Restart your dev server (`Ctrl+C` then `pnpm dev` again)

3. **Set Up Database:**
   - Go to Supabase Dashboard → **SQL Editor**
   - Run the SQL provided in the wizard (creates the `todos` table)
   - This enables cloud sync and authentication

4. **Optional: Customize Theme:**
   - Use the [MUI Theme Creator](https://bareynol.github.io/mui-theme-creator/) to generate a theme JSON
   - Paste it in the theme step (or skip to use default)

### Step 4: Access Your App

- **Home:** `http://localhost:5173/`
- **Setup:** `http://localhost:5173/setup` (accessible anytime)
- **Login:** `http://localhost:5173/login` (if Supabase is configured)
- **Todos:** `http://localhost:5173/todos`

### That's It! 🎉

Your app is ready to use. You can start building features or customize it to your needs.

**Need to configure Supabase later?** Just navigate to `/setup` in your app and follow the steps.

## Installation

For detailed installation instructions, see the [Quick Start Guide](#quick-start-guide) above.

### Optional: Manual Supabase Setup

If you prefer to set up Supabase manually instead of using the setup wizard (recommended: use the [setup wizard](#step-3-complete-the-setup-wizard) instead):

1. Create a `.env` file in the project root directory

2. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```
**Note:** The legacy `VITE_SUPABASE_ANON_KEY` also works for backward compatibility.

3. Create a `todos` table in your Supabase project:
   ```sql
   CREATE TABLE todos (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     status TEXT NOT NULL DEFAULT 'pending',
     user_id UUID NOT NULL REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to manage their own todos
   CREATE POLICY "Users can manage their own todos"
     ON todos
     FOR ALL
     USING (auth.uid() = user_id);
   ```

4. Restart the development server for environment variables to take effect

### Features Without Supabase

- ✅ **Todos**: Works with browser local storage (data saved in your browser)
- ✅ **Frontend Development**: All UI components and features work independently
- ❌ **Authentication**: Requires Supabase to be configured
- ❌ **Cloud Sync**: Todos won't sync across devices without Supabase

### Configuring Supabase Later

If you skipped Supabase setup initially, you can configure it anytime:

1. Navigate to `/setup` in your running app
2. Follow the setup wizard steps to configure Supabase credentials
3. Create the `.env` file with your credentials (see [Manual Supabase Setup](#optional-manual-supabase-setup))
4. **Restart your development server** (`Ctrl+C` then `pnpm dev`)

**Note**: Browser-stored todos and Supabase todos are stored separately. When you configure Supabase, you'll start with an empty todos list in the database.

### Troubleshooting

**Setup wizard not appearing?**
- Make sure you're accessing `http://localhost:5173/` (or the port shown in your terminal)
- Clear your browser's local storage and reload
- Check that the dev server is running

**Supabase connection failing?**
- Verify your credentials are correct (check for typos)
- Ensure your `.env` file is in the project root (not in `src/`)
- Make sure you've restarted the dev server after creating `.env`
- Check that your Supabase project is active and not paused

**Environment variables not working?**
- Vite requires environment variables to start with `VITE_`
- Restart the dev server after changing `.env` file
- Don't commit `.env` to git (it should be in `.gitignore`)

**TypeScript errors during installation or when running `pnpm dev`?**
- TypeScript compilation errors are normal and won't prevent the app from running
- Vite handles TypeScript transpilation on the fly for the dev server
- These errors are typically related to type definitions in node_modules and can be ignored during development

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint (code quality checks)
- `pnpm lint:fix` - Auto-fix ESLint errors
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check if code is formatted correctly
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

### Code Quality Tools

This project uses **GTS**, **ESLint**, and **Prettier** together for code quality and formatting:

- **GTS** (Google TypeScript Style) - Provides pre-configured ESLint rules
- **ESLint** - Catches bugs and enforces code quality (with custom architecture rules)
- **Prettier** - Formats code automatically for consistency

**Quick Start:**
- Format code: `pnpm format`
- Check for issues: `pnpm lint`
- Auto-fix issues: `pnpm lint:fix`

**Editor Setup:**
- Configure your editor to format on save using Prettier
- ESLint will provide real-time feedback in your IDE
- See [ARCHITECTURE.md](./ARCHITECTURE.md#code-quality-tools) for detailed documentation

## Architecture

This project follows a strict feature-based architecture. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about:

- Folder structure
- Code placement rules
- Dependency hierarchy
- Import patterns
- Code quality tools (GTS, ESLint, Prettier)

## Development Workflow

1. **Create a feature**: Add files in `src/features/[feature-name]/`
2. **Use common components**: Import from `@common/*`
3. **Access shared services**: Import from `@shared/*`
4. **Follow the layer rules**: Components → Hooks → Services
5. **Write tests**: Add tests alongside your code

## Project Structure

```
src/
├── assets/          # Static assets and global styles
├── common/          # Reusable UI components (no business logic)
├── features/        # Feature modules (auth, todos, etc.)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── todos/
├── layouts/         # Layout components
├── pages/           # Route-level page components
├── store/           # Global state (contexts, etc.)
├── shared/          # Shared utilities and services
├── utils/           # Utility functions
└── components/      # App-level components
```

## Testing

Tests are written using Vitest and React Testing Library. Example tests are included for:
- Service functions (unit tests)
- React components (component tests)

Run tests:
```bash
pnpm test
```

## CI/CD

GitHub Actions workflow runs on every push/PR:
- Type checking
- Linting
- Format checking
- Tests
- Build verification

## Contributing

1. Follow the architecture rules
2. Write tests for new features
3. Ensure all checks pass (`pnpm lint`, `pnpm format:check`, `pnpm test`)
4. Update CHANGELOG.md for significant changes

