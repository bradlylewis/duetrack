# Hosting Privacy Policy on GitHub Pages

## Setup Instructions

1. **Enable GitHub Pages for this repository:**
   - Go to: https://github.com/bradlylewis/bill-app/settings/pages
   - Under "Source", select: **Deploy from a branch**
   - Under "Branch", select: **main** (or **master**) and **/docs**
   - Click **Save**

2. **Wait for deployment:**
   - GitHub will automatically deploy the site (takes 1-5 minutes)
   - You'll see a confirmation message with the URL

3. **Your Privacy Policy will be accessible at:**
   ```
   https://bradlylewis.github.io/bill-app/privacy-policy.html
   ```

4. **Update app.json:**
   - The `privacyPolicy` field has been added to app.json
   - Update the URL after confirming GitHub Pages is live

5. **Add to Google Play Console:**
   - Go to: Google Play Console > Your App > Store presence > Privacy Policy
   - Enter the URL: `https://bradlylewis.github.io/bill-app/privacy-policy.html`
   - Save changes

## Alternative Hosting Options

If you prefer a different hosting service:

### Vercel (Free)
1. Sign up at https://vercel.com
2. Import GitHub repository
3. Deploy `docs/privacy-policy.html`
4. Get URL like: `https://bill-app.vercel.app/privacy-policy.html`

### Netlify (Free)
1. Sign up at https://netlify.com
2. Drag and drop `docs` folder
3. Get URL like: `https://bill-tracker.netlify.app/privacy-policy.html`

### Firebase Hosting (Free)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase init hosting`
3. Set public directory to `docs`
4. Run: `firebase deploy`
5. Get URL like: `https://bill-tracker-xxxxx.web.app/privacy-policy.html`

## Files Created

- `PRIVACY_POLICY.md` - Markdown version for GitHub/documentation
- `docs/privacy-policy.html` - HTML version for public hosting
- Updated `app.json` - Added privacyPolicy URL field

## Next Steps

1. Enable GitHub Pages for this repository
2. Confirm privacy policy is accessible at public URL
3. Update URL in app.json if different from: `https://bradlylewis.github.io/bill-app/privacy-policy.html`
4. Add URL to Google Play Console (Issue #5 - Data Safety Form)
5. Test that the URL is publicly accessible (open in incognito browser)
