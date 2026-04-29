# Campus Life Companion

A Next.js web application for university students to manage events, societies, rooms, and support.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the root with:
```
NEXT_PUBLIC_SUPABASE_URL=https://kmgwkyrdimsrvhnngdrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Add your images
Place `uni.jpg` and `OIP.png` in the `/public` folder.

## Pages
| Route | Description |
|---|---|
| `/` | Homepage |
| `/events` | Events list + application form |
| `/societies` | Societies list + join form |
| `/rooms` | Library room management |
| `/support` | Support desk |

## Deployment (Netlify)
1. Push to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Add environment variables in Netlify dashboard
5. Deploy!
