<div align="center">

# 🏡 Havyn

### Find your haven, anywhere.

A production-grade, full-stack **property rental & booking platform** (an Airbnb-style experience) built with the **MERN** stack — MongoDB, Express, React and Node.js.

</div>

---

## ✨ Features

- **Discover & search** — hero search (location, dates, guests), category chips, and a full filter modal (price range, property type, amenities, bedrooms/bathrooms, instant book, superhost).
- **Rich listing cards** — real, high-resolution image carousels, ratings, Superhost / Instant-book badges, and an animated wishlist heart.
- **Property detail** — photo mosaic + full-screen lightbox, host profile, amenities, an embedded map, a ratings breakdown, and a **sticky booking widget** with a live price breakdown.
- **Booking flow** — date + guest selection, server-side price calculation, and a **double-booking guard** that checks date overlaps before confirming.
- **Payments** — choose **Pay online** (Stripe test mode, with a built-in mock gateway fallback) or **Pay at property**.
- **Authentication** — JWT auth (httpOnly cookie *and* bearer-token fallback), bcrypt password hashing, signup / login / become-a-host.
- **Trips & wishlist** — upcoming / past trips with cancel & pay actions; saved-properties page.
- **Host dashboard** — listings CRUD with multi-image URLs, reservation management (confirm / decline / complete), and an earnings summary.
- **Reviews** — guests who completed a stay can leave a star rating + written review; property ratings auto-recalculate.
- **Polished UX** — Framer Motion micro-interactions, skeleton loaders, friendly empty states, full responsiveness (mobile bottom-nav → desktop multi-column), and optional **dark mode**.

---

## 🧱 Tech Stack

| Layer | Technologies |
|------|--------------|
| **Frontend** | React 18 (Vite), Tailwind CSS, React Router, Axios, Framer Motion, Zustand, lucide-react, react-hot-toast, date-fns |
| **Backend** | Node.js, Express, Mongoose |
| **Database** | MongoDB (Atlas or local) |
| **Auth** | JWT + bcryptjs |
| **Payments** | Stripe (test mode) with a mock-gateway fallback |
| **Security** | helmet, cors (origin allow-list), express-rate-limit, express-mongo-sanitize, server-side validation (express-validator) |

---

## 📁 Project Structure

```
havyn/
├── server/                     # Express REST API
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js  Property.js  Booking.js  Review.js
│   ├── controllers/            # Route handlers (business logic)
│   ├── routes/                 # Express routers (auth, properties, bookings, reviews, payments)
│   ├── middleware/             # asyncHandler, auth, errorHandler, validate
│   ├── utils/                  # ApiError, ApiResponse, pricing, token helpers
│   ├── seed/                   # Database seeder + sample data
│   ├── server.js               # App entry point
│   └── .env.example
│
└── client/                     # React (Vite) single-page app
    ├── src/
    │   ├── api/                 # axiosInstance + service layer
    │   ├── store/               # Zustand stores (auth, wishlist)
    │   ├── hooks/               # useTheme
    │   ├── utils/               # format + constants
    │   ├── components/          # layout, ui, property, booking, reviews, search, auth
    │   ├── pages/               # Home, PropertyDetail, Login, Signup, Trips, Profile, Wishlist, HostDashboard, ListingForm, Checkout, NotFound
    │   ├── App.jsx  main.jsx  index.css
    ├── tailwind.config.js
    ├── vite.config.js
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- A **MongoDB** database — either a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local `mongod` instance.

### 1. Clone & install

```bash
git clone <your-repo-url> havyn
cd havyn

# Backend
cd server && npm install

# Frontend (in a second terminal)
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`** (copy from `server/.env.example`):

```bash
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/havyn
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
# Optional — leave the placeholder to use the built-in mock payment gateway:
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

**`client/.env`** (copy from `client/.env.example`) — the default works out of the box thanks to the Vite proxy:

```bash
VITE_API_URL=/api
```

### 3. Seed the database (optional but recommended)

```bash
cd server
npm run seed          # wipe + load sample hosts, listings, bookings & reviews
npm run seed:destroy  # wipe everything
```

**Demo accounts** (password for both: `password123`):

