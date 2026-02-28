# Agent System - Quick Start Guide

## What Changed?

### For Admins
- **Simplified Agent Creation**: Only 3 fields (name, email, phone)
- **Auto Promo Code**: System generates unique code automatically
- **Instant Approval**: Agents are immediately active

### For Agents  
- **Dual Role Access**: Login as normal customer AND earn commissions
- **Your Dashboard**: Shows purchases AND referrals with earnings
- **Promo Code**: Share to get 20% first-time customer discount

### For Customers
- **Use Agent Codes**: Get 20% off first purchase with agent's promo code
- **Support Local Agents**: Your purchase helps support agents on the platform

---

## How to Use

### 1. Create an Agent (Admin Only)

**URL**: `http://localhost:3001/admin/agents/onboard`

**Steps:**
1. Login as admin
2. Go to Admin Dashboard → "Onboard Agent" button
3. Fill form:
   - **Agent Name**: John Smith
   - **Email**: john@example.com  
   - **Phone**: 024 123 4567
4. Click "Create Agent"
5. 🎉 Agent created! Note the generated promo code: `AGENT-JS-A1B2`

**What Happens Behind the Scenes:**
- Agent record created (status: approved, commission: 20%)
- User account created (role: agent, can login)
- Promo code created (20% discount for first-time customers)
- Welcome email sent to agent

---

### 2. Agent Login & Shopping

**URL**: `http://localhost:3001/login`

**Steps:**
1. Enter email: `john@example.com`
2. Enter password: (whatever they set on first login)
3. Click Login
4. ✅ You see your dashboard with:
   - Your orders history
   - Your promo code displayed
   - Your referral stats
   - Button to "Agent Portal"

**Agent Dashboard** (`/dashboard`):
- See all your purchases
- Filter by status (pending, confirmed, delivered, cancelled)
- Sort by newest/oldest/highest/lowest price

**Agent Portal** (`/agent/dashboard`):
- Your unique promo code: `AGENT-JS-A1B2`
- Copy button to copy code
- Share buttons for WhatsApp, SMS, Email
- Referral list (customers who used your code)
- Earnings stats:
  - Total referrals: X customers
  - Total earned: ₵X.XX
  - Pending: ₵X.XX (waiting approval)

**Shopping Features**:
- Browse `/shop` - See all products
- Search products with search bar
- Filter by category
- Add to cart
- Checkout and pay
- Orders appear in your dashboard

---

### 3. Customer Uses Agent's Code

**At Checkout**:
1. Customer adds items to cart
2. Goes to checkout page
3. Sees "Promo Code" field
4. Enters agent's code: `AGENT-JS-A1B2`
5. ✅ Gets 20% discount applied!
6. Completes payment
7. Order confirmed

**What Happens**:
- System checks code is valid
- System checks customer is first-time buyer (if restricted)
- Applies 20% discount to total
- Records commission for agent:
  - Status: pending
  - Amount: 20% of order total
  - Customer info: stored for referral tracking

**Agent Sees**:
- New row in referral list
- Customer name and email
- Order amount
- Their 20% commission
- Status: pending (awaiting payment)

---

## Key Information

### Promo Code Format
- **Format**: `AGENT-XX-YYYY`
- **Example**: `AGENT-JS-A1B2`
- **XX**: First 2 letters of agent's name
- **YYYY**: Random 4 characters (0-9, a-z)
- **Unique**: Each agent has exactly one code

### Commission Structure
- **Rate**: 20% per referral
- **Calculation**: 20% of order total
- **Restriction**: First-time customers only
- **Payment**: Monthly processing
- **Status**: pending → paid

### User Roles
- **Admin**: Create agents, manage orders, view reports
- **Agent**: Purchase items + earn commissions
- **Customer**: Browse and purchase items

### Unique Features

**Agent can:**
✅ Shop like any customer
✅ View purchase history  
✅ Earn 20% on referred sales
✅ Track referrals in real-time
✅ View pending vs paid earnings
✅ Share promo code via multiple channels

**Admin can:**
✅ Create agents with minimal info
✅ View all agents and their stats
✅ Track agent commissions
✅ Approve/reject applications (if enabled)
✅ Deactivate agents if needed

