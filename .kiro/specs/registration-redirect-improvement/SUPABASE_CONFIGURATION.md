# Supabase Configuration for Registration Redirect

## Problem

After registration, users are being redirected to the home page (`/`) instead of directly to `/learn`.

## Root Cause

The issue is likely in the Supabase Dashboard configuration. Supabase has a "Site URL" setting that determines where users are redirected after OAuth authentication.

## Solution

### 1. Update Supabase Dashboard Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following settings:

#### Site URL
Set to your production URL or `http://localhost:3000` for local development:
```
http://localhost:3000
```
or
```
https://your-domain.com
```

#### Redirect URLs
Add the following URLs to the allowed redirect URLs list:
```
http://localhost:3000/auth/callback
http://localhost:3000/learn
https://your-domain.com/auth/callback
https://your-domain.com/learn
```

### 2. Verify OAuth Provider Settings

#### Google OAuth
1. Go to **Authentication** → **Providers** → **Google**
2. Ensure "Enabled" is checked
3. Verify your Google OAuth credentials are correct
4. Make sure the authorized redirect URIs in Google Cloud Console include:
   ```
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```

### 3. Test the Flow

1. Clear your browser cookies and localStorage
2. Try registering with Google OAuth
3. Check the browser console for logs from `/auth/callback` route
4. Verify you're redirected to `/learn?registered=true`
5. Confirm the success toast appears

## Debugging

### Check Console Logs

The `/auth/callback` route now includes detailed logging:

```
[Auth Callback] Request URL: ...
[Auth Callback] Code present: ...
[Auth Callback] Exchange result: ...
[Auth Callback] User info: ...
[Auth Callback] Redirecting to: ...
```

### Common Issues

1. **Redirected to home page**
   - Check Site URL in Supabase Dashboard
   - Ensure it matches your application URL

2. **No success toast appears**
   - Check if `?registered=true` parameter is in URL
   - Verify `RegistrationSuccessNotification` component is mounted
   - Check browser console for errors

3. **"Invalid redirect URL" error**
   - Add your callback URL to allowed redirect URLs in Supabase Dashboard
   - Ensure URL matches exactly (including protocol and port)

## Code Changes Made

### 1. Auth Callback Route (`src/app/auth/callback/route.ts`)
- Added detailed logging
- Detects new users by comparing timestamps
- Redirects to `/learn` with `?registered=true` for new users
- Redirects to `/learn` for existing users

### 2. Auth Library (`src/lib/supabase/auth.ts`)
- Added `skipBrowserRedirect: false` to OAuth options
- Ensures proper redirect flow

### 3. Middleware (`src/middleware.ts`)
- Simplified to avoid interfering with auth flow
- Only refreshes session for Server Components

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## Production Deployment

When deploying to production (e.g., Vercel):

1. Update Supabase Dashboard Site URL to your production domain
2. Add production callback URLs to allowed redirect URLs
3. Update `NEXT_PUBLIC_SITE_URL` environment variable in Vercel
4. Redeploy the application

## Testing Checklist

- [ ] New user registration redirects to `/learn?registered=true`
- [ ] Success toast appears with correct message
- [ ] URL is cleaned (query parameter removed)
- [ ] Existing user login redirects to `/learn` (no toast)
- [ ] Russian message displays correctly
- [ ] English message displays correctly (after changing locale)
- [ ] Guest mode still works
- [ ] Email magic link works

## Support

If issues persist:
1. Check Supabase logs in Dashboard → Logs
2. Check browser Network tab for redirect chain
3. Verify all environment variables are set correctly
4. Clear browser cache and cookies
5. Try in incognito mode
