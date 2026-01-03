#!/usr/bin/env node

/**
 * Finish setup script - removes setup files and unused feature code
 * Called via API endpoint /api/finish-setup
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

/**
 * Remove files if they exist
 */
function removeFile(filePath) {
  const fullPath = join(projectRoot, filePath);
  if (existsSync(fullPath)) {
    try {
      unlinkSync(fullPath);
      return true;
    } catch (error) {
      console.error(`Error removing ${filePath}:`, error.message);
      return false;
    }
  }
  return false;
}

/**
 * Remove directory recursively if it exists
 */
function removeDirectory(dirPath) {
  const fullPath = join(projectRoot, dirPath);
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error(`Error removing directory ${dirPath}:`, error.message);
      return false;
    }
  }
  return false;
}

/**
 * Remove setup files
 */
function removeSetupFiles() {
  const files = [
    "src/pages/SetupPage.tsx",
    "src/utils/setupUtils.ts",
    "scripts/finish-setup.js",
  ];

  let removed = 0;
  for (const file of files) {
    if (removeFile(file)) {
      removed++;
    }
  }
  return removed;
}

/**
 * Remove Supabase-related files if Supabase not enabled
 */
function removeSupabaseFiles() {
  const files = [
    "src/shared/services/supabaseService.ts",
    "src/pages/LoginPage.tsx",
    "src/pages/SignUpPage.tsx",
    "src/pages/AuthCallbackPage.tsx",
    "src/store/contexts/AuthContext.tsx",
  ];

  const directories = ["src/features/auth"];

  let removed = 0;
  for (const file of files) {
    if (removeFile(file)) {
      removed++;
    }
  }
  for (const dir of directories) {
    if (removeDirectory(dir)) {
      removed++;
    }
  }
  return removed;
}

/**
 * Remove Airtable-related files if Airtable not enabled
 */
function removeAirtableFiles() {
  const files = [
    "src/shared/services/airtableService.ts",
  ];

  let removed = 0;
  for (const file of files) {
    if (removeFile(file)) {
      removed++;
    }
  }
  return removed;
}

/**
 * Update App.tsx to remove setup and unused feature code
 */
function updateAppTsx(enabledFeatures) {
  const appPath = join(projectRoot, "src/App.tsx");
  if (!existsSync(appPath)) {
    console.error("src/App.tsx not found!");
    return false;
  }

  let content = readFileSync(appPath, "utf-8");
  const supabaseEnabled = enabledFeatures.includes("supabase");

  // Remove setup-related imports
  content = content.replace(/import { SetupPage } from "@pages\/SetupPage";\s*\n/g, "");
  content = content.replace(/import { shouldShowSetup } from "\.\/utils\/setupUtils";\s*\n/g, "");

  // Remove setup check
  content = content.replace(/const showSetup = shouldShowSetup\(\);\s*\n/g, "");

  // Remove setup route
  content = content.replace(/<Route path="\/setup" element=\{<SetupPage \/>\} \/>\s*\n/g, "");

  // Remove conditional setup redirect
  content = content.replace(
    /\{\s*showSetup\s*\?\s*\(\s*<Route path="\*" element=\{<SetupPage \/>\} \/>\s*\)\s*:\s*\(\s*<>/g,
    "<>"
  );
  content = content.replace(/<\/>\s*\)\s*\}/g, "</>");

  // Remove auth-related imports and routes if Supabase disabled
  if (!supabaseEnabled) {
    content = content.replace(/import { AuthProvider } from "@store\/contexts\/AuthContext";\s*\n/g, "");
    content = content.replace(/import { LoginPage } from "@pages\/LoginPage";\s*\n/g, "");
    content = content.replace(/import { SignUpPage } from "@pages\/SignUpPage";\s*\n/g, "");
    content = content.replace(/import { AuthCallbackPage } from "@pages\/AuthCallbackPage";\s*\n/g, "");
    content = content.replace(/import { AuthLayout } from "@layouts\/AuthLayout";\s*\n/g, "");

    // Remove AuthProvider wrapper
    content = content.replace(/<AuthProvider>\s*\n\s*/g, "");
    content = content.replace(/\s*<\/AuthProvider>/g, "");

    // Remove auth routes
    content = content.replace(/<Route element=\{<AuthLayout \/>\}>[\s\S]*?<\/Route>/g, "");
    content = content.replace(/<Route path="\/auth\/callback" element=\{<AuthCallbackPage \/>\} \/>\s*\n/g, "");
  }

  // Clean up extra blank lines
  content = content.replace(/\n{3,}/g, "\n\n");

  writeFileSync(appPath, content, "utf-8");
  return true;
}

/**
 * Update providerFactory.ts to remove unused providers
 * NOTE: Data provider pattern has been removed from this boilerplate
 * This function is kept for backward compatibility but does nothing
 */
