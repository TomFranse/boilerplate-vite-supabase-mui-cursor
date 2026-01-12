# Rich Text Document Save Issue - Debug Plan

## Quick Summary
When a user saves a rich text document, edits it (removes a word), saves again, and refreshes, the edit appears to be lost - the document reverts to the initial saved state.

---

## Component Nesting Analysis

### Component Hierarchy
```
MessageList (parent)
  └─ MarkdownFollowUpRenderer
      └─ MarkdownEditor
          ├─ RichTextEditor (mui-tiptap)
          ├─ useMarkdownSaveHandler hook
          ├─ useMarkdownLoad hook
          └─ useMarkdownStreaming hook
```

### Props Flow
- `fileId` prop: Passed from parent → `initialFileId` → `fileId` state
- `messageId` prop: Used for linking file to message
- `onFileSaved` callback: Updates parent state with `markdownFileId` in metadata
- `onSavedContentChange`: Updates `savedContent` state in MarkdownEditor

### Potential Nesting Issues
1. **State synchronization**: `fileId` state syncs with `initialFileId` prop (lines 172-176 in MarkdownEditor.tsx)
2. **Load trigger**: `useMarkdownLoad` hook triggers when `!isInitialized && fileId` exists
3. **Initialization flag**: `isInitialized` prevents multiple loads but might interfere with save/load timing

---

## Event Chain Reconstruction

1. **User Action**: User clicks Save button
   - `handleSave` called in `useMarkdownSaveHandler`
   - Editor content extracted via `getMarkdownFromEditor()`

2. **Save Operation**:
   - Content encoded to bytes
   - `saveFile()` called → uploads to Supabase storage (with `upsert: true` for updates)
   - Message metadata updated with `markdownFileId`
   - `onSavedContentChange(markdownContent)` called → updates `savedContent` state
   - `onDirtyChange(false)` called → clears dirty flag

3. **User Action**: User edits document (removes word)
   - Editor content changes
   - Dirty tracking detects change → `isDirty` becomes `true`

4. **User Action**: User clicks Save again
   - Same save flow as step 1-2
   - Should save edited content (without the word)

5. **User Action**: User refreshes page
   - Component unmounts and remounts
   - `isInitialized` resets to `false`
   - `fileId` prop passed from parent (from message metadata)
   - `useMarkdownLoad` hook triggers (because `!isInitialized && fileId`)
   - Content loaded from storage
   - `setContent()` called → **THIS MIGHT OVERWRITE THE EDIT**

**Most Suspicious Link**: Step 5 - The load operation after refresh might be loading stale content or overwriting the editor after a save completes.

---

## Hypotheses

### Hypothesis 1: Race Condition - Load Overwrites Save
**Prediction**: After the second save completes, `useMarkdownLoad` hook triggers and loads old content from storage, overwriting the saved content.

**Falsification Condition**: Console logs show that `useMarkdownLoad` runs AFTER `onSavedContentChange` is called, and the loaded content matches the OLD content (with the word still present).

**Observable Evidence**:
- Console log `[useMarkdownSaveHandler] Save completed successfully` appears
- Console log `[useMarkdownLoad] Effect triggered` appears AFTER save completion
- Loaded content preview shows the word that was removed

**Maps to Event Chain**: Step 5 - Load operation timing

---

### Hypothesis 2: Storage Not Updated - Save Didn't Persist
**Prediction**: The second save operation completes but doesn't actually update storage (e.g., `upsert` flag issue, storage API error, or cache issue).

**Falsification Condition**: Console logs show save completes successfully, but when loading from storage, the content is the old version (word still present). Storage inspection confirms old content.

**Observable Evidence**:
- Console log `[useMarkdownSaveHandler] saveFile completed` shows success
- Console log `[useMarkdownLoad] Content loaded from storage` shows OLD content
- Storage bucket inspection (via Supabase dashboard) shows old content

**Maps to Event Chain**: Step 2 - Storage update operation

---

### Hypothesis 3: Wrong Content Extracted - Editor State Issue
**Prediction**: When saving the second time, `getMarkdownFromEditor()` extracts the OLD content (before edit) instead of the current editor content.

**Falsification Condition**: Console log `[useMarkdownSaveHandler] Content extracted from editor` shows content WITH the word (old content), even though user removed it.

**Observable Evidence**:
- Console log `[useMarkdownSaveHandler] Content extracted from editor` shows old content preview
- User confirms they removed the word before clicking save

**Maps to Event Chain**: Step 1 - Content extraction

---

### Hypothesis 4: FileId Prop Change Triggers Reload
**Prediction**: After save, the `initialFileId` prop changes (from parent state update), triggering the `useEffect` that syncs `fileId` state, which then triggers `useMarkdownLoad` to reload content.

**Falsification Condition**: Console logs show `[MarkdownEditor] initialFileId prop changed` AFTER save completion, followed by `[useMarkdownLoad] Effect triggered`, loading old content.

**Observable Evidence**:
- Console log `[MarkdownEditor] initialFileId prop changed` appears after save
- Console log `[useMarkdownLoad] Effect triggered` appears after prop change
- Loaded content is old version

**Maps to Event Chain**: Step 5 - Prop change triggers reload

---

## Console Log Changes

