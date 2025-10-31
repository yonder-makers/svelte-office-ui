# Holiday Request System - Migration to Svelte

## Executive Summary

This document outlines the complete migration strategy for the YonderOffice Holiday Request system from Progress 4GL/Quarix framework to a modern Svelte-based application.

**Current System:** Progress OpenEdge 4GL + Quarix framework + JavaScript
**Target System:** SvelteKit + REST API (with flexible backend options)

---

## Table of Contents

1. [System Analysis](#system-analysis)
2. [Migration Strategy](#migration-strategy)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Phases](#implementation-phases)
5. [Code Examples](#code-examples)
6. [Data Migration](#data-migration)
7. [Testing Strategy](#testing-strategy)
8. [Rollout Plan](#rollout-plan)
9. [Risks & Mitigation](#risks--mitigation)

---

## System Analysis

### Current Holiday Request System

#### Files Involved

**Database Schema:**
- `database/relation.df` - Main database definitions
  - `Holiday` table - Primary holiday requests table
  - `Holiday-hist` table - Annual entitlement history
  - `Legal-holiday` table - National holidays
  - `Employee` table - Employee master data

**Server-Side Business Logic (Progress ABL):**
- `office/main/server/dtHoliday.cls` - Core holiday request business logic
- `office/main/server/dtHolidayForecast.cls` - Holiday forecasting
- `office/main/server/dtremHol.cls` - Remaining holiday calculations
- `office/main/server/empnacc.cls` - Employee account management
- `office/ext1/server/Util.cls` - Email utility for notifications

**Client-Side UI:**
- `office/main/client/wHolidayRequest.xml` - Main UI template
- `office/main/client/wHolidayRequest.cls` - Generated UI class
- `js/office.js` - Client-side JavaScript functions

### Database Schema Structure

#### Primary Table: `Holiday`

| Field | Type | Description |
|-------|------|-------------|
| `code` | CHARACTER(3) | Employee code (FK to Employee) |
| `req_dat` | DATE | Request submission date |
| `st_dat` | DATE | Holiday start date |
| `end_dat` | DATE | Holiday end date |
| `days` | DECIMAL | Number of days (0.5, 1, 1.5, etc.) |
| `typ` | INTEGER | Type: 1=Paid, 2=Compensation, 3=Not Paid, 4=Legal |
| `adv` | LOGICAL | Supervisor advice (yes/no/?) |
| `dec` | LOGICAL | Manager decision (yes/no/?) |
| `dsc` | CHARACTER(50) | Description/reason |
| `day_t` | LOGICAL | Day type (AM=yes, PM=no) for half-days |
| `mod_dat` | DATE | Last modification date |
| `mod_usr` | CHARACTER(8) | Last modification user |

**Indexes:**
- `code-st-end-typPr` (UNIQUE) - Primary index
- `code-adv` - Filtering by employee and advice
- `code-adv-dec` - Workflow queries
- `code-dec` - Decision filtering
- `st_dat-end_dat` - Date range queries

#### Supporting Tables

**`Holiday-hist`** - Tracks annual entitlement changes
- `code`, `dat`, `days`, `dsc`, `mod_dat`, `mod_usr`

**`Legal-holiday`** - National holidays
- `day#`, `month#`, `dsc`

**`Employee`** (relevant fields)
- `code`, `sup_code`, `ho_days`, `in-mail`, `nam`, `frst_nam`

### Business Rules & Validation

#### Core Validation Rules (from `dtHoliday.cls`)

1. **Date Validation:**
   - Start date required
   - End date required
   - End date >= start date
   - Cannot overlap with legal holidays (must split request)

2. **Days Validation:**
   - Required field
   - Minimum: 0.5 days
   - For < 1 day: Only 0.5 allowed
   - For >= 1 day: Must be integer
   - Must match timeline between dates (excluding weekends)
   - Weekends (Saturday=7, Sunday=1) NOT counted

3. **Remaining Holiday Check:**
   - For Paid holidays (typ=1): Validate against remaining balance
   - `remaining = ho_days - GetUsedDays()`
   - `GetUsedDays()` counts approved paid holidays where `dec <> NO`

4. **Overlap Detection:**
   - **Special case:** Can combine 0.5 day Paid + 0.5 day Compensation on same date
   - **Block:** Cannot request > 0.5 day if 0.5 day exists for same period
   - Checks four overlap scenarios:
     - New request starts during existing holiday
     - New request ends during existing holiday
     - New request within existing holiday
     - New request encompasses existing holiday

5. **Modification Restrictions:**
   - Cannot modify approved requests (`dec = YES`)
   - Cannot delete approved requests
   - Error: "This holiday request has already been approved! You cannot modify it..."

### Approval Workflow

**Two-Stage Process:**

1. **Supervisor Advice (`adv` field)**
   - Initial state: `?` (pending)
   - Direct supervisor provides advice
   - Values: YES/NO/?

2. **Manager Decision (`dec` field)**
   - Initial state: `?` (pending)
   - Top-level manager makes final decision
   - Values: YES/NO/?

**Auto-Approval:**
```
IF requester IS supervisor AND days <= 1 THEN
   adv = YES
   dec = YES
END
```

**Email Notifications:**
- Sent to supervisor after submission
- From: MailFrom.App@tss-yonder.com
- Subject: "YonderOffice: Holiday request"
- Content: "{Employee Name} {count} holiday request(s) - waiting for your advice"

### Holiday Types

| Type | Code | Description | Rules |
|------|------|-------------|-------|
| **Paid** | 1 | Standard annual leave | Deducted from balance; requires approval |
| **Compensation** | 2 | Time off for overtime | Not deducted; can combine 0.5 with Paid |
| **Not Paid** | 3 | Unpaid leave | Not deducted; requires approval |
| **Legal** | 4 | National holidays | System-managed; cannot overlap |

### Integration Points

**Direct Dependencies:**
- Employee management system (hierarchy via `sup_code`)
- Email system (notifications)
- Calendar system (weekday calculations, legal holidays)

**Indirect Dependencies:**
- Time registration system (`dtTimeReg.cls`)
- Hours tracking (`dthours_wkex.cls`, `Worked-hours` table)
- Project assignments (affects availability)

---

## Migration Strategy

### Recommended Tech Stack

#### Frontend
- **SvelteKit** - Full-stack framework with SSR
- **Tailwind CSS** or **Skeleton UI** - Modern styling
- **date-fns** or **Day.js** - Date manipulation
- **Zod** - Schema validation (client & server)
- **Tanstack Table** (Svelte) - Data grid

#### Backend Options

**Option 1: Hybrid Approach (RECOMMENDED for Phase 1)**
- Keep Progress backend
- Create REST API layer using **PASOE** (Progress Application Server for OpenEdge)
- Svelte frontend calls Progress REST services

**Pros:**
- ✅ Preserve business logic
- ✅ Gradual migration
- ✅ Lower risk
- ✅ Faster time-to-market

**Cons:**
- ❌ Still requires Progress expertise
- ❌ Progress licensing costs continue

**Option 2: Full Rewrite**
- **Node.js + Express/Fastify** OR **Python + FastAPI**
- **PostgreSQL** database
- Rewrite all business logic

**Pros:**
- ✅ Modern stack
- ✅ Easier to hire developers
- ✅ Lower long-term costs

**Cons:**
- ❌ Must rewrite all business logic
- ❌ Higher risk
- ❌ Longer development time

**Recommendation:** Start with **Option 1** (hybrid), then gradually migrate to **Option 2**.

---

## Technical Architecture

### REST API Design

#### Endpoints

```
# Holiday Requests
GET    /api/holidays                    # List with filters
GET    /api/holidays/:id                # Get single request
POST   /api/holidays                    # Create new request
PUT    /api/holidays/:id                # Update request
DELETE /api/holidays/:id                # Delete request

# Employee Info
GET    /api/employees/me                # Current user info + ho_days
GET    /api/employees/me/remaining      # Remaining holiday days

# Lookups
GET    /api/legal-holidays              # List of legal holidays
GET    /api/holiday-types               # List of types (Paid/Comp/etc.)

# Approval (for managers)
PUT    /api/holidays/:id/advice         # Set supervisor advice
PUT    /api/holidays/:id/decision       # Set final decision

# Forecasting
GET    /api/holidays/forecast           # Holiday forecast view
```

#### Example API Response

```json
{
  "id": 123,
  "employeeCode": "001",
  "employeeName": "John Doe",
  "requestDate": "2024-01-15",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "days": 5,
  "type": 1,
  "typeName": "Paid",
  "isAM": true,
  "description": "Family vacation",
  "supervisorAdvice": "YES",
  "managerDecision": "?",
  "status": "pending_decision",
  "canModify": false,
  "canDelete": false,
  "modifiedDate": "2024-01-15T10:30:00Z",
  "modifiedBy": "001"
}
```

### Svelte Project Structure

```
sveltekit-app/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── HolidayRequestForm.svelte
│   │   │   ├── HolidayRequestList.svelte
│   │   │   ├── HolidayCalendar.svelte
│   │   │   ├── RemainingDaysWidget.svelte
│   │   │   ├── DateRangePicker.svelte
│   │   │   └── ApprovalPanel.svelte
│   │   ├── stores/
│   │   │   ├── user.ts              # Current user store
│   │   │   ├── holidays.ts          # Holiday requests store
│   │   │   └── legalHolidays.ts     # Legal holidays cache
│   │   ├── api/
│   │   │   └── client.ts            # API client wrapper
│   │   ├── validation/
│   │   │   └── holiday.ts           # Zod schemas + validation
│   │   └── utils/
│   │       ├── dateUtils.ts         # Weekend/legal holiday checks
│   │       └── holidayCalculations.ts
│   └── routes/
│       ├── +layout.svelte           # Main layout with auth
│       ├── +page.svelte             # Dashboard
│       ├── holidays/
│       │   ├── +page.svelte         # List view
│       │   ├── +page.server.ts      # Server-side data loading
│       │   ├── new/
│       │   │   └── +page.svelte     # Create new request
│       │   └── [id]/
│       │       ├── +page.svelte     # Edit existing
│       │       └── +page.server.ts  # Load request data
│       └── approvals/               # For managers
│           ├── +page.svelte         # Approval dashboard
│           └── +page.server.ts
├── static/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Implementation Phases

### Phase 1: API Layer (2-3 weeks)

#### Tasks:
1. Set up PASOE (Progress Application Server for OpenEdge)
2. Create REST API endpoints
3. Expose existing business logic via JSON
4. Implement authentication/authorization
5. Test API endpoints

#### Progress REST Service Example:

```progress
/* holidayService.p */
DEFINE VARIABLE oRequest   AS Progress.Json.ObjectModel.JsonObject NO-UNDO.
DEFINE VARIABLE oResponse  AS Progress.Json.ObjectModel.JsonObject NO-UNDO.
DEFINE VARIABLE cMethod    AS CHARACTER NO-UNDO.
DEFINE VARIABLE cPath      AS CHARACTER NO-UNDO.

/* Parse HTTP request */
RUN getRequestInfo(OUTPUT cMethod, OUTPUT cPath, OUTPUT oRequest).

CASE cMethod:
    WHEN "GET" THEN DO:
        IF cPath = "/holidays" THEN
            RUN getHolidays(INPUT oRequest, OUTPUT oResponse).
        ELSE IF cPath BEGINS "/holidays/" THEN
            RUN getHoliday(INPUT ENTRY(3, cPath, "/"), OUTPUT oResponse).
    END.

    WHEN "POST" THEN DO:
        IF cPath = "/holidays" THEN
            RUN createHoliday(INPUT oRequest, OUTPUT oResponse).
    END.

    WHEN "PUT" THEN DO:
        IF cPath BEGINS "/holidays/" THEN
            RUN updateHoliday(INPUT ENTRY(3, cPath, "/"), INPUT oRequest, OUTPUT oResponse).
    END.

    WHEN "DELETE" THEN DO:
        IF cPath BEGINS "/holidays/" THEN
            RUN deleteHoliday(INPUT ENTRY(3, cPath, "/"), OUTPUT oResponse).
    END.
END CASE.

/* Send JSON response */
RUN sendResponse(INPUT oResponse).

/* Implement CRUD procedures using existing dtHoliday.cls */
PROCEDURE createHoliday:
    DEFINE INPUT  PARAMETER ipRequest  AS JsonObject NO-UNDO.
    DEFINE OUTPUT PARAMETER opResponse AS JsonObject NO-UNDO.

    DEFINE VARIABLE oHoliday AS main.server.dtHoliday NO-UNDO.

    oHoliday = NEW main.server.dtHoliday().

    /* Map JSON to temp-table and call existing business logic */
    RUN oHoliday:createHolidayRequest(
        INPUT ipRequest:GetCharacter("employeeCode"),
        INPUT DATE(ipRequest:GetCharacter("startDate")),
        INPUT DATE(ipRequest:GetCharacter("endDate")),
        INPUT ipRequest:GetDecimal("days"),
        INPUT ipRequest:GetInteger("type"),
        INPUT ipRequest:GetCharacter("description")
    ).

    /* Return success response */
    opResponse = NEW JsonObject().
    opResponse:Add("success", TRUE).
    opResponse:Add("message", "Holiday request created successfully").
END PROCEDURE.
```

### Phase 2: Svelte Frontend (4-6 weeks)

#### Week 1-2: Project Setup & Core Components
- Initialize SvelteKit project
- Set up Tailwind CSS / Skeleton UI
- Configure TypeScript, Zod, date-fns
- Build API client wrapper
- Create base layout and navigation

#### Week 3-4: Main Features
- Holiday request form
- Holiday request list/browse
- Remaining days widget
- Date validation logic
- Approval workflow UI

#### Week 5: Advanced Features
- Calendar view
- Forecast view
- Email integration
- Error handling
- Loading states

#### Week 6: Polish & Testing
- Responsive design
- Accessibility (ARIA labels, keyboard nav)
- User testing
- Bug fixes

### Phase 3: Business Logic Migration (3-4 weeks, if full rewrite)

Only needed if choosing Option 2 (full rewrite). Tasks:
1. Set up PostgreSQL database
2. Design new schema
3. Rewrite validation logic in TypeScript
4. Implement approval workflow
5. Build email notification service
6. Create background jobs (if needed)

### Phase 4: Data Migration (1 week)

Tasks:
1. Export data from Progress
2. Transform data format
3. Import to new system
4. Validate data integrity
5. Test with real data

### Phase 5: Testing & QA (2 weeks)

Tasks:
1. Unit tests for validation logic
2. Component tests
3. Integration tests
4. E2E tests
5. Performance testing
6. Security testing

### Phase 6: Deployment & Rollout (2 weeks)

Tasks:
1. User acceptance testing (UAT)
2. Parallel run (both systems)
3. Training materials
4. Gradual rollout
5. Monitoring & support

---

## Code Examples

### 1. Database Schema (PostgreSQL)

```sql
-- Employees table
CREATE TABLE employees (
  code VARCHAR(3) PRIMARY KEY,
  first_name VARCHAR(16),
  last_name VARCHAR(40),
  email VARCHAR(30),
  supervisor_code VARCHAR(3) REFERENCES employees(code),
  annual_holidays DECIMAL(4,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Holiday requests table
CREATE TABLE holiday_requests (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(3) NOT NULL REFERENCES employees(code),
  request_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(3,1) NOT NULL CHECK (days >= 0.5),
  holiday_type INTEGER NOT NULL CHECK (holiday_type IN (1,2,3,4)),
  is_am BOOLEAN DEFAULT TRUE,
  description VARCHAR(50) NOT NULL,
  supervisor_advice VARCHAR(3) DEFAULT '?',
  manager_decision VARCHAR(3) DEFAULT '?',
  modified_date TIMESTAMP DEFAULT NOW(),
  modified_by VARCHAR(8),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (employee_code, start_date, end_date, holiday_type)
);

CREATE INDEX idx_holiday_employee ON holiday_requests(employee_code);
CREATE INDEX idx_holiday_dates ON holiday_requests(start_date, end_date);
CREATE INDEX idx_holiday_approval ON holiday_requests(supervisor_advice, manager_decision);
CREATE INDEX idx_holiday_status ON holiday_requests(employee_code, supervisor_advice, manager_decision);

-- Legal holidays table
CREATE TABLE legal_holidays (
  id SERIAL PRIMARY KEY,
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 31),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  description VARCHAR(60) NOT NULL,
  UNIQUE (day, month)
);

-- Holiday history table
CREATE TABLE holiday_history (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(3) NOT NULL REFERENCES employees(code),
  change_date DATE NOT NULL,
  new_days DECIMAL(4,2) NOT NULL,
  reason VARCHAR(255),
  modified_by VARCHAR(8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_holiday_history_employee ON holiday_history(employee_code);
CREATE INDEX idx_holiday_history_date ON holiday_history(change_date);
```

### 2. Validation Schema (TypeScript/Zod)

```typescript
// lib/validation/holiday.ts
import { z } from 'zod';

export const holidayRequestSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  days: z.number()
    .min(0.5, 'Minimum 0.5 days')
    .refine(
      val => val < 1 ? val === 0.5 : val % 1 === 0,
      'Days must be 0.5 or whole numbers'
    ),
  type: z.enum(['1', '2', '3', '4'], {
    errorMap: () => ({ message: 'Invalid holiday type' })
  }),
  isAM: z.boolean().default(true),
  description: z.string()
    .min(1, 'Description is required')
    .max(50, 'Description must be 50 characters or less'),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

export type HolidayRequest = z.infer<typeof holidayRequestSchema>;

// Business rules validation
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export async function validateHolidayRequest(
  request: HolidayRequest,
  employeeCode: string,
  existingRequests: HolidayRequest[]
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check weekend days
  const weekendDays = countWeekendDays(request.startDate, request.endDate);
  if (weekendDays > 0) {
    warnings.push(`Period includes ${weekendDays} weekend day(s) - they are not counted`);
  }

  // Check legal holidays
  const legalHolidays = await getLegalHolidays();
  if (overlapsLegalHoliday(request, legalHolidays)) {
    errors.push('Period overlaps with legal holiday - please split your request');
  }

  // Check overlapping requests
  const overlap = findOverlappingRequest(request, existingRequests);
  if (overlap) {
    // Special case: 0.5 Paid + 0.5 Comp on same day is allowed
    if (!isAllowedOverlap(request, overlap)) {
      errors.push('Request overlaps with existing holiday request');
    }
  }

  // Check remaining days for paid holidays
  if (request.type === '1') { // Paid
    const remaining = await getRemainingHolidays(employeeCode);
    if (request.days > remaining) {
      errors.push(`Insufficient remaining days. Available: ${remaining.toFixed(1)}, Requested: ${request.days}`);
    }
  }

  // Validate days match timeline
  const calculatedDays = countWorkingDays(request.startDate, request.endDate);
  if (Math.abs(calculatedDays - request.days) > 0.1) {
    warnings.push(`Calculated ${calculatedDays} working days, but ${request.days} entered`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function isAllowedOverlap(
  newRequest: HolidayRequest,
  existingRequest: HolidayRequest
): boolean {
  // Allow 0.5 day Paid + 0.5 day Compensation on same date
  return (
    newRequest.days === 0.5 &&
    existingRequest.days === 0.5 &&
    newRequest.startDate.getTime() === existingRequest.startDate.getTime() &&
    newRequest.endDate.getTime() === existingRequest.endDate.getTime() &&
    (
      (newRequest.type === '1' && existingRequest.type === '2') ||
      (newRequest.type === '2' && existingRequest.type === '1')
    )
  );
}
```

### 3. Date Utilities

```typescript
// lib/utils/dateUtils.ts
import {
  format,
  eachDayOfInterval,
  getDay,
  isWeekend as isFnsWeekend,
  addDays,
  startOfYear,
  endOfYear
} from 'date-fns';

export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday or Saturday
}

export function countWorkingDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
}

export function countWeekendDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => isWeekend(day)).length;
}

export function isLegalHoliday(
  date: Date,
  legalHolidays: LegalHoliday[]
): boolean {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return legalHolidays.some(h => h.day === day && h.month === month);
}

export function overlapsLegalHoliday(
  request: { startDate: Date; endDate: Date },
  legalHolidays: LegalHoliday[]
): boolean {
  const days = eachDayOfInterval({
    start: request.startDate,
    end: request.endDate
  });
  return days.some(day => isLegalHoliday(day, legalHolidays));
}

export function findOverlappingRequest(
  newRequest: { startDate: Date; endDate: Date },
  existingRequests: Array<{ startDate: Date; endDate: Date }>
): typeof existingRequests[0] | null {
  for (const existing of existingRequests) {
    // Check four overlap scenarios:
    // 1. New starts during existing
    if (newRequest.startDate >= existing.startDate &&
        newRequest.startDate <= existing.endDate) {
      return existing;
    }
    // 2. New ends during existing
    if (newRequest.endDate >= existing.startDate &&
        newRequest.endDate <= existing.endDate) {
      return existing;
    }
    // 3. New encompasses existing
    if (newRequest.startDate <= existing.startDate &&
        newRequest.endDate >= existing.endDate) {
      return existing;
    }
    // 4. New within existing (already covered by 1 and 2)
  }
  return null;
}

export function getYearDateRange() {
  const now = new Date();
  return {
    start: startOfYear(now),
    end: endOfYear(now)
  };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function getWeekdayName(date: Date): string {
  return format(date, 'EEEE');
}

export interface LegalHoliday {
  day: number;
  month: number;
  description: string;
}
```

### 4. API Client

```typescript
// lib/api/client.ts
import type { HolidayRequest, HolidayResponse } from '$lib/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'API request failed',
      response.status,
      error
    );
  }

  return response.json();
}

export const holidayApi = {
  // List holidays with filters
  list: async (filters?: {
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
  }): Promise<HolidayResponse[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<HolidayResponse[]>(`/holidays${query}`);
  },

  // Get single holiday
  get: async (id: number): Promise<HolidayResponse> => {
    return request<HolidayResponse>(`/holidays/${id}`);
  },

  // Create new holiday request
  create: async (data: HolidayRequest): Promise<HolidayResponse> => {
    return request<HolidayResponse>('/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update holiday request
  update: async (id: number, data: Partial<HolidayRequest>): Promise<HolidayResponse> => {
    return request<HolidayResponse>(`/holidays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete holiday request
  delete: async (id: number): Promise<void> => {
    return request<void>(`/holidays/${id}`, {
      method: 'DELETE',
    });
  },

  // Set supervisor advice
  setAdvice: async (id: number, advice: 'YES' | 'NO' | '?'): Promise<HolidayResponse> => {
    return request<HolidayResponse>(`/holidays/${id}/advice`, {
      method: 'PUT',
      body: JSON.stringify({ advice }),
    });
  },

  // Set manager decision
  setDecision: async (id: number, decision: 'YES' | 'NO' | '?'): Promise<HolidayResponse> => {
    return request<HolidayResponse>(`/holidays/${id}/decision`, {
      method: 'PUT',
      body: JSON.stringify({ decision }),
    });
  },
};

export const employeeApi = {
  // Get current user info
  me: async () => {
    return request<{
      code: string;
      firstName: string;
      lastName: string;
      email: string;
      supervisorCode: string;
      annualHolidays: number;
    }>('/employees/me');
  },

  // Get remaining holidays
  remaining: async () => {
    return request<{
      total: number;
      used: number;
      remaining: number;
      pending: number;
    }>('/employees/me/remaining');
  },
};

export const lookupApi = {
  // Get legal holidays
  legalHolidays: async () => {
    return request<Array<{ day: number; month: number; description: string }>>('/legal-holidays');
  },

  // Get holiday types
  holidayTypes: async () => {
    return request<Array<{ code: number; name: string; description: string }>>('/holiday-types');
  },
};

export { ApiError };
```

### 5. Svelte Components

#### Holiday Request Form

```svelte
<!-- lib/components/HolidayRequestForm.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { holidayRequestSchema } from '$lib/validation/holiday';
  import { countWorkingDays, getWeekdayName } from '$lib/utils/dateUtils';
  import { holidayApi } from '$lib/api/client';
  import type { HolidayRequest } from '$lib/types';

  export let initialData: HolidayRequest | null = null;
  export let mode: 'create' | 'edit' = 'create';

  let startDate: string = '';
  let endDate: string = '';
  let days: number = 1;
  let type: '1' | '2' | '3' | '4' = '1';
  let isAM: boolean = true;
  let description: string = '';
  let errors: Record<string, string> = {};
  let isSubmitting = false;

  const dispatch = createEventDispatcher();

  $: showHalfDaySelector = days === 0.5;
  $: calculatedDays = startDate && endDate
    ? countWorkingDays(new Date(startDate), new Date(endDate))
    : 0;
  $: startWeekday = startDate ? getWeekdayName(new Date(startDate)) : '';
  $: endWeekday = endDate ? getWeekdayName(new Date(endDate)) : '';

  // Auto-calculate days when dates change
  $: if (startDate && endDate && !days) {
    days = calculatedDays;
  }

  async function handleSubmit() {
    errors = {};
    isSubmitting = true;

    try {
      // Validate with Zod
      const result = holidayRequestSchema.safeParse({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        type,
        isAM,
        description
      });

      if (!result.success) {
        errors = formatZodErrors(result.error);
        return;
      }

      // Submit to API
      const response = mode === 'create'
        ? await holidayApi.create(result.data)
        : await holidayApi.update(initialData!.id, result.data);

      dispatch('success', response);
    } catch (error) {
      if (error instanceof ApiError) {
        errors.submit = error.message;
      } else {
        errors.submit = 'An unexpected error occurred';
      }
    } finally {
      isSubmitting = false;
    }
  }

  function formatZodErrors(error: any): Record<string, string> {
    const formatted: Record<string, string> = {};
    error.issues.forEach((issue: any) => {
      const path = issue.path.join('.');
      formatted[path] = issue.message;
    });
    return formatted;
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div class="grid grid-cols-2 gap-4">
    <div class="form-group">
      <label for="startDate" class="block text-sm font-medium mb-1">
        Start Date
      </label>
      <input
        type="date"
        id="startDate"
        bind:value={startDate}
        class="input"
        class:error={errors.startDate}
        required
      />
      {#if startWeekday}
        <span class="text-xs text-gray-600">{startWeekday}</span>
      {/if}
      {#if errors.startDate}
        <span class="error-message">{errors.startDate}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="endDate" class="block text-sm font-medium mb-1">
        End Date
      </label>
      <input
        type="date"
        id="endDate"
        bind:value={endDate}
        min={startDate}
        class="input"
        class:error={errors.endDate}
        required
      />
      {#if endWeekday}
        <span class="text-xs text-gray-600">{endWeekday}</span>
      {/if}
      {#if errors.endDate}
        <span class="error-message">{errors.endDate}</span>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label class="block text-sm font-medium mb-2">Holiday Type</label>
    <div class="flex gap-4">
      <label class="flex items-center">
        <input type="radio" bind:group={type} value="1" class="mr-2" />
        Paid
      </label>
      <label class="flex items-center">
        <input type="radio" bind:group={type} value="2" class="mr-2" />
        Compensation
      </label>
      <label class="flex items-center">
        <input type="radio" bind:group={type} value="3" class="mr-2" />
        Not Paid
      </label>
    </div>
  </div>

  <div class="form-group">
    <label for="days" class="block text-sm font-medium mb-1">
      Number of Days
    </label>
    <input
      type="number"
      id="days"
      bind:value={days}
      step="0.5"
      min="0.5"
      class="input w-32"
      class:error={errors.days}
      required
    />
    {#if calculatedDays}
      <span class="text-xs text-gray-600 ml-2">
        (Calculated: {calculatedDays} working days)
      </span>
    {/if}
    {#if errors.days}
      <span class="error-message">{errors.days}</span>
    {/if}
  </div>

  {#if showHalfDaySelector}
    <div class="form-group">
      <label class="block text-sm font-medium mb-2">Half Day</label>
      <div class="flex gap-4">
        <label class="flex items-center">
          <input type="radio" bind:group={isAM} value={true} class="mr-2" />
          Morning (AM)
        </label>
        <label class="flex items-center">
          <input type="radio" bind:group={isAM} value={false} class="mr-2" />
          Afternoon (PM)
        </label>
      </div>
    </div>
  {/if}

  <div class="form-group">
    <label for="description" class="block text-sm font-medium mb-1">
      Description <span class="text-red-500">*</span>
    </label>
    <textarea
      id="description"
      bind:value={description}
      maxlength="50"
      rows="3"
      class="input w-full"
      class:error={errors.description}
      placeholder="Reason for holiday request..."
      required
    />
    <div class="flex justify-between text-xs text-gray-600">
      <span>
        {#if errors.description}
          <span class="error-message">{errors.description}</span>
        {/if}
      </span>
      <span>{description.length}/50</span>
    </div>
  </div>

  {#if errors.submit}
    <div class="alert alert-error">
      {errors.submit}
    </div>
  {/if}

  <div class="flex gap-2 justify-end">
    <button
      type="button"
      class="btn btn-secondary"
      on:click={handleCancel}
      disabled={isSubmitting}
    >
      Cancel
    </button>
    <button
      type="submit"
      class="btn btn-primary"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : mode === 'create' ? 'Submit Request' : 'Update Request'}
    </button>
  </div>
</form>

<style>
  .input {
    @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .input.error {
    @apply border-red-500;
  }

  .error-message {
    @apply text-red-500 text-sm mt-1 block;
  }

  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100;
  }

  .alert {
    @apply px-4 py-3 rounded;
  }

  .alert-error {
    @apply bg-red-100 text-red-700 border border-red-400;
  }
</style>
```

#### Holiday Request List

```svelte
<!-- lib/components/HolidayRequestList.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { holidayApi } from '$lib/api/client';
  import { formatDisplayDate } from '$lib/utils/dateUtils';
  import type { HolidayResponse } from '$lib/types';

  let holidays: HolidayResponse[] = [];
  let loading = true;
  let error: string | null = null;

  let filters = {
    startDateFrom: new Date().toISOString().split('T')[0],
    startDateTo: getEndOfYear().toISOString().split('T')[0]
  };

  onMount(async () => {
    await loadHolidays();
  });

  async function loadHolidays() {
    loading = true;
    error = null;
    try {
      holidays = await holidayApi.list(filters);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load holidays';
    } finally {
      loading = false;
    }
  }

  function getEndOfYear() {
    const date = new Date();
    date.setMonth(11, 31);
    return date;
  }

  function getStatusBadge(advice: string, decision: string) {
    if (decision === 'YES') return { text: 'Approved', class: 'success' };
    if (decision === 'NO') return { text: 'Rejected', class: 'danger' };
    if (advice === 'YES') return { text: 'Pending Decision', class: 'warning' };
    if (advice === 'NO') return { text: 'Not Advised', class: 'warning' };
    return { text: 'Pending', class: 'info' };
  }

  function getTypeName(type: number): string {
    const types: Record<number, string> = {
      1: 'Paid',
      2: 'Compensation',
      3: 'Not Paid',
      4: 'Legal'
    };
    return types[type] || 'Unknown';
  }

  async function deleteRequest(holiday: HolidayResponse) {
    if (holiday.managerDecision === 'YES') {
      alert('Cannot delete approved request. Please contact the office manager.');
      return;
    }

    if (!confirm(`Delete holiday request from ${formatDisplayDate(holiday.startDate)} to ${formatDisplayDate(holiday.endDate)}?`)) {
      return;
    }

    try {
      await holidayApi.delete(holiday.id);
      await loadHolidays();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete holiday');
    }
  }

  function editRequest(id: number) {
    goto(`/holidays/${id}`);
  }

  function createNew() {
    goto('/holidays/new');
  }
</script>

<div class="holiday-list">
  <div class="header flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold">Holiday Requests</h2>
    <button class="btn btn-primary" on:click={createNew}>
      + New Request
    </button>
  </div>

  <div class="filters flex gap-4 mb-4">
    <div>
      <label class="block text-sm mb-1">Start Date From</label>
      <input
        type="date"
        bind:value={filters.startDateFrom}
        on:change={loadHolidays}
        class="input"
      />
    </div>
    <div>
      <label class="block text-sm mb-1">Start Date To</label>
      <input
        type="date"
        bind:value={filters.startDateTo}
        on:change={loadHolidays}
        class="input"
      />
    </div>
    <div class="flex items-end">
      <button class="btn btn-secondary" on:click={loadHolidays}>
        Apply Filters
      </button>
    </div>
  </div>

  {#if loading}
    <div class="text-center py-8">
      <div class="spinner"></div>
      <p>Loading holidays...</p>
    </div>
  {:else if error}
    <div class="alert alert-error">
      {error}
    </div>
  {:else if holidays.length === 0}
    <div class="text-center py-8 text-gray-500">
      No holiday requests found for the selected period.
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Request Date</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Type</th>
            <th>Days</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each holidays as holiday}
            {@const status = getStatusBadge(holiday.supervisorAdvice, holiday.managerDecision)}
            <tr>
              <td>{formatDisplayDate(holiday.requestDate)}</td>
              <td>{formatDisplayDate(holiday.startDate)}</td>
              <td>{formatDisplayDate(holiday.endDate)}</td>
              <td>{getTypeName(holiday.type)}</td>
              <td>{holiday.days}</td>
              <td>
                <span class="badge badge-{status.class}">
                  {status.text}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button
                    class="btn btn-sm btn-secondary"
                    on:click={() => editRequest(holiday.id)}
                    disabled={holiday.managerDecision === 'YES'}
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    on:click={() => deleteRequest(holiday)}
                    disabled={holiday.managerDecision === 'YES'}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .input {
    @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }

  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700;
  }

  .btn-sm {
    @apply px-2 py-1 text-sm;
  }

  .btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .table {
    @apply border-collapse;
  }

  .table th {
    @apply bg-gray-100 px-4 py-2 text-left font-semibold border-b-2;
  }

  .table td {
    @apply px-4 py-2 border-b;
  }

  .badge {
    @apply px-2 py-1 rounded text-xs font-medium;
  }

  .badge-success {
    @apply bg-green-100 text-green-800;
  }

  .badge-danger {
    @apply bg-red-100 text-red-800;
  }

  .badge-warning {
    @apply bg-yellow-100 text-yellow-800;
  }

  .badge-info {
    @apply bg-blue-100 text-blue-800;
  }

  .alert {
    @apply px-4 py-3 rounded;
  }

  .alert-error {
    @apply bg-red-100 text-red-700 border border-red-400;
  }

  .spinner {
    @apply border-4 border-gray-200 border-t-blue-600 rounded-full w-8 h-8 animate-spin mx-auto;
  }
</style>
```

#### Remaining Days Widget

```svelte
<!-- lib/components/RemainingDaysWidget.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { employeeApi } from '$lib/api/client';

  let remaining = 0;
  let total = 0;
  let used = 0;
  let pending = 0;
  let loading = true;

  onMount(async () => {
    try {
      const data = await employeeApi.remaining();
      remaining = data.remaining;
      total = data.total;
      used = data.used;
      pending = data.pending;
    } catch (e) {
      console.error('Failed to load remaining days:', e);
    } finally {
      loading = false;
    }
  });

  $: percentage = total > 0 ? (remaining / total) * 100 : 0;
  $: statusClass = percentage > 50 ? 'good' : percentage > 25 ? 'warning' : 'low';
</script>

<div class="remaining-widget">
  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <h3 class="text-lg font-semibold mb-2">Remaining Holiday Days</h3>

    <div class="days-display {statusClass}">
      <span class="number">{remaining.toFixed(1)}</span>
      <span class="label">days left</span>
    </div>

    <div class="progress-bar mb-3">
      <div class="progress" style="width: {percentage}%"></div>
    </div>

    <div class="summary grid grid-cols-3 gap-2 text-sm">
      <div class="text-center">
        <div class="font-semibold">{used.toFixed(1)}</div>
        <div class="text-gray-600">Used</div>
      </div>
      <div class="text-center">
        <div class="font-semibold">{pending.toFixed(1)}</div>
        <div class="text-gray-600">Pending</div>
      </div>
      <div class="text-center">
        <div class="font-semibold">{total.toFixed(1)}</div>
        <div class="text-gray-600">Total</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .remaining-widget {
    @apply bg-white rounded-lg shadow p-4;
  }

  .days-display {
    @apply text-center mb-3;
  }

  .days-display .number {
    @apply text-4xl font-bold block;
  }

  .days-display .label {
    @apply text-sm text-gray-600;
  }

  .days-display.good .number {
    @apply text-green-600;
  }

  .days-display.warning .number {
    @apply text-yellow-600;
  }

  .days-display.low .number {
    @apply text-red-600;
  }

  .progress-bar {
    @apply w-full bg-gray-200 rounded-full h-2 overflow-hidden;
  }

  .progress {
    @apply h-full bg-blue-600 transition-all duration-300;
  }

  .loading {
    @apply text-center text-gray-500 py-4;
  }
</style>
```

---

## Data Migration

### Progress Data Export

```bash
# Export from Progress database
proexp yoffice-prod Holiday holiday.d
proexp yoffice-prod Employee employee.d
proexp yoffice-prod Holiday-hist holiday-hist.d
proexp yoffice-prod Legal-holiday legal-holiday.d
```

### Data Transformation Script

```javascript
// scripts/migrate-data.js
import fs from 'fs';
import pg from 'pg';

const { Client } = pg;

// Progress .d file format:
// Line 1: Database name
// Line 2+: Field separator (typically "|")
// Data lines: value1|value2|value3|...

function parseProgressDump(filename) {
  const content = fs.readFileSync(filename, 'utf-8');
  const lines = content.split('\n');

  // Skip first line (database name)
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const fields = lines[i].split('|');
      data.push(fields);
    }
  }
  return data;
}

function parseProgressDate(dateStr) {
  // Progress dates are in MM/DD/YYYY format
  if (!dateStr || dateStr === '?') return null;
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function mapLogicalField(value) {
  // Progress logical fields: yes/no/?
  if (value === 'yes') return 'YES';
  if (value === 'no') return 'NO';
  return '?';
}

async function migrateEmployees(client) {
  console.log('Migrating employees...');
  const data = parseProgressDump('employee.d');

  for (const record of data) {
    const [code, nam, frst_nam, sup_code, ho_days, in_mail] = record;

    await client.query(`
      INSERT INTO employees (code, last_name, first_name, supervisor_code, annual_holidays, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (code) DO UPDATE
      SET last_name = $2, first_name = $3, supervisor_code = $4, annual_holidays = $5, email = $6
    `, [code, nam, frst_nam, sup_code || null, parseFloat(ho_days) || 0, in_mail]);
  }

  console.log(`Migrated ${data.length} employees`);
}

async function migrateHolidays(client) {
  console.log('Migrating holiday requests...');
  const data = parseProgressDump('holiday.d');

  for (const record of data) {
    const [code, req_dat, st_dat, end_dat, days, typ, adv, dec, dsc, day_t, mod_dat, mod_usr] = record;

    await client.query(`
      INSERT INTO holiday_requests (
        employee_code, request_date, start_date, end_date, days,
        holiday_type, is_am, description, supervisor_advice, manager_decision,
        modified_date, modified_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (employee_code, start_date, end_date, holiday_type) DO UPDATE
      SET request_date = $2, days = $5, is_am = $7, description = $8,
          supervisor_advice = $9, manager_decision = $10, modified_date = $11, modified_by = $12
    `, [
      code,
      parseProgressDate(req_dat),
      parseProgressDate(st_dat),
      parseProgressDate(end_dat),
      parseFloat(days),
      parseInt(typ),
      day_t === 'yes',
      dsc || '',
      mapLogicalField(adv),
      mapLogicalField(dec),
      parseProgressDate(mod_dat),
      mod_usr
    ]);
  }

  console.log(`Migrated ${data.length} holiday requests`);
}

async function migrateLegalHolidays(client) {
  console.log('Migrating legal holidays...');
  const data = parseProgressDump('legal-holiday.d');

  for (const record of data) {
    const [day, month, dsc] = record;

    await client.query(`
      INSERT INTO legal_holidays (day, month, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (day, month) DO UPDATE SET description = $3
    `, [parseInt(day), parseInt(month), dsc]);
  }

  console.log(`Migrated ${data.length} legal holidays`);
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'yonderoffice',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    await migrateEmployees(client);
    await migrateLegalHolidays(client);
    await migrateHolidays(client);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
```

### Run Migration

```bash
# Export data from Progress
cd database
proexp yoffice-prod Holiday holiday.d
proexp yoffice-prod Employee employee.d
proexp yoffice-prod Legal-holiday legal-holiday.d

# Move to migration directory
mv *.d ../migration/data/

# Run migration script
cd ../migration
npm install pg
DB_HOST=localhost DB_NAME=yonderoffice DB_USER=postgres DB_PASSWORD=xxx node migrate-data.js
```

---

## Testing Strategy

### 1. Unit Tests (Vitest)

```typescript
// tests/unit/dateUtils.test.ts
import { describe, it, expect } from 'vitest';
import {
  countWorkingDays,
  isWeekend,
  overlapsLegalHoliday
} from '$lib/utils/dateUtils';

describe('dateUtils', () => {
  describe('isWeekend', () => {
    it('should identify Saturday as weekend', () => {
      const saturday = new Date('2024-01-06'); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should identify Sunday as weekend', () => {
      const sunday = new Date('2024-01-07'); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should identify Monday as not weekend', () => {
      const monday = new Date('2024-01-08'); // Monday
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('countWorkingDays', () => {
    it('should count only weekdays', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-12'); // Friday
      expect(countWorkingDays(start, end)).toBe(5);
    });

    it('should exclude weekends', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-14'); // Sunday
      expect(countWorkingDays(start, end)).toBe(5); // Mon-Fri only
    });

    it('should handle single day', () => {
      const date = new Date('2024-01-08'); // Monday
      expect(countWorkingDays(date, date)).toBe(1);
    });
  });

  describe('overlapsLegalHoliday', () => {
    const legalHolidays = [
      { day: 1, month: 1, description: "New Year's Day" },
      { day: 25, month: 12, description: "Christmas" }
    ];

    it('should detect overlap with legal holiday', () => {
      const request = {
        startDate: new Date('2024-12-24'),
        endDate: new Date('2024-12-26')
      };
      expect(overlapsLegalHoliday(request, legalHolidays)).toBe(true);
    });

    it('should not detect overlap when no legal holidays in range', () => {
      const request = {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-05')
      };
      expect(overlapsLegalHoliday(request, legalHolidays)).toBe(false);
    });
  });
});
```

### 2. Component Tests (Vitest + Testing Library)

```typescript
// tests/component/HolidayRequestForm.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HolidayRequestForm from '$lib/components/HolidayRequestForm.svelte';

describe('HolidayRequestForm', () => {
  it('should render all required fields', () => {
    render(HolidayRequestForm, { props: { mode: 'create' } });

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of days/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should show half-day selector when days is 0.5', async () => {
    render(HolidayRequestForm, { props: { mode: 'create' } });

    const daysInput = screen.getByLabelText(/number of days/i);
    await fireEvent.input(daysInput, { target: { value: '0.5' } });

    expect(screen.getByLabelText(/morning \(am\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/afternoon \(pm\)/i)).toBeInTheDocument();
  });

  it('should emit success event on valid submission', async () => {
    const { component } = render(HolidayRequestForm, { props: { mode: 'create' } });
    const successHandler = vi.fn();
    component.$on('success', successHandler);

    // Fill form
    await fireEvent.input(screen.getByLabelText(/start date/i), {
      target: { value: '2024-02-01' }
    });
    await fireEvent.input(screen.getByLabelText(/end date/i), {
      target: { value: '2024-02-05' }
    });
    await fireEvent.input(screen.getByLabelText(/number of days/i), {
      target: { value: '5' }
    });
    await fireEvent.input(screen.getByLabelText(/description/i), {
      target: { value: 'Family vacation' }
    });

    // Submit
    await fireEvent.submit(screen.getByRole('form'));

    expect(successHandler).toHaveBeenCalled();
  });

  it('should show validation errors for invalid data', async () => {
    render(HolidayRequestForm, { props: { mode: 'create' } });

    // Submit empty form
    await fireEvent.submit(screen.getByRole('form'));

    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
  });
});
```

### 3. E2E Tests (Playwright)

```typescript
// tests/e2e/holiday-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Holiday Request Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.user');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should create a new holiday request', async ({ page }) => {
    // Navigate to holidays
    await page.goto('/holidays');
    await page.click('text=New Request');

    // Fill form
    await page.fill('input[id="startDate"]', '2024-06-03');
    await page.fill('input[id="endDate"]', '2024-06-07');
    await page.fill('input[id="days"]', '5');
    await page.fill('textarea[id="description"]', 'Summer vacation');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page).toHaveURL('/holidays');
    await expect(page.locator('text=Summer vacation')).toBeVisible();
  });

  test('should prevent creating overlapping requests', async ({ page }) => {
    // Create first request
    await page.goto('/holidays/new');
    await page.fill('input[id="startDate"]', '2024-06-03');
    await page.fill('input[id="endDate"]', '2024-06-07');
    await page.fill('input[id="days"]', '5');
    await page.fill('textarea[id="description"]', 'First vacation');
    await page.click('button[type="submit"]');

    // Try to create overlapping request
    await page.goto('/holidays/new');
    await page.fill('input[id="startDate"]', '2024-06-05');
    await page.fill('input[id="endDate"]', '2024-06-10');
    await page.fill('input[id="days"]', '4');
    await page.fill('textarea[id="description"]', 'Overlapping vacation');
    await page.click('button[type="submit"]');

    // Verify error
    await expect(page.locator('text=overlaps with existing')).toBeVisible();
  });

  test('should not allow editing approved requests', async ({ page }) => {
    // Assume we have an approved request with id 1
    await page.goto('/holidays');

    // Find approved request
    const approvedRow = page.locator('tr:has-text("Approved")').first();
    const editButton = approvedRow.locator('button:has-text("Edit")');

    // Verify button is disabled
    await expect(editButton).toBeDisabled();
  });

  test('should calculate working days correctly', async ({ page }) => {
    await page.goto('/holidays/new');

    // Select Monday to Friday
    await page.fill('input[id="startDate"]', '2024-06-03'); // Monday
    await page.fill('input[id="endDate"]', '2024-06-07'); // Friday

    // Verify calculated days
    await expect(page.locator('text=Calculated: 5 working days')).toBeVisible();
  });
});

test.describe('Approval Workflow', () => {
  test('supervisor can provide advice', async ({ page }) => {
    // Login as supervisor
    await page.goto('/login');
    await page.fill('input[name="username"]', 'supervisor');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navigate to approvals
    await page.goto('/approvals');

    // Find pending request
    const pendingRequest = page.locator('tr:has-text("Pending")').first();
    await pendingRequest.locator('button:has-text("Approve")').click();

    // Verify status change
    await expect(pendingRequest.locator('text=Pending Decision')).toBeVisible();
  });
});
```

---

## Rollout Plan

### Timeline (12 weeks total)

| Week | Phase | Activities | Deliverables |
|------|-------|------------|--------------|
| 1-2 | API Development | Build REST API layer in Progress | Working API endpoints |
| 3-6 | Frontend Development | Build Svelte application | Complete UI |
| 7 | Integration Testing | Test frontend + backend integration | Test reports |
| 8 | UAT | User acceptance testing with pilot group | Feedback document |
| 9 | Parallel Run | Run both systems simultaneously | Validation report |
| 10 | Gradual Rollout | Deploy to production (10% → 50% → 100%) | Monitoring metrics |
| 11 | Stabilization | Monitor, fix issues, optimize | Bug fixes |
| 12 | Decommission | Turn off old system | Documentation |

### Deployment Strategy

**Stage 1: Development Environment**
- Set up development instances
- Configure CI/CD pipeline
- Deploy to dev environment

**Stage 2: Staging Environment**
- Deploy to staging
- Run full test suite
- Performance testing

**Stage 3: Production (Gradual Rollout)**
- Week 1: Deploy to 10% of users
- Week 2: Increase to 50% if no issues
- Week 3: 100% rollout

**Stage 4: Parallel Operation**
- Run both systems for 2 weeks
- Compare data consistency
- Ensure no data loss

**Stage 5: Decommission Old System**
- Archive old system data
- Update documentation
- Celebrate! 🎉

### Rollback Plan

If critical issues arise:
1. Revert load balancer to old system
2. Export data from new system
3. Investigate and fix issues
4. Retry deployment after fixes

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **Business logic bugs** | High | Medium | • Keep Progress backend initially<br>• Thorough testing<br>• Parallel run |
| **Data loss during migration** | Critical | Low | • Multiple backups<br>• Validate data after migration<br>• Parallel run |
| **User resistance** | Medium | Medium | • Early user involvement<br>• Training sessions<br>• Clear documentation |
| **Performance issues** | Medium | Low | • Load testing<br>• Database indexing<br>• Caching strategy |
| **Email delivery problems** | Low | Low | • Test notification system<br>• Fallback mechanisms<br>• Monitoring |
| **Auth/LDAP integration** | High | Medium | • Test thoroughly<br>• Fallback to local auth<br>• SSO as future option |
| **Calendar calculation errors** | High | Low | • Unit tests<br>• Compare with old system<br>• Manual verification |
| **Overlap detection bugs** | High | Medium | • Comprehensive test cases<br>• Edge case testing<br>• Data validation |
| **Browser compatibility** | Low | Low | • Test on all major browsers<br>• Progressive enhancement |
| **Deployment issues** | Medium | Medium | • Detailed deployment docs<br>• Rollback plan<br>• Staging environment |

---

## Success Metrics

### Technical Metrics
- **API Response Time:** < 200ms for 95% of requests
- **Page Load Time:** < 2 seconds
- **Test Coverage:** > 80% code coverage
- **Uptime:** 99.9% availability

### Business Metrics
- **User Adoption:** 90% of employees using new system within 2 weeks
- **Error Rate:** < 1% of transactions failing
- **Support Tickets:** < 5 tickets per week after stabilization
- **User Satisfaction:** > 4/5 rating

### Migration Metrics
- **Data Accuracy:** 100% data migration accuracy
- **Zero Data Loss:** No holiday requests lost during migration
- **Parallel Verification:** Old and new systems produce identical results

---

## Cost-Benefit Analysis

### Hybrid Approach (Svelte + Progress Backend)

**Costs:**
- Development: 6-8 weeks × 1 developer = $15k-20k
- Testing/QA: 2 weeks = $3k-5k
- Deployment: 1 week = $1k-2k
- **Total:** ~$20k-30k

**Benefits:**
- ✅ Modern UI (improved UX)
- ✅ Mobile-friendly
- ✅ Faster time-to-market
- ✅ Lower risk
- ❌ Still requires Progress licenses

**ROI:** Positive within 6-12 months (productivity gains)

### Full Rewrite (Svelte + Node.js/PostgreSQL)

**Costs:**
- Development: 12-16 weeks × 1-2 developers = $40k-60k
- Migration: 2-3 weeks = $5k-10k
- Testing/QA: 3-4 weeks = $8k-12k
- **Total:** ~$55k-85k

**Benefits:**
- ✅ Complete modernization
- ✅ Easier to hire developers
- ✅ No Progress license costs ($5k-10k/year saved)
- ✅ Better performance
- ✅ Easier to maintain

**ROI:** Positive within 2-3 years (license savings + maintenance)

---

## Next Steps

### Immediate Actions (This Week)

1. **Stakeholder Approval**
   - Present this plan to management
   - Get budget approval
   - Confirm timeline

2. **Team Assembly**
   - Assign frontend developer(s)
   - Assign backend developer (if Progress expertise needed)
   - Identify QA resources

3. **Environment Setup**
   - Set up development environment
   - Configure version control (Git)
   - Set up CI/CD pipeline

### Phase 1 Kickoff (Next Week)

1. **API Design Workshop**
   - Finalize API endpoints
   - Define request/response formats
   - Document authentication flow

2. **Prototype**
   - Build simple proof-of-concept
   - Test single API endpoint
   - Create basic Svelte form

3. **User Research**
   - Interview 3-5 users
   - Document pain points with current system
   - Gather feature requests

---

## Appendix

### A. Holiday Types Reference

```typescript
export enum HolidayType {
  PAID = 1,           // Standard annual leave
  COMPENSATION = 2,   // Time off for overtime
  NOT_PAID = 3,       // Unpaid leave
  LEGAL = 4           // National holidays
}

export const HOLIDAY_TYPE_NAMES: Record<HolidayType, string> = {
  [HolidayType.PAID]: 'Paid',
  [HolidayType.COMPENSATION]: 'Compensation',
  [HolidayType.NOT_PAID]: 'Not Paid',
  [HolidayType.LEGAL]: 'Legal'
};
```

### B. API Error Codes

```typescript
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INSUFFICIENT_DAYS = 'INSUFFICIENT_DAYS',
  OVERLAP_DETECTED = 'OVERLAP_DETECTED',
  LEGAL_HOLIDAY_CONFLICT = 'LEGAL_HOLIDAY_CONFLICT',
  CANNOT_MODIFY_APPROVED = 'CANNOT_MODIFY_APPROVED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### C. Email Templates

**Holiday Request Submitted:**
```
Subject: YonderOffice: Holiday request

Hi [Supervisor Name],

[Employee Name] has submitted a holiday request:
- Start Date: [Start Date]
- End Date: [End Date]
- Days: [Days]
- Type: [Type]
- Description: [Description]

You have [Count] pending request(s) waiting for your advice.

[Review Requests Button]

Thank you,
YonderOffice System
```

**Holiday Request Approved:**
```
Subject: Your holiday request has been approved

Hi [Employee Name],

Your holiday request has been approved:
- Start Date: [Start Date]
- End Date: [End Date]
- Days: [Days]

Remaining holiday days: [Remaining]

Thank you,
YonderOffice System
```

### D. Useful Resources

- **SvelteKit Documentation:** https://kit.svelte.dev/docs
- **Zod Documentation:** https://zod.dev
- **date-fns Documentation:** https://date-fns.org
- **Tailwind CSS:** https://tailwindcss.com
- **Playwright Testing:** https://playwright.dev
- **Progress PASOE Documentation:** https://docs.progress.com/bundle/pasoe

---

## Document Version

- **Version:** 1.0
- **Date:** 2025-10-29
- **Author:** Migration Planning Team
- **Status:** Draft for Review

---

## Questions or Feedback?

For questions about this migration plan, please contact:
- Technical Lead: [Name]
- Project Manager: [Name]
- Email: [Email]

---

**END OF DOCUMENT**
