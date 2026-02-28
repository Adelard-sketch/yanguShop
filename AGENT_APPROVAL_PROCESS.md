# Agent Approval Process - Updated

## Agent Creation Flow (Admin)

### Step 1: Access Agent Onboarding
- **URL**: `/admin/agents/onboard`
- **Requirement**: Admin login only

### Step 2: Fill Agent Information Form

Now collects **5 fields**:

1. **Agent Name*** (Required)
   - Example: John Smith
   - Text input
   
2. **Email Address*** (Required)
   - Example: john@example.com
   - Unique email validation
   
3. **Phone Number*** (Required)
   - Example: 024 123 4567
   - Telephone format

4. **Address** (Optional)
   - Example: 123 Main Street, Accra, Greater Accra
   - Street address, city, region
   - Displayed in agent card and approval modal

5. **WhatsApp Number** (Optional)
   - Example: +233 XX XXX XXXX
   - Can include country code
   - Makes it easy to contact agent via WhatsApp
   - Defaults to phone number if not provided

### Step 3: System Processing

When admin submits the form, the system:

1. **Validates** required fields (name, email, phone)
2. **Checks** email uniqueness in both Agent and User collections
3. **Generates** unique promo code: `AGENT-XX-YYYY`
4. **Creates** Agent record with:
   - name, email, phone, address, whatsapp
   - status: `approved` (immediately active)
   - commissionRate: `20%`
   - active: `true`
5. **Creates** User record with:
   - Same name, email, phone
   - role: `agent`
   - Can login with email/password
6. **Creates** Promo record with:
   - Unique code linked to agent
   - 20% discount for first-time customers
   - Unlimited uses
7. **Sends** welcome email with:
   - Promo code
   - Contact information
   - Login link

### Step 4: Confirmation

Admin sees:
- Success message with generated promo code
- Example: "Agent created! Promo code: AGENT-JS-A1B2"
- Automatic redirect to agents list

---

## Agent Approval & Management

### View All Agents

**URL**: `/admin/agents`

Admin can see:
- All agents in a grid/card layout
- Filter by status: All, Pending, Approved, Rejected
- Quick info on each agent card:
  - Name & Status badge
  - Email
  - Phone
  - **WhatsApp** (NEW)
  - **Address** (NEW)
  - City
  - Commission rate (if approved)

### Agent Card Display

Each agent card shows:
```
┌─────────────────────────────┐
│ John Smith    [Approved]    │
├─────────────────────────────┤
│ Email: john@example.com     │
│ Phone: 024 123 4567         │
│ WhatsApp: +233 24 123 4567  │ ← NEW
│ Address: 123 Main St, Accra │ ← NEW
│ City: Accra                 │
│ Commission: 20%             │
├─────────────────────────────┤
│ [Review Application]        │
└─────────────────────────────┘
```

### Review Agent Application

**Trigger**: Click "Review Application" on agent card

**Modal Shows**:

#### Personal Information Section
- **Name**: John Smith
- **Email**: john@example.com
- **Phone**: 024 123 4567
- **WhatsApp**: +233 24 123 4567 (clickable link to open WhatsApp)
- **Address**: 123 Main Street, Accra, Greater Accra

#### Business Information Section
- Business Name
- City
- State
- Business Registration

#### Decision Section
Admin can:
- ✅ **Approve** agent
- ❌ **Reject** agent with reason
- 📝 Add notes

### Agent Actions

After agent is approved or rejected:
- Status badge updates immediately
- Agent can login if approved
- Agents list refreshes to show new status

---

## Contact Information Features

### WhatsApp Integration

When approving an agent, the WhatsApp field contains:
- Phone number in WhatsApp-compatible format
- Clickable link: `https://wa.me/{number}`
- Example: `https://wa.me/233241234567`

**Use Case**: Admin can quickly reach agent via WhatsApp for:
- Verification
- Support
- Commission clarification
- Account issues

### Address Usage

Address field enables:
- **Agent Location Visibility**: Customers see where agent operates
- **Regional Organization**: Filter agents by location
- **Delivery Coordination**: Customers know approximate location
- **Support Purposes**: Admin knows how to reach agent

---

## Agent Record Structure (Database)

```javascript
{
  _id: ObjectId,
  name: "John Smith",
  email: "john@example.com",
  phone: "024 123 4567",
  whatsapp: "+233 24 123 4567",        // NEW
  address: "123 Main St, Accra",       // NEW
  city: "Accra",
  state: "Greater Accra",
  status: "approved",
  active: true,
  commissionRate: 20,
  totalOrders: 0,
  totalRevenue: 0,
  // ... other fields
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Updated Forms & Validation

### AgentOnboard Form (Frontend)

```jsx
Form Fields:
✓ Agent Name (required)
✓ Email Address (required)
✓ Phone Number (required)
✓ Address (optional)
✓ WhatsApp Number (optional)

