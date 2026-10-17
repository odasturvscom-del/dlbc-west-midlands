# Deeper Life Bible Church, West Midlands: website + admin

This folder is the complete website. It runs on **Vercel** (free plan) with a free **Upstash Redis** database for content, photos, messages and logins. It has no build step and no packages to install.

```
index.html     the website and admin portal (admin is at /#admin)
api/           small server functions: content, photos, forms, logins, admin changes
package.json   tells Vercel to use modern JavaScript
vercel.json    security headers
```

## Put it live (about 15 minutes)

### 1. Put the files on GitHub
1. Sign in at github.com and click **New repository**. Name it `dlbc-west-midlands`, choose **Private**, and click **Create repository**.
2. On the empty repository page, click **uploading an existing file**.
3. Drag in **everything inside this folder** (index.html, the `api` folder, package.json, vercel.json, README.md), then click **Commit changes**.

### 2. Create the Vercel project
1. In Vercel, click **Add New… → Project** and **Import** the `dlbc-west-midlands` repository. Allow Vercel to access it if asked.
2. Leave **Framework Preset** as **Other**, then click **Deploy**.

### 3. Add the database
1. Open the project, go to the **Storage** tab, click **Create Database**, choose **Upstash for Redis** and pick the **Free** plan.
2. When asked, **connect it to this project**. Vercel adds the database keys for you.

### 4. Add your setup code
1. Go to **Settings → Environment Variables**.
2. Add `SETUP_CODE` with a private phrase only you know, for example `blue-river-2026`. You need it once to create the owner account.
3. Optional: add `SESSION_SECRET` with a long random string.
4. Go to **Deployments**, open the latest one, choose **⋯ → Redeploy**, and wait for it to finish.

### 5. Create your owner login
Open `https://YOUR-PROJECT.vercel.app/#admin`, fill in your name, email, a password of at least 10 characters, and the setup code. You're now the owner. The setup form disappears after this.

## Use your own address

### Option A (recommended): subdomain such as `dlbcwestmidlands.georgeodiana.com`
1. In Vercel go to **Settings → Domains**, add `dlbcwestmidlands.georgeodiana.com` and click **Add**.
2. Vercel shows a **CNAME** record. At the company that manages DNS for georgeodiana.com, add a CNAME record with name `dlbcwestmidlands` and the value Vercel shows.
3. Wait until Vercel shows **Valid Configuration** (usually minutes). HTTPS is set up automatically.

### Option B: a folder such as `georgeodiana.com/dlbcwestmidlands`
This only works if georgeodiana.com itself is hosted on Vercel. Add this to the **georgeodiana.com** project's `vercel.json`, replacing `YOUR-PROJECT`, then redeploy that project:

```json
{
  "rewrites": [
    { "source": "/dlbcwestmidlands", "destination": "https://YOUR-PROJECT.vercel.app/" },
    { "source": "/dlbcwestmidlands/:path*", "destination": "https://YOUR-PROJECT.vercel.app/:path*" }
  ]
}
```

The site detects the folder by itself; nothing else needs changing. If georgeodiana.com is hosted somewhere else (such as WordPress or Wix), use Option A.

### Later: the church's own domain
Add it the same way under **Settings → Domains**, for example `deeperlifewestmidlands.org.uk`. Both addresses keep working.

## Photos and storage
- **Uploaded photos** are resized to roughly 250 KB each. The free database holds 256 MB, enough for about 900 photos.
- **Google Drive photos use no database space.** In Admin → Media library → **Add from Google Drive**, paste share links. In Drive, each photo must be shared as **Anyone with the link**. Google may slow down very heavy traffic to Drive photos, so for the homepage banner an uploaded photo is the safest choice.

## Logins and roles
- **Owner** (you): everything, including making administrators.
- **Administrator**: everything, including the inbox and adding people.
- **Content editor**: posts, events, sermons, livestream, ministries and photos. No inbox.
- **Pastoral team**: the inbox only (visit plans, messages, prayer requests).

Add people in **Admin → Users & access**. Each gets a temporary password to pass on privately and can change it there. The server checks every change against the person's role.

## Livestream
In **Admin → Livestream**, paste your YouTube channel link (or a specific stream link) and press **Go live** when the service starts. Visitors see a red "Live now" bar and can watch on the **Watch live** page.

## Before launch
- Replace every "To be confirmed" item: service times, addresses, phone and email (see the admin Overview).
- Replace the placeholder privacy and safeguarding text (Admin → Page content → Policies).
- Prayer requests and messages are stored in your Upstash database. Make sure your privacy notice says so.