| Role | Email |
|------|-------|
| Guest | `sam@havyn.dev` |
| Host (Superhost) | `aria@havyn.dev` |

### 4. Run the app

```bash
# Terminal 1 — API
cd server && npm run dev      # http://localhost:5000

# Terminal 2 — Web
cd client && npm run dev      # http://localhost:5173
```

Open **http://localhost:5173** 🎉

---

## 🐳 Run with Docker (one command)

The whole stack — MongoDB, API, and the web app behind nginx — runs with a single command. No local Node or MongoDB required.

```bash
# from the repo root
JWT_SECRET=your_secret docker compose up --build

# then load sample data (in another terminal)
docker compose exec server npm run seed
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:8080 |
| API | http://localhost:5000 |

nginx serves the built SPA and reverse-proxies `/api` to the API container, so the frontend and backend share an origin (no CORS, cookies just work). Optional `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` env vars enable real Stripe test mode; otherwise the built-in mock gateway is used.

---

## 🔌 API Reference

All responses share a consistent envelope:

```jsonc
// success
{ "success": true,  "message": "…", "data": { … } }
// error
{ "success": false, "message": "…", "errors": [ … ] }
```

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Create account |
| POST | `/api/auth/login` | Public | Log in |
| POST | `/api/auth/logout` | Private | Log out |
| GET  | `/api/auth/me` | Private | Current user |
| PUT  | `/api/auth/me` | Private | Update profile |
| POST | `/api/auth/become-host` | Private | Enable hosting |
| GET  | `/api/auth/wishlist` | Private | Saved properties |
| POST | `/api/auth/wishlist/:propertyId` | Private | Toggle wishlist |

### Properties
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/properties?location=Goa&type=Villa&minPrice=100&maxPrice=500&amenities=WiFi,Pool&page=1&limit=12&sort=price_asc` | Public | Filter + paginate |
| GET | `/api/properties/:id` | Public | Detail + booked date ranges |
| GET | `/api/properties/host/me` | Host | My listings |
| POST | `/api/properties` | Host | Create |
| PUT | `/api/properties/:id` | Host (owner) | Update |
| DELETE | `/api/properties/:id` | Host (owner) | Soft-delete |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Private | Create (validates overlap + pricing) |
| GET | `/api/bookings/me?status=upcoming\|past` | Private | My trips |
| GET | `/api/bookings/host/me` | Host | Incoming reservations + earnings |
| GET | `/api/bookings/:id` | Private | Single booking |
| PUT | `/api/bookings/:id/cancel` | Private (guest) | Cancel |
| PUT | `/api/bookings/:id/status` | Host | Confirm / Complete / Cancel |
| GET | `/api/bookings/availability/:propertyId?checkIn=&checkOut=` | Public | Availability check |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | Private | Add review (completed stay only) |
| GET | `/api/reviews/:propertyId` | Public | List + rating breakdown |
| DELETE | `/api/reviews/:id` | Private (author) | Delete |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/payments/config` | Public | Provider + publishable key |
| POST | `/api/payments/create` | Private | Create payment intent |
| POST | `/api/payments/verify` | Private | Confirm payment |

---

## 🛡️ Engineering Notes

- **Consistent API shape** via a `sendResponse` helper and a centralized error-handling middleware that normalizes Mongoose, JWT, and validation errors.
- **Reusable async handler** wraps every controller — no scattered try/catch.
- **Server-authoritative pricing** — the client mirrors the formula for live display, but the server recomputes totals on booking.
- **Double-booking prevention** — `Booking.hasConflict()` runs an overlap query before any reservation is confirmed.
- **Security** — helmet headers, a CORS origin allow-list (not `*`), API rate-limiting, NoSQL-injection sanitization, bcrypt hashing, and httpOnly cookies.
- **Componentized frontend** — a dedicated Axios service layer, Zustand stores, custom hooks, and small, focused components (no monolithic files).

> 💳 **Payments:** if no real Stripe key is set, the API automatically uses a built-in **mock gateway** so the entire booking → pay → confirm flow works end-to-end without external credentials.

---

## 📜 License

MIT — built as a portfolio-grade reference implementation.
