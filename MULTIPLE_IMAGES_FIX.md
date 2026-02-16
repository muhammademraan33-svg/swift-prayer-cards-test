# Fix: Multiple Images Upload Issue

## Problem
The client reported: "The flow gets stuck when adding multiple images"

## Root Cause
When users clicked "Add Another Print" and tried to upload a new image, the browser's file input element retained its previous value. This caused the `onChange` event not to fire when selecting the same file or sometimes any file, making it appear that the upload was "stuck."

## Solution
Added `e.target.value = ''` after each file upload to reset the input element. This ensures:
1. Users can select the same file multiple times
2. The onChange event always fires
3. The upload flow never gets stuck

## Files Fixed

### 1. `src/components/wizard/StepArt.tsx`
- Fixed main image upload (Step 1)
- Reset input after file selection

### 2. `src/components/wizard/StepUpsell.tsx`
- Fixed back image upload for main print
- Fixed back image upload for additional prints
- Reset input after each upload

### 3. `src/components/wizard/BackImagePicker.tsx`
- Fixed back image picker component
- Reset input after file selection

### 4. `src/components/wizard/PrintWizard.tsx`
- Added smooth scroll to top when clicking "Add Another Print"
- Ensures user sees the upload area immediately

## Testing
1. Complete a print order
2. Click "Add Another Print"
3. Upload a new image (even the same one)
4. Verify upload works smoothly
5. Repeat multiple times

## Status
✅ Fixed and tested
✅ Build successful
✅ Pushed to repository
