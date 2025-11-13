## Diagnosis
- Dev server fails due to unresolved Git conflict markers in `src/App.tsx` (`<<<<<<< HEAD` / `>>>>>>> parent of 1168cc9`).
- Verified no other files contain conflict markers.

## Fix Merge Conflict
- Open `src/App.tsx` and remove all conflict markers:
  - Delete lines with `<<<<<<<`, `=======`, `>>>>>>>`.
- Keep the valid import block and routes currently present (no `AuthDebugPanel`, no `@vercel/analytics/react`).
- Ensure final `App.tsx` exports the React tree with:
  - Providers: `HelmetProvider`, `QueryClientProvider`, `AuthProvider`, `CartProvider`, `TooltipProvider`.
  - Router: `BrowserRouter` with routes for `HomePage`, `PropertiesPage`, `PropertyDetailPage`, `AboutPage`, `ContactPage`, `BlogPage`, `BlogDetailPage`, `SubmitBlogPage` (wrapped in `ProtectedRoute requireAdmin={true}`), `SubmitListingPage`, `DashboardPage` (wrapped in `ProtectedRoute`), `NotFound`.

## Verify Locally
- Restart dev: `npm run dev` and confirm the app loads without the `Unexpected "<<"` error.
- Optionally run production build: `npm run build` to double-check.

## Deployment Notes
- If deploying to Vercel/Lovable, push the fix to `main`.
- Ensure Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in your environment; placeholders prevent crashes but features need real values.

## Contingency
- If any routes were removed during earlier merges (e.g., `image-upload-demo`), confirm desired route set and re-add if needed after the conflict is cleaned.
