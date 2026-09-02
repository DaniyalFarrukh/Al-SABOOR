# Al Saboor Autos E-Commerce Platform

A high-performance, SEO-optimized, full-stack E-Commerce platform tailored for motorcycle parts and accessories in Pakistan. Built with Next.js 15, React 19, Supabase, and PostgreSQL.

## 🏗 Architecture & Tech Stack

*   **Framework:** Next.js 15 (App Router, Server Actions, SSR/SSG).
*   **Language:** TypeScript (Strict Mode).
*   **Styling:** Vanilla CSS (`globals.css`) designed for raw performance and maximum customizability without bloated utility classes.
*   **Database:** PostgreSQL (via Supabase) with highly relational schema, Triggers, and Functions.
*   **Authentication:** Supabase Auth (Email/Password, JWT).
*   **Security:** 
    *   Row Level Security (RLS) policies implemented on every single database table.
    *   Edge Middleware (`middleware.ts`) for strict route-based authorization.
    *   Role-Based Access Control (RBAC) via custom `roles` and `permissions` JSONB arrays.

## 🚀 Key Features

*   **Product Catalog & Inventory**: Complete SKU management, Brand/Category taxonomies, Flash Sales, and strict concurrent inventory deduction.
*   **Bike Fitment Engine**: Users can search for parts strictly compatible with their specific motorcycle model and year.
*   **Checkout & Payments**: Robust server-side checkout process designed to safely handle Cash on Delivery (COD) and integrate securely with local gateways (JazzCash/Easypaisa).
*   **CRM & Accounts**: Persistent Guest and User Carts, Order History, Wishlists, and Address Books.
*   **Admin Dashboard**: Comprehensive back-office suite to manage products, view analytics (revenue, top sellers), process returns, and adjust inventory manually.
*   **Audit Logging**: A bulletproof PostgreSQL Trigger (`log_admin_activity()`) automatically tracks and diffs every sensitive administrative action (Products, Orders, Settings) ensuring full accountability.
*   **Core Web Vitals & SEO**: Next.js `<Image>` optimization, Dynamic Metadata, automated `sitemap.xml`, and strict JSON-LD Structured Data generation (`Product`, `Offer`, `AggregateRating`, `Organization`).

---

## 🛠 Local Setup & Development

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Supabase CLI](https://supabase.com/docs/guides/cli) (Optional, for local DB development)

### 2. Environment Variables
Create a `.env.local` file in the root directory and populate it with your Supabase credentials. Do not commit this file.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Store Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

*(Note: API keys for payment gateways like JazzCash should also be stored here securely when implemented).*

### 3. Database Initialization
The entire database schema, RLS policies, triggers, and seed data have been scripted into sequential migrations.

To apply these to your live Supabase project, use the Supabase CLI:
```bash
# Link your local project to your remote Supabase instance
npx supabase link --project-ref your-project-ref

# Push all 14 migration files to the database
npx supabase db push
```

### 4. Run the Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) to view the backend.

---

## 🔒 Security Posture

This application treats security as a first-class citizen:
1.  **Never trust the client:** Carts and Checkouts recalculate prices entirely on the server using the `product_pricing` table before generating an order.
2.  **No overselling:** The `checkout_cart` Postgres RPC strictly checks inventory quantities in a safe transaction before confirming an order.
3.  **API Hardening:** Every Server Action mutating data strictly checks `hasPermission()` against the logged-in user's JWT.

## 🚀 Production Deployment (Vercel)

1.  Connect your GitHub repository to Vercel.
2.  Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Environment Variables in Vercel.
3.  Set the Build Command to `npm run build`.
4.  Deploy. Vercel will automatically generate optimized edge functions and static assets.