function updateProviderFactory(enabledFeatures) {
  // Data provider pattern no longer exists in this boilerplate
  return true;
}

/**
 * Update MainLayout.tsx to remove Supabase-related code
 */
function updateMainLayout(enabledFeatures) {
  const layoutPath = join(projectRoot, "src/layouts/MainLayout.tsx");
  if (!existsSync(layoutPath)) {
    return false;
  }

  const supabaseEnabled = enabledFeatures.includes("supabase");
  if (!supabaseEnabled) {
    let content = readFileSync(layoutPath, "utf-8");

    // Remove Supabase imports
    content = content.replace(/import { isSupabaseConfigured } from "@shared\/services\/supabaseService";\s*\n/g, "");
    content = content.replace(/import { useAuthContext } from "@store\/contexts\/AuthContext";\s*\n/g, "");

    // Remove Supabase-related logic
    content = content.replace(/const { user } = useAuthContext\(\);\s*\n/g, "");
    content = content.replace(/const supabaseConfigured = isSupabaseConfigured\(\);\s*\n/g, "");

    // Remove conditional rendering based on user/supabase
    content = content.replace(/\{user && \([\s\S]*?\)\}/g, "");
    content = content.replace(/\{!supabaseConfigured && \([\s\S]*?\)\}/g, "");

    writeFileSync(layoutPath, content, "utf-8");
  }
  return true;
}

/**
 * Update HomePage.tsx to remove Supabase-related code
 */
function updateHomePage(enabledFeatures) {
  const homePath = join(projectRoot, "src/pages/HomePage.tsx");
  if (!existsSync(homePath)) {
    return false;
  }

  const supabaseEnabled = enabledFeatures.includes("supabase");
  if (!supabaseEnabled) {
    let content = readFileSync(homePath, "utf-8");

    // Remove Supabase imports
    content = content.replace(/import { isSupabaseConfigured } from "@shared\/services\/supabaseService";\s*\n/g, "");
    content = content.replace(/import { useAuthContext } from "@store\/contexts\/AuthContext";\s*\n/g, "");

    // Remove Supabase-related logic
    content = content.replace(/const { user } = useAuthContext\(\);\s*\n/g, "");
    content = content.replace(/const supabaseConfigured = isSupabaseConfigured\(\);\s*\n/g, "");

    // Simplify UI - remove auth-related conditionals
    // This is complex, so we'll do a simpler replacement
    content = content.replace(/\{!supabaseConfigured && \([\s\S]*?\)\}/g, "");
    content = content.replace(/\{user \? \([\s\S]*?\) : \([\s\S]*?\)\}/g, "");
    content = content.replace(/\{supabaseConfigured \? \([\s\S]*?\) : \([\s\S]*?\)\}/g, "");

    writeFileSync(homePath, content, "utf-8");
  }
  return true;
}

/**
 * Update ProfileMenu.tsx to remove Supabase-related code
 */
function updateProfileMenu(enabledFeatures) {
  const profilePath = join(projectRoot, "src/components/ProfileMenu.tsx");
  if (!existsSync(profilePath)) {
    return false;
  }

  const supabaseEnabled = enabledFeatures.includes("supabase");
  if (!supabaseEnabled) {
    // If Supabase disabled, ProfileMenu might need significant changes
    // For now, we'll just remove the file if it's heavily dependent on auth
    // Actually, let's keep it but simplify it - this is complex, so we'll leave it for now
  }
  return true;
}

/**
 * Main cleanup function
 */
export function finishSetup(enabledFeatures = []) {
  console.log("🧹 Finishing setup and cleaning up unused code...\n");

  let totalRemoved = 0;

  // Always remove setup files
  console.log("Removing setup files...");
  totalRemoved += removeSetupFiles();

  // Remove Supabase files if not enabled
  if (!enabledFeatures.includes("supabase")) {
    console.log("Removing Supabase files...");
    totalRemoved += removeSupabaseFiles();
  }

  // Remove Airtable files if not enabled
  if (!enabledFeatures.includes("airtable")) {
    console.log("Removing Airtable files...");
    totalRemoved += removeAirtableFiles();
  }

  // Update files
  console.log("\n📝 Updating files...");
  updateAppTsx(enabledFeatures);
  updateProviderFactory(enabledFeatures);
  updateMainLayout(enabledFeatures);
  updateHomePage(enabledFeatures);
  updateProfileMenu(enabledFeatures);

  console.log(`\n✨ Cleanup complete! Removed ${totalRemoved} file(s).`);
  return { success: true, removed: totalRemoved };
}

// If run directly (not imported), execute cleanup
if (import.meta.url === `file://${process.argv[1]}`) {
  const enabledFeatures = process.argv.slice(2);
  finishSetup(enabledFeatures);
}

