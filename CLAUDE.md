# Chat Focinho - Pet Portrait via Chat

## Stack

- **Frontend:** Next.js 16 with App Router
- **Database:** Supabase (shared with Fotofocinho)
- **AI:** AIML API (Gemini image edit)
- **Payments:** AbacatePay (PIX)
- **Email:** Resend

## Shared Backend

Same Supabase tables, AbacatePay account, and Resend as Fotofocinho.

## Env vars (.env.local)

```
GEMINI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ABACATEPAY_API_KEY
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
RESEND_FROM
AIML_API_KEY
```

## GitHub

- **Repo:** https://github.com/pedroccm/chat-focinho
- **Account:** pedroccm
