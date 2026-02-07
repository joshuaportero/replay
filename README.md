# 📜 LifeReplay: Digital Time Capsule

**LifeReplay** is a digital legacy service that allows you to seal messages, videos, and memories today to be delivered to yourself or loved ones in the future.

Built with **Next.js** and **Supabase**, this demo showcases the "Sealing Ceremony" and the scheduled "Reveal" of digital memories.

---

## 🚀 The Vision

In a world of instant gratification, LifeReplay focuses on the long-term.

* **Preserve Identity:** Record stories for your future self or children.
* **Scheduled Delivery:** Set a date-from 5 minutes to 50 years-to unlock the content.
* **Security First:** Private memories stay private until the moment of truth.

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router)
* **Backend/Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (Magic Links)
* **Storage:** Supabase Storage (for video and image assets)
* **Styling:** Tailwind CSS + Framer Motion (for "unboxing" animations)

## 🏁 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/joshuaportero/replay.git
cd replay
```

### 2. Set up Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## 🔒 Key Demo Features

1. **Magic Link Auth:** Users can sign in instantly without remembering a password.
2. **The Vault:** Upload a video or text, set a timer, and "seal" it.
3. **The Reveal:** A dedicated URL that stays locked with a countdown until the `delivery_date` is met.