Validation:
- Name, email, phone must be filled
- Email must be unique
- Phone must be valid format
- WhatsApp defaults to phone if empty
```

### API Request

```javascript
POST /agents
Body: {
  name: "John Smith",
  email: "john@example.com",
  phone: "024 123 4567",
  address: "123 Main Street, Accra",
  whatsapp: "+233 24 123 4567"
}

Response: {
  agent: { ...agent details },
  promoCode: "AGENT-JS-A1B2",
  message: "Agent created successfully"
}
```

---

## Admin Workflow - Step by Step

### Complete Agent Approval Process

```
1. Admin goes to /admin/agents/onboard
                    ↓
2. Fills 5-field form:
   - Name, Email, Phone (required)
   - Address, WhatsApp (optional)
                    ↓
3. Click "Create Agent"
                    ↓
4. Backend generates promo code:
   - Creates Agent record (approved immediately)
   - Creates User account for login
   - Creates Promo record
   - Sends welcome email
                    ↓
5. Success! Redirects to agents list
                    ↓
6. Admin can now see:
   - Agent in "Approved" filter
   - All contact info displayed
   - WhatsApp clickable link
   - Address visible
                    ↓
7. Can click "Review Application" anytime
   to see full details or update status
```

---

## Contact Methods for Agents

Admin can now contact agents via:

1. **WhatsApp** (if provided)
   - Click WhatsApp number in approval modal
   - Opens WhatsApp Web or app
   - Quick messaging for urgent matters

2. **Email** (always provided)
   - From agent record
   - Professional communication
   - Documentation

3. **Phone** (always provided)
   - Direct call for emergencies
   - Verbal verification

4. **Address** (if provided)
   - Physical verification
   - In-person meetings if needed
   - Regional coordination

---

## Security & Verification

### Data Collected for Approval

The expanded form now collects:
- ✅ Identity (name, email, phone)
- ✅ Location (address)
- ✅ Direct Contact (WhatsApp)

Benefits:
- **Better Verification**: Can verify agent legitimacy
- **Direct Communication**: Multiple contact methods
- **Location Tracking**: Know where agents operate
- **Regional Management**: Organize by location

### Privacy Considerations

- Address: Optional (not required)
- WhatsApp: Optional (defaults to phone)
- All contact info secured in database
- Only visible to admin users
- Protected by authentication

---

## Testing the New Features

### Test: Create Agent with All Fields

1. Login as admin
2. Go to `/admin/agents/onboard`
3. Fill form:
   - Name: John Smith
   - Email: john@example.com
   - Phone: 024 123 4567
   - Address: 123 Main Street, Accra
   - WhatsApp: +233 24 123 4567
4. Click "Create Agent"
5. See success message
6. Redirect to agents list

### Test: Review Agent with New Info

1. Go to `/admin/agents`
2. Find newly created agent card
3. See address & WhatsApp displayed
4. Click "Review Application"
5. Modal shows all 5 fields
6. WhatsApp number is clickable link

### Test: WhatsApp Integration

1. In approval modal, click WhatsApp link
2. Should open WhatsApp with agent
3. Can send message directly

---

## Files Modified

1. **Frontend**:
   - `/frontend/src/pages/AgentOnboard.jsx` - Added address & whatsapp fields
   - `/frontend/src/pages/AdminAgents.jsx` - Display new fields in card & modal

2. **Backend**:
   - `/backend/src/controllers/agent.controller.js` - Accept & store new fields
   - `/backend/src/models/Agent.js` - Added whatsapp field

3. **No Changes Required**:
   - Routes (existing endpoints work)
   - Services (use same API)
   - Existing agents (backward compatible)

---

## Migration Note

Existing agents in database:
- `address` field already exists (value: null/empty)
- `whatsapp` field newly added (value: null for existing agents)
- **No data loss** - Just adds new optional field
- Can update existing agents to add WhatsApp/address

---

## Future Enhancements

1. **Bulk SMS/WhatsApp**: Contact multiple agents at once
2. **Agent Map View**: Show agents by location
3. **Verified Badge**: Mark verified agents with special badge
4. **Location-Based Search**: Customers find agents near them
5. **Agent Profiles**: Public profiles with agent info & reviews

---

**Version**: 2.0 (With Contact Information)
**Date**: January 2026
**Status**: Ready for Testing
