# Stripe Payment Processing — Setup Requirements

---

## Prerequisites

### Stripe Account
- [ ] Create a Stripe account at https://dashboard.stripe.com (supports Greek businesses)
- [ ] Complete business verification (tax ID, address, bank account)
- [ ] Enable payment methods: Cards, SEPA Direct Debit, Apple Pay, Google Pay
- [ ] Configure payout schedule (default: daily/weekly to Greek IBAN)
- [ ] Enable 3D Secure (Stripe Radar handles this automatically)

### Development Requirements
- [ ] Stripe API keys: `pk_test_xxx` (publishable) and `sk_test_xxx` (secret)
- [ ] Webhook signing secret (`whsec_xxx`) for local testing
- [ ] Stripe CLI installed (for forwarding webhooks to localhost)
- [ ] Environment variables configured:

```env
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Backend Implementation

### 1. Install Stripe SDK

```bash
npm install stripe
# or
pip install stripe
```

### 2. Create Checkout Session Endpoint

```typescript
// POST /api/payments/create-checkout-session
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { courseId, userId, price, courseName } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: courseName },
        unit_amount: Math.round(price * 100), // Stripe uses cents
      },
      quantity: 1,
    }],
    metadata: { courseId, userId },
    success_url: `${req.headers.get('origin')}/courses/${courseId}?success=true`,
    cancel_url: `${req.headers.get('origin')}/courses/${courseId}?canceled=true`,
    // EU compliance: customer details for receipts
    customer_creation: 'always',
    billing_address_collection: 'required',
  });

  return Response.json({ url: session.url });
}
```

### 3. Webhook Handler

```typescript
// POST /api/webhooks/stripe
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { courseId, userId } = session.metadata!;

    // Grant enrollment
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        paid: true,
      },
    });

    // Save payment record
    await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: session.amount_total! / 100,
        status: 'completed',
        stripeSessionId: session.id,
      },
    });
  }

  return Response.json({ received: true });
}
```

### 4. Local Webhook Testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

---

## Stripe Dashboard Configuration

### Products & Prices
- Create products manually in the dashboard OR dynamically via API
- Prices in EUR (cents) — Stripe handles rounding
- Set up recurring prices if using subscriptions

### Webhook Endpoints
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Grant enrollment, create payment record |
| `checkout.session.expired` | Log abandoned cart (optional) |
| `charge.refunded` | Revoke enrollment, update payment status |
| `invoice.payment_failed` | Notify user (subscription only) |

### Stripe Radar (Fraud Protection)
- Enabled by default with machine learning
- 3D Secure 2 enforced for EU cards (PSD2/SCA compliance)
- Custom rules available for advanced fraud filtering

---

## Greek-Specific Configuration

| Requirement | Stripe Setting |
|-------------|----------------|
| Currency | `EUR` |
| Statement descriptor | Business name as registered in Greece |
| Receipts | Stripe automatically generates VAT-compliant receipts |
| Payout currency | EUR (to Greek IBAN) |
| SCA compliance | Automatic via Stripe Checkout + 3D Secure |
| Tax calculation | Enable Stripe Tax for automated Greek VAT (24%) |

### Greek VAT Handling (ΦΠΑ)

**Option A: Stripe Tax**
```typescript
const session = await stripe.checkout.sessions.create({
  automatic_tax: { enabled: true },
  // Stripe calculates 24% Greek VAT automatically
});
```

**Option B: Merchant of Record (Lemon Squeezy / Paddle)**
- They handle VAT collection and remittance
- Higher fees (~5% + €0.50) but zero compliance burden

**Option C: Self-managed**
- Register for Greek VAT (ΑΦΜ) + OSS for EU cross-border sales
- Remit VAT quarterly via TAXISnet
- No additional per-transaction fee

---

## Security Checklist

- [ ] Never log or expose `STRIPE_SECRET_KEY`
- [ ] Verify webhook signatures on every event
- [ ] Use idempotency keys for critical operations
- [ ] Store only `stripeSessionId` — never raw card data (PCI compliance)
- [ ] Use Stripe Checkout (redirect) instead of custom card forms (reduces PCI scope)
- [ ] Set a webhook endpoint secret (prevents spoofed requests)
- [ ] Limit API key permissions (restrict to payments only if possible)

---

## Testing Checklist

- [ ] Test with Stripe test card `4242 4242 4242 4242` (success)
- [ ] Test with `4000 0000 0000 0002` (declined)
- [ ] Test with `4000 0025 0000 3155` (3D Secure required)
- [ ] Test webhook locally with Stripe CLI
- [ ] Verify enrollment is created after successful payment
- [ ] Verify enrollment is NOT created on failed/declined payment
- [ ] Test refund flow
- [ ] Test SEPA Direct Debit with test IBAN `DE89370400440532013000`

---

## Production Go-Live Checklist

- [ ] Switch from test keys to live keys
- [ ] Configure webhook endpoint in Stripe Dashboard with production URL
- [ ] Enable SSL (Stripe requires HTTPS in production)
- [ ] Set up Stripe Radar rules for fraud prevention
- [ ] Configure email receipts in Stripe Dashboard
- [ ] Add privacy policy mentioning Stripe as payment processor (GDPR)
- [ ] Test complete payment flow in production mode with a real €1 transaction (then refund)
- [ ] Monitor first payments in Stripe Dashboard
