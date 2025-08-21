# CIVIX Deployment Guide for civix.vote

## Quick Deployment Options

### Option 1: Vercel (Easiest - Free Tier Available)

1. **Push to GitHub:**
```bash
cd /home/bison808/DELTA/agent4_frontend
git init
git add .
git commit -m "Initial CIVIX alpha release"
git remote add origin https://github.com/yourusername/civix-app.git
git push -u origin main
```

2. **Deploy to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Deploy automatically

3. **Configure Domain in GoDaddy:**
- In Vercel, go to Settings → Domains
- Add `app.civix.vote` or `alpha.civix.vote`
- In GoDaddy DNS settings, add:
  - Type: CNAME
  - Name: app (or alpha)
  - Value: cname.vercel-dns.com

### Option 2: Netlify (Also Free)

1. **Build the app:**
```bash
npm run build
```

2. **Deploy:**
- Drag and drop the `.next` folder to [netlify.com](https://netlify.com)
- Or use Netlify CLI: `npx netlify deploy`

3. **Configure subdomain similarly to Vercel**

### Option 3: Traditional VPS (More Control)

1. **Set up a VPS** (DigitalOcean, AWS, Linode)
2. **Install Node.js and PM2**
3. **Clone and run:**
```bash
git clone your-repo
cd civix-app
npm install
npm run build
pm2 start npm --name "civix" -- start
```

## Alpha Access System

### Current Access Codes:
- `CIVIX2025`
- `ALPHATEST`
- `BETATESTER`
- `DEMOCRACY`
- `VOTENOW`

### How to Share with Friends:

1. **Send them the alpha URL:**
   - `https://app.civix.vote/alpha` (or wherever you deploy)

2. **Give them an access code** from the list above

3. **They enter the code** and get full access

### To Add More Codes:
Edit `/app/alpha/page.tsx` and add to the `VALID_CODES` array

## Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SITE_URL=https://app.civix.vote
```

## Recommended Setup

### Keep Your Landing Page:
- Main domain: `civix.vote` - Your existing landing page
- Alpha app: `app.civix.vote` or `alpha.civix.vote`

### Add to Landing Page:
```html
<!-- Add this button to your landing page -->
<a href="https://app.civix.vote/alpha" class="button">
  Join Alpha Testing
</a>
```

## Security Notes

1. **For true private alpha:**
   - The access codes provide basic protection
   - For more security, add:
     - IP whitelisting
     - OAuth with Google/GitHub
     - Invite-only email system

2. **Before public launch:**
   - Remove `/alpha` page
   - Remove access code checks
   - Set up proper authentication

## Quick Test Locally

Test the alpha access page:
```bash
npm run dev
# Go to http://localhost:3008/alpha
# Enter code: CIVIX2025
```

## Monitoring

After deployment, monitor your alpha testers:
- Add analytics (Google Analytics, Plausible)
- Set up error tracking (Sentry)
- Create feedback form

## Next Steps

1. Deploy to Vercel/Netlify (easiest)
2. Configure subdomain in GoDaddy
3. Share alpha URL + access code with friends
4. Collect feedback
5. Iterate and improve!

---

**Need help?** The easiest path is:
1. Push to GitHub
2. Deploy to Vercel (automatic)
3. Add subdomain in GoDaddy
4. Share `app.civix.vote/alpha` with friends