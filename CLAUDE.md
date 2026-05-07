# CLAUDE.md - ReceiptFlow Project Rules

## Project Overview
You are building **ReceiptFlow**, a simple Micro SaaS that lets freelancers and solopreneurs:
- Snap or upload receipt photos
- AI automatically extracts merchant, date, amount, currency, and tax category
- Users can edit and save entries
- Generate monthly expense reports (CSV + PDF)
- Track usage limits based on subscription (Free vs Pro)

Target users: Freelancers, consultants, small business owners.

Core value: Turn chaotic receipt photos into clean, tax-ready expense data in seconds.

## Tech Stack (Strictly Follow)
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database & Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Anthropic Claude (Claude 3.5 Sonnet or Haiku when appropriate)
- **Payments**: Stripe
- **Deployment**: Vercel
- **Other**: Zod for validation, Lucide React for icons, date-fns for dates

## Coding Style & Conventions
- Always use **TypeScript** with strict types.
- Prefer **Server Actions** over API routes when possible.
- Use **Server Components** by default. Client Components only when needed (`"use client"`).
- Keep components small and focused.
- Use proper error handling and loading states (`useTransition`, `Suspense`).
- Name files and folders clearly (kebab-case for folders, PascalCase for components).
- Always add helpful comments for complex logic.

## UI/UX Guidelines
- Clean, minimal, modern design.
- Mobile-first and highly responsive (many users will upload from phone).
- Large, friendly upload area with dashed border and camera icon.
- Use green accents for success states.
- Show clear confidence scores for AI extractions.
- Make editing extracted data very easy.
- shadcn/ui components only (Button, Card, Input, Table, Dialog, etc.).
- Good loading animations and success toasts.

## Database Schema (Reference)
Main tables:
- receipts: id, user_id, image_url, extracted_data (JSONB), status, created_at
- profiles: user_id, subscription_tier (free/pro), receipt_count_this_month, etc.

Always respect Row Level Security (RLS).

## AI Extraction Rules (Very Important)
When calling Claude for receipt extraction:
- Always return clean, valid JSON.
- Extract: merchant, date (ISO format), amount (number), currency, category, confidence (0-100)
- Tax-friendly categories for freelancers: Software & Tools, Marketing, Office Supplies, Travel & Transport, Meals & Entertainment, Professional Services, Equipment, Utilities, Rent, Miscellaneous.
- Be robust with different currencies, languages, and messy receipts.
- Include a short "notes" field for anything unusual.

## Security & Best Practices
- NEVER expose API keys (Anthropic, Stripe, Supabase) on the client.
- All AI and Stripe calls must happen on the server.
- Validate all user inputs with Zod.
- Handle errors gracefully and show friendly messages to users.
- Never trust client data.

## Subscription Logic
- Free tier: max 10 receipts per month
- Pro tier ($12–19/mo): unlimited receipts + priority processing + better reports
- Check subscription status before processing new receipts.

## Development Workflow
- Think step-by-step before coding.
- Present a clear plan first when building new features.
- List files you will create or modify.
- Ask clarifying questions if needed.
- After implementing, suggest next logical steps.

## Tone & Personality
- Helpful, clear, and encouraging.
- Prioritize speed of development while keeping code clean.
- Focus on delivering a delightful user experience.

You are now an expert at building ReceiptFlow. Always follow these rules unless the user explicitly asks to change them.