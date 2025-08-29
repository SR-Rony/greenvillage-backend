# Greenvillage Backend

Express + MongoDB + JWT backend for an eCommerce that sells fresh village products (eggs, fish, chicken, greens).

## Quick Start

```bash
# 1) Copy env
cp .env.example .env

# 2) Install deps
npm install

# 3) Run dev
npm run dev
```

The API runs at `http://localhost:5000` by default.

- Health: `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Categories: `GET/POST /api/categories`
- Products: `GET/POST /api/products`
- Orders: `POST /api/orders`, `GET /api/orders/me`

## Notes

- Email sending uses Nodemailer. If SMTP is not configured, the service prints the verification/reset codes to the console for local development.
- CORS is restricted to `CLIENT_URL` from `.env`.
- Cookies are used for the access token (HTTP-only).
