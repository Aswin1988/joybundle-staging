# JoyBundle

JoyBundle is a Bangalore-focused ecommerce storefront for customized kids’ birthday return-gift bundles. V1 uses Google Sheets intentionally for PMF testing and low-volume operations:

```text
Google Sheets -> server-only Next.js adapter -> public-safe serializer -> storefront
```

The business owner manages products in Google Sheets; no custom admin dashboard is required. Existing Supabase/admin code is retained as legacy/future architecture, but the normal V1 storefront does not require Supabase Auth, CRUD, RLS, Storage, or admin credentials.

## Setup

```bash
yarn install
cp .env.example .env.local
yarn dev
```

Set `CATALOG_DATA_SOURCE=fixture` for local/demo work or `CATALOG_DATA_SOURCE=google-sheets` for staging/production. Fixture mode is explicit; Google mode never silently falls back to fake data and fails closed if configuration or Sheet access is unavailable. With Google credentials, it reads Sheets and caches the catalog for 180 seconds.

Create one spreadsheet with tabs `Products`, `Product_Contents`, `Bag_Options`, `Product_Bag_Options`, `Settings`, `Orders`, `Order_Items`, and `Custom_Requests`. Copy headers and safe demo rows from `templates/google-sheets/`. The storefront reads the first five tabs; Phase 4 appends customer-submitted orders to the two order tabs using the canonical schemas. The Custom_Requests tab remains reserved for a future enquiry flow.

Share the spreadsheet with the service-account email as Editor and set these server-only variables:

```text
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

Never use `NEXT_PUBLIC_` for Google credentials or commit credentials, customer data, costs, or internal notes. `estimated_unit_cost_paise` and `internal_notes` are explicitly removed before public serialization.

Money is integer paise: ₹149 is `14900`. Set `active` to `TRUE` to publish a product and `FALSE` to hide it. Product edits normally appear within the 180-second cache window. Use deliberately public HTTPS image URLs; the site does not call Google Drive APIs to render images.

## Storefront V1

Routes: `/`, all six `/shop/...` budget bands, `/bundles/[slug]`, and `/cart`. Bundle configuration supports quantity, active associated bag options, and optional personalization: name up to 50 characters, age 1–18, and message up to 120 characters. Quantity means return gifts/children. The minimum order value is ₹700 from Settings with a safe default. Below-MOV add-to-cart is disabled; cart data is local-only and contains no sensitive customer data.

Checkout now collects delivery details and submits an order request through a server-only `/api/orders` route. The primary action is request-based: no payment is required at submission. The server re-reads the active Google Sheets catalog, recalculates prices in integer paise, enforces the ₹700 MOV, and appends one Orders row plus Order_Items rows in a single Sheets batch update. Payment, customer accounts, WhatsApp API automation, inventory, delivery pricing, fulfilment, and email remain out of scope. Idempotency is in-memory per running server process; a durable idempotency store is a future hardening step.

Orders start with status `RECEIVED` and are operated manually in Sheets: `CONFIRMED` means availability and delivery are confirmed, `AWAITING_PAYMENT` means the final amount was communicated, `PAID` means payment arrived, then `PREPARING`, `READY`, `DISPATCHED`, and `DELIVERED` track fulfilment. `CANCELLED` is used when an order is cancelled before completion. The confirmation page offers a pre-filled WhatsApp handoff when `WHATSAPP_NUMBER` is configured; the message contains only the order number, customer name, party date, and order value—not address or personalization details. Blank or invalid WhatsApp configuration hides the CTA without affecting order creation. A server-side lookup foundation exists but has no public unrestricted endpoint yet.
Customers can track an order at `/track-order` using the order number and the mobile number supplied at checkout. The server compares both values against fresh Orders-sheet data and returns only status, dates, totals, payment state, and item names/quantities. Tracking uses a lightweight process-local limit of 12 attempts per minute per IP/phone key; distributed rate limiting should be added before significant scale. The manual journey is: order request → WhatsApp confirmation → final price → QR code shared manually → payment received → owner updates the Sheet → customer tracks status.

## Validation

```bash
yarn lint
yarn test
yarn test:e2e
yarn build
git diff --check
yarn audit
```

`JOYBUNDLE_VALIDATE_ENV=true yarn check:env` requires Google Sheets credentials. The default `false` validates environment syntax without external configuration.

## Launch readiness

Before accepting real orders, review the active Products, prices, public photos
and alt text, descriptions, contents, bag associations, SEO fields, and the
WhatsApp setting in Google Sheets. Confirm the minimum order value and delivery
wording, then complete one synthetic order and Track Order check. Google Sheets
is the operations interface; the website is the ordering and customer-status
interface. Do not add customer exports or order data to Git.

Production requires `CATALOG_DATA_SOURCE=google-sheets`,
`GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and
`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`. Optional analytics uses
`NEXT_PUBLIC_GA_MEASUREMENT_ID`; it is never hardcoded and no customer or order
identifiers are sent as event parameters. WhatsApp continues to come from the
Sheet `Settings` tab.

The expected runtime is Node.js 22.x with Yarn 1.22.x. Build with `yarn build`
and start with `yarn start`; production normally runs the standalone Next.js
server behind the existing Nginx reverse proxy and PM2 process. Verify
`/api/health` after a release. Do not restart unrelated services.

The operator journey is: check new `RECEIVED` orders, confirm availability and
delivery charge, move the Sheet row to `CONFIRMED`, share the QR code manually,
mark `PAID` after payment confirmation, then move through `PREPARING`, `READY`,
`DISPATCHED`, and `DELIVERED`. Cancellation and damage/replacement guidance is
available at the customer-facing policy pages. Tracking requires order number
plus the matching mobile number; the lightweight process-local rate limit needs
distributed hardening before high-volume traffic.