**Customer can:**
✅ Use agent's promo code
✅ Get 20% discount on first purchase
✅ Support local agents/advocates

---

## Database Records Created

When you create agent "John Smith" with email "john@example.com":

### Agent Record
```
{
  _id: ObjectId,
  name: "John Smith",
  email: "john@example.com",
  phone: "024 123 4567",
  status: "approved",
  active: true,
  commissionRate: 20,
  totalOrders: 0,
  totalRevenue: 0,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### User Record (for login)
```
{
  _id: ObjectId,
  name: "John Smith",
  email: "john@example.com",
  phone: "024 123 4567",
  role: "agent",
  password: hashed,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Promo Record
```
{
  _id: ObjectId,
  code: "AGENT-JS-A1B2",
  discount: 20,
  discountType: "percentage",
  agentId: ObjectId (ref to Agent),
  createdBy: ObjectId (ref to Admin),
  active: true,
  firstTimeCustomersOnly: true,
  maxUses: -1 (unlimited),
  usageCount: 0,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Workflow Diagrams

### Admin Creates Agent
```
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
│  → Click "Onboard Agent" button     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Agent Onboard Form                 │
│  • Name:  John Smith                │
│  • Email: john@example.com          │
│  • Phone: 024 123 4567              │
└──────────────┬──────────────────────┘
               │ [SUBMIT]
               ▼
┌─────────────────────────────────────┐
│  Backend Processing:                │
│  ✓ Generate promo code              │
│  ✓ Create Agent record              │
│  ✓ Create User account              │
│  ✓ Create Promo record              │
│  ✓ Send welcome email               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Success Screen                     │
│  "Agent created!                    │
│   Code: AGENT-JS-A1B2"              │
└─────────────────────────────────────┘
```

### Agent Shopping & Earning
```
┌──────────────────────┐
│  Agent Login         │
│  john@example.com    │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐ ┌────────────────┐
│ Shop    │ │ Agent Portal   │
│ Browse  │ │ View Earnings  │
│ & Buy   │ │ See Referrals  │
└────┬────┘ └────────────────┘
     │
     ▼
┌──────────────────────┐
│ Checkout             │
│ Pay ₵500.00          │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌──────────┐ ┌──────────────┐
│ My Orders│ │ Agent Portal │
│ See this │ │ Earnings +   │
│ purchase │ │ 0 (own buy)  │
└──────────┘ └──────────────┘
```

### Customer Uses Agent Code
```
┌──────────────────┐
│ Customer         │
│ Adds items       │
│ Goes to checkout │
└─────────┬────────┘
          │
          ▼
┌──────────────────┐
│ Promo Code Field │
│ Enters:          │
│ AGENT-JS-A1B2    │
└─────────┬────────┘
          │ [APPLY]
          ▼
┌──────────────────────┐
│ System Checks:       │
│ ✓ Code valid        │
│ ✓ First-time buyer  │
│ ✓ Not used yet      │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Discount Applied:    │
│ Original: ₵500.00    │
│ Discount: -₵100.00   │
│ Total:    ₵400.00    │
└─────────┬────────────┘
          │ [COMPLETE PAYMENT]
          ▼
┌──────────────────────┐
│ Order Created        │
│ Commission recorded: │
│ Agent: +₵100.00      │
│ Status: pending      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Agent Dashboard      │
│ Shows new referral:  │
│ Customer: ___        │
│ Amount: ₵500         │
│ Commission: ₵100     │
│ Status: pending      │
└──────────────────────┘
```

---

## Testing Checklist

### Test 1: Create Agent
- [ ] Login as admin
- [ ] Navigate to `/admin/agents/onboard`
- [ ] Fill form with valid data
- [ ] Submit form
- [ ] See success message with promo code
- [ ] Promo code format: `AGENT-XX-YYYY`

### Test 2: Agent Login
- [ ] Go to `/login`
- [ ] Use agent's email and password
- [ ] Successfully logged in
- [ ] See agent role in header: "👤 Agent"
- [ ] Dashboard shows agent stats section

### Test 3: Agent Shopping
- [ ] Browse `/shop` as agent
- [ ] Add item to cart
- [ ] Go to checkout
- [ ] Enter payment details
- [ ] Complete order
- [ ] Order appears in Dashboard

### Test 4: View Agent Portal
- [ ] From Dashboard, click "Agent Portal" button
- [ ] See promo code displayed
- [ ] See referral list (if any)
- [ ] See earnings stats

### Test 5: Customer Uses Code
- [ ] Logout from agent account
- [ ] Create new customer account OR use different browser
- [ ] Browse products
- [ ] Add to cart and checkout
- [ ] Enter agent's promo code
- [ ] Verify 20% discount applied
- [ ] Complete payment
- [ ] Login back as agent
- [ ] Check Agent Portal for new referral

### Test 6: Admin Management
- [ ] Go to `/admin/agents`
- [ ] See list of all agents
- [ ] Filter by status
- [ ] View agent details
- [ ] See commission tracking

---

## Common Tasks

### Share Promo Code (Agent)
1. Go to Agent Portal (`/agent/dashboard`)
2. Find "Your Unique Promo Code" section
3. Click "📋 Copy Code" button
4. Share with customers via:
   - WhatsApp button (opens WhatsApp with message)
   - SMS button (opens messaging app)
   - Email button (opens email client)

### Check Earnings (Agent)
1. Dashboard or Agent Portal
2. See "Earnings" stat
3. "Paid": Money received
4. "Pending": Awaiting approval/payment

### Apply Promo Code (Customer)
1. At checkout page
2. Look for "Promo Code" field
3. Enter agent's code (e.g., `AGENT-JS-A1B2`)
4. Click "Apply" or "Verify"
5. See discount updated
6. Proceed to payment

### View Agent Orders (Admin)
1. Go to `/admin/orders`
2. Filter by customer role or agent name
3. See all orders from agent's referrals
4. Track which orders gave agent commissions

---

## Frequently Asked Questions

**Q: Can an agent have multiple promo codes?**
A: No, each agent gets exactly ONE unique code. This simplifies tracking and prevents fraud.

**Q: Can an agent use their own promo code?**
A: They can, but won't get discount (restriction: first-time customers only). Their own purchases are tracked separately.

**Q: What happens if a customer uses multiple agents' codes?**
A: Only the first agent's code applies discount (first-time only). Subsequent purchases use different discount logic.

**Q: How long do agents earn commissions?**
A: Indefinitely. As long as the agent is active and the promo code is active, they earn 20% on all referrals.

**Q: Can agents withdraw their earnings?**
A: Yes (admin-controlled). Admin approves pending earnings and processes payouts monthly.

**Q: What if an agent wants to buy items without discount?**
A: They can proceed without entering any promo code. Their order still counts as "their own" purchase.

**Q: Can commissions be reversed?**
A: Yes, if order is cancelled/refunded, commission is reversed (pending implementation).

**Q: How do agents know if a customer used their code?**
A: Agent Portal shows referral list with customer details, order amount, and commission status in real-time.

---

## Technical Details

### API Endpoints Used

**Create Agent:**
```
POST /agents
Headers: Authorization: Bearer {token}
Body: {
  name: string,
  email: string,
  phone: string
}
Response: {
  agent: {...},
  promoCode: "AGENT-XX-YYYY",
  message: "Agent created successfully"
}
```

**Get Agent List:**
```
GET /agents
Headers: Authorization: Bearer {token}
Query: ?status=approved
Response: [...]
```

**Get Agent Details:**
```
GET /agents/{id}
Headers: Authorization: Bearer {token}
Response: {...}
```

**Get Promo Code:**
```
GET /promos?code=AGENT-JS-A1B2
Response: {
  code: "AGENT-JS-A1B2",
  agentId: "...",
  discount: 20,
  discountType: "percentage"
}
```

---

## Next Steps

1. **Test the system** using the testing checklist
2. **Implement payment discounts** (backend integration)
3. **Add commission tracking** to payment processor
4. **Enable payouts** (admin approval flow)
5. **Add analytics** (agent performance dashboard)
6. **Mobile optimization** (responsive design)

---

**Last Updated:** January 2026
**Version:** 1.0 - Simplified MVP
