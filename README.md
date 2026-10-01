<img src="https://img.shields.io/badge/Estado-Em%20andamento-yellow?style=plastic&labelColor=555" alt="Estado em andamento">


# Brasa Grill — restaurant website demo

<div>
<a href="https://code.visualstudio.com" target="_blank"><img src="https://img.shields.io/badge/Visual%20Studio-5C2D91.svg?style=for-the-badge&logo=visual-studio&logoColor=white" title="Visual Studio Code" height="20"></a>
<a href="https://react.dev" target="_blank"><img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" title="React" height="20"></a>
<a href="https://www.java.com/pt-BR/" target="_blank"><img src="https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white" title="Java" height="20"></a>
<a href="https://start.spring.io/" target="_blank"><img src="https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white" title="SpringBoot" height="20"></a>
<a href="https://www.h2database.com" target="_blank"><img src="https://img.shields.io/badge/H2-Database-1f6feb.svg?style=for-the-badge" title="H2" height="20"></a>

Esse repositório foi feito por [Luis](https://github.com/oluuiss) utilizando Java, Spring Boot, API REST, React e banco de dados.
It is a restaurant website inspired by the structure and user experience of modern steakhouse sites, with its own
original visual identity ("Brasa Grill"). No third-party branding, logos or copy are used.
</div>

## Features

- **Menu & cart** — 26 demo dishes; open a dish, choose a quantity and add it to a server-side cart.
  Line totals, subtotal, delivery fee (free from R$ 150) and total are calculated by Spring.
- **Mock payment & orders** — fictional card checkout (no real gateway). A paid order moves automatically through
  *Aguardando confirmação da loja* (10 s) → *Pedido sendo preparado* (5 min) → *Entregador em rota* (5 min) →
  *Pedido entregue*, tracked live under **Meus pedidos**.
- **Table reservations** — "Como chegar" (address, map, phone) or "Reservar mesa" with an interactive floor plan
  (1, 2, 4 and 6-seat tables; available / selected / occupied states). Parties above 6 are asked to call
  +55 11 94784-9239. Availability and conflicts are handled by the backend.
- **Profile** — avatar dropdown with *Configurações*, *Meus pedidos* and *Sair*; the settings page is read-only and
  shows the ID document for the country of the selected language (CPF, SSN or Personalausweis).
- **Three languages** — 🇺🇸 English, 🇩🇪 Deutsch, 🇧🇷 Português. The choice is saved in the browser and sent as
  `Accept-Language`, so menu data and API error messages are translated by the backend too.
- **Liquid-glass UI** — translucent layered surfaces, soft blur, glass buttons; responsive from phone to desktop
  (the floor plan switches to a portrait layout on phones, dialogs become bottom sheets).

## Architecture

```
React (Vite, :5173) ──/api + Accept-Language──► Spring Boot (:8080) ──JPA──► H2 file database (./data)
  UI only: pages, components,                  controllers → services → repositories
  i18n dictionaries, API calls                 pricing, mock payments, order status, availability
```

| Layer | Tech | Location |
| --- | --- | --- |
| Frontend | React 19, React Router, Vite, plain CSS | `frontend/` |
| Backend | Java 24, Spring Boot 3.5, Spring Data JPA, Bean Validation | `src/main/java/...` |
| Database | H2 (file mode, default) — MySQL optional | `./data/` (created automatically) |

**Login flow:** React login screen → `POST /api/auth/login` → backend loads the user from the database →
checks the password against its **BCrypt hash** → stores the user id in an HttpOnly session cookie. The frontend
never contains or checks credentials itself.

### API

All endpoints accept `Accept-Language: pt-BR | en | de`. 🔒 = requires the session cookie.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Body `{ email, password }` → user. `401` wrong credentials, `400` with `{ fields }` |
| `GET` | `/api/auth/me` 🔒 | Current user |
| `POST` | `/api/auth/logout` | Ends the session |
| `GET` | `/api/profile` 🔒 | Read-only profile + ID document for the language's country (no update endpoint) |
| `GET` | `/api/menu` | Translated menu (`?featured=true` for highlights) |
| `GET` | `/api/cart` 🔒 | Cart lines + subtotal, delivery fee, total |
| `POST` | `/api/cart/items` 🔒 | `{ menuItemId, quantity }` adds to the cart |
| `PUT` / `DELETE` | `/api/cart/items/{menuItemId}` 🔒 | Set quantity (`0` removes) / remove |
| `POST` | `/api/orders/checkout` 🔒 | `{ cardholderName, cardNumber, expiry, cvv }` → mock payment + order |
| `GET` | `/api/orders` 🔒, `/api/orders/{number}` 🔒 | Order history / detail with status timeline |
| `GET` | `/api/reservations/options` | Restaurant info, time slots, max party size |
| `GET` | `/api/reservations/availability?date&time&partySize` | Floor plan with each table's state |
| `POST` | `/api/reservations` 🔒 | `{ tableId, date, time, partySize }` (`409` if the table was just taken) |
| `GET` / `DELETE` | `/api/reservations/mine` 🔒, `/api/reservations/{code}` 🔒 | Upcoming reservations / cancel |

**Mock payment test cards** (any future expiry, any 3-digit CVV): `4242 4242 4242 4242` and
`5555 5555 5555 4444` are approved, `4000 0000 0000 0002` is declined. Invalid numbers (Luhn) are rejected.
Only the brand and last 4 digits are stored.

Business settings (delivery fee, order status durations, restaurant hours, etc.) live in
`src/main/resources/application.properties` under `app.*`.

### Project structure

```
frontend/src/
  api/          fetch client (sends Accept-Language) + endpoint modules
  i18n/         I18nContext + locales/pt.js, en.js, de.js
  context/      Auth, Cart (mirrors the server cart), Toast
  components/   layout/ (Header, LanguageSwitcher, ProfileMenu, Footer), ui/ (Button, TextField, Modal, Logo, Flag, Icons),
                home/, menu/, cart/, orders/, reservation/ (FloorPlan, BookingPanel, DirectionsPanel), auth/
  pages/        Home, Menu, Cart, Checkout, Orders, OrderDetail, Reserve, Settings, Restaurants, Login, ForgotPassword
  styles/       global.css (liquid-glass design tokens)
src/main/java/com/oluuiss/demo_sneakhouse/
  auth/ user/ profile/   authentication, users, read-only profile
  menu/                  MenuItem (+ translations), MenuService, MenuController
  cart/                  CartItem, CartService, PricingService (all price calculations)
  payment/               MockPaymentService (fictional gateway)
  order/                 CustomerOrder, OrderService, OrderStatusPolicy (time-based status), OrderController
  reservation/           DiningTable, Reservation, ReservationService (availability), ReservationController
  common/                errors (localized), current-user resolver, locale config
  config/                DataSeeder (seed/menu.json, seed/tables.json), PasswordConfig, SpaForwardController
```

## Getting started

### Prerequisites

- **JDK 24** (the Maven wrapper downloads Maven itself)
- **Node.js 20+** and npm

### 1. Clone

```bash
git clone https://github.com/oluuiss/demo-outback.git
```

### 2. Local database

Nothing to install. The backend uses an **embedded H2 database stored in `./data/`**. It is created on the
first start, and the tables plus the demo data (the demo user and the menu) are seeded automatically.

- Inspect it at <http://localhost:8080/h2-console> (JDBC URL `jdbc:h2:file:./data/brasa-db`, user `sa`, empty password).
- To reset it, stop the backend and delete the `data/` folder.

<details>
<summary>Optional: use MySQL instead (Docker)</summary>

```bash
docker compose up -d
```

Then run the backend with the `mysql` profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```
</details>

### 3. Run the Java backend (port 8080)

```bash
./mvnw spring-boot:run
```

On Windows (cmd/PowerShell) use `mvnw.cmd spring-boot:run`. Run the backend tests with `./mvnw test`.

### 4. Run the React frontend (port 5173)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` to the backend, so the session cookie works without CORS setup.

### 5. Log in with the demo account

| E-mail / usuário | Senha |
| --- | --- |
| `usuario@demo` | `usuario` |

Go to **Entrar** (or <http://localhost:5173/login>). This is the only account; there is no registration yet.
The demo credentials are defined in `src/main/resources/application.properties` (`app.demo-user.*`) and are
stored in the database as a BCrypt hash.

### Single-jar build (optional)

To serve the React app from Spring Boot on port 8080:

```bash
cd frontend
npm run build:backend
```

Then from the project root:

```bash
./mvnw spring-boot:run
```

## Deploy (Vercel + Render + Neon)

Vercel only hosts static sites, so the app is split across three free services:

| Part | Service | Config in this repo |
| --- | --- | --- |
| React site | **Vercel** | `vercel.json`: builds `frontend/` and forwards `/api/*` to Render |
| Spring Boot API | **Render** (Docker, region Virginia) | `Dockerfile`, `render.yaml` |
| Postgres database | **Neon** (project `brasa-grill`, São Paulo) | `application-prod.properties` |

Because Vercel proxies `/api` to Render, the browser only ever talks to the Vercel domain and the login cookie
works without any CORS setup. On first start the backend creates the tables and seeds the demo account, the menu
and the floor plan, so `usuario@demo` / `usuario` works right away.

**1. Database (Neon).** Copy the connection string from the Neon console (project `brasa-grill` → *Connect*,
database `brasa`, connection pooling **off**). It looks like
`postgresql://brasa:<password>@ep-....sa-east-1.aws.neon.tech/brasa?sslmode=require`.

**2. Backend (Render).** *New → Blueprint* → pick this repository → paste the Neon string into `DATABASE_URL`.
The service is created as `brasa-grill-api`. If Render gives it a different URL than
`https://brasa-grill-api.onrender.com`, update the first rewrite in `vercel.json`.

**3. Frontend (Vercel).** Import the repository; `vercel.json` already sets the install/build commands and the
output folder, so no settings need to be changed.

Notes about the free plans: the Render service sleeps after ~15 minutes without traffic, so the first request after
that takes 30–60 s while it wakes up. Neon also scales to zero and wakes up in a moment. Data is permanent (Neon),
and everyone shares the demo account, so visitors see each other's orders and reservations.

To run the production profile locally against any Postgres:

```bash
DATABASE_URL="postgresql://user:password@host/db?sslmode=require" SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```