All console logs have been added to track:
1. **Save initiation**: When save starts, what content is extracted
2. **Save completion**: When save finishes, what content was saved
3. **State updates**: When `savedContent` state changes
4. **Load triggers**: When load effect runs and why
5. **Load completion**: What content is loaded from storage
6. **Prop changes**: When `initialFileId` prop changes

**Security Note**: Content previews are limited to first 100 characters to avoid exposing full documents.

---

## Unified Diagnostic Steps

### Step 1: Reproduce the Issue with Logging
1. Open the app and navigate to a rich text document
2. Open browser DevTools Console (F12 → Console tab)
3. Clear console logs
4. Filter console to show only logs containing `[useMarkdownSaveHandler]`, `[MarkdownEditor]`, `[useMarkdownLoad]`
5. Save the document (first save)
6. Edit the document: Remove a specific word (note which word)
7. Save again (second save)
8. **Before refreshing**: Copy all console logs and paste them here
9. Refresh the page
10. **After refresh**: Copy all console logs and paste them here

**What to observe**: 
- Does the second save show the edited content (without the word) in the extraction log?
- Does the save complete successfully?
- Does a load operation trigger after the save?
- What content is loaded from storage?

**Supports/Refutes**: All hypotheses - establishes baseline behavior

---

### Step 2: Verify Storage Content
1. After reproducing the issue, open Supabase Dashboard
2. Navigate to Storage → files bucket
3. Find the file at path: `{userId}/markdown/{fileId}.md`
4. Download and inspect the file content
5. Report: Does the file contain the word that was removed, or is it missing?

**What to observe**:
- File content matches which version? (with word = old, without word = new)

**Supports/Refutes**: 
- Hypothesis 2 (if file has old content, save didn't persist)
- Hypothesis 1 (if file has new content but editor shows old, load overwrote)

---

### Step 3: Check Message Metadata
1. In Supabase Dashboard, navigate to Table Editor → messages
2. Find the message with the `messageId` used by the document
3. Check the `metadata` column → `markdownFileId` field
4. Verify the `markdownFileId` matches the `fileId` used in storage path
5. Report: Does the `markdownFileId` match the expected file ID?

**What to observe**:
- Is `markdownFileId` present and correct?
- Does it match the file ID in storage?

**Supports/Refutes**: 
- Hypothesis 4 (if metadata is wrong, prop might be wrong)
- General data consistency check

---

### Step 4: Check Load Timing
1. Reproduce issue again with console logs
2. Look for the sequence:
   - `[useMarkdownSaveHandler] Save completed successfully`
   - `[MarkdownEditor] onSavedContentChange callback`
   - `[useMarkdownLoad] Effect triggered`
3. Note the timestamps: Does load trigger BEFORE or AFTER save completes?

**What to observe**:
- Timing sequence of save completion vs load trigger
- Is there a race condition?

**Supports/Refutes**: 
- Hypothesis 1 (if load triggers after save, might overwrite)
- Hypothesis 4 (if prop change triggers load)

---

### Step 5: Check Editor Content Before Save
1. Before clicking save the second time, manually check editor content:
   - Right-click in editor → Inspect Element
   - Find the ProseMirror content element
   - Check if the word is actually removed in the DOM
2. Then click save and check the extraction log

**What to observe**:
- Does the DOM show the word removed?
- Does the extraction log show the word removed?

**Supports/Refutes**: 
- Hypothesis 3 (if DOM has edit but extraction doesn't, extraction is wrong)

---

## What to Return

After completing the diagnostic steps, please provide:

1. **Console logs** (filtered to relevant logs):
   - From Step 1: Before and after refresh
   - From Step 4: Timing sequence

2. **Storage inspection results** (Step 2):
   - Does the file in storage have the word removed or present?

3. **Message metadata** (Step 3):
   - What is the `markdownFileId` value?

4. **Editor DOM check** (Step 5):
   - Was the word removed in the DOM before save?

5. **Timing observations** (Step 4):
   - What is the sequence of save completion vs load trigger?

---

## Evidence Analysis (From User's Logs)

### Root Cause Identified: **Hypothesis 2 - Storage Not Updated**

**Evidence from logs:**
1. **Save operation** (before refresh):
   - Content extracted: 1818 chars, preview: `**-**` (word "markdown" removed)
   - Save completed successfully at `19:09:57.718Z`
   - Saved content length: 1818 characters

2. **Load operation** (after refresh):
   - Content loaded: 1826 chars, preview: `**markdown-**` (word "markdown" present)
   - Content length: 1826 characters (8 chars more than saved)

**Conclusion**: The storage file was NOT updated with the new content. The old content (with "markdown") remained in storage despite the save operation reporting success.

**Root Cause**: Supabase Storage's `upload()` method with `upsert: true` may not work reliably with RLS policies or may have caching issues. The upload reports success but doesn't actually update the file.

### Fix Applied

Changed the update strategy from:
- `upload()` with `upsert: true` (unreliable)

To:
- `remove()` old file first
- `upload()` new file (always create, never upsert)

This ensures a clean update without relying on `upsert` behavior.

### Testing Required

Please test the fix:
1. Save a document
2. Edit it (remove a word)
3. Save again
4. Refresh the page
5. Verify the edit persists

Check console logs to confirm:
- Delete operation succeeds
- Upload operation succeeds
- Loaded content matches saved content
