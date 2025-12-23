# Jalali Dispatch Board - Budibase Plugin

## PROJECT OVERVIEW

This is a custom Budibase plugin that provides a monthly dispatch calendar with full Jalali (Persian Solar) calendar support. It's designed for Iranian MSPs to schedule technicians to client sites with drag & drop, real-time conflict detection, and hours tracking.

## BUSINESS CONTEXT

**Company:** Pirasys - Iranian MSP with 26 employees
**Users:** IT Supervisor planning on-site technician visits
**Clients:** 25+ organizations with monthly hour contracts (4h-64h/month)
**Technicians:** 14-18 active field technicians
**Calendar:** Jalali (Persian Solar) calendar - months like Farvardin, Ordibehesht, Dey, etc.

### Key Business Rules:
1. Each company has contracted monthly hours (e.g., 16 hours/month)
2. Each technician has target weekly hours (typically 40h/week)
3. System warns but NEVER blocks scheduling (flexibility-first approach)
4. Technicians have specific assigned sites (not rotating randomly)
5. Scheduling uses Jalali calendar (Saturday-Friday work week)

## TECHNOLOGY STACK

- **Framework:** Svelte 5 (Budibase's preferred)
- **Build Tool:** Vite (via Budibase plugin template)
- **Jalali Calendar:** moment-jalaali
- **Drag & Drop:** svelte-dnd-action
- **Styling:** TailwindCSS + Custom CSS
- **Date Handling:** moment-jalaali + date-fns

## PROJECT STRUCTURE
```
jalali-dispatch-board/
├── package.json              # Dependencies and scripts
├── schema.json               # Budibase plugin configuration
├── vite.config.js           # Build configuration
├── README.md                # User documentation
├── claude.md                # This file (for Claude Code)
│
├── src/
│   ├── Component.svelte           # Main entry point (Budibase integration)
│   │
│   ├── components/
│   │   ├── DispatchBoard.svelte      # Main board container
│   │   ├── BoardHeader.svelte        # Month selector, navigation
│   │   ├── TechnicianRow.svelte      # Single tech row with cells
│   │   ├── DayCell.svelte            # Single day cell (drop target)
│   │   ├── ScheduleBlock.svelte      # Draggable schedule block
│   │   ├── WarningPanel.svelte       # Warnings sidebar
│   │   └── ScheduleModal.svelte      # Create/edit schedule form
│   │
│   ├── lib/
│   │   ├── jalali.js                 # Jalali date utilities
│   │   ├── calculations.js           # Hours calculations
│   │   ├── validation.js             # Conflict detection
│   │   └── dragHandlers.js           # Drag & drop logic
│   │
│   ├── stores/
│   │   ├── schedules.js              # Schedule state management
│   │   ├── warnings.js               # Warnings state
│   │   └── ui.js                     # UI state (modals, loading)
│   │
│   └── styles/
│       └── dispatch-board.css        # Global component styles
│
└── tests/                    # Unit tests (to be added)
```

## DATA MODELS

### Schedule (from PostgreSQL via Budibase)
```javascript
{
  id: number,
  technician_id: number,
  company_id: number,
  scheduled_date: "2025-12-22",           // Gregorian
  scheduled_date_jalali: "1404/10/02",    // Jalali
  scheduled_hours: 4.0,
  status: "planned" | "confirmed" | "completed" | "cancelled",
  notes: string | null,
  override_reason: string | null,
  created_by: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Technician
```javascript
{
  id: number,
  full_name: string,
  suggested_max_hours_week: number,      // e.g., 40
  status: "active" | "inactive",
  me_synced_at: timestamp
}
```

### Company
```javascript
{
  id: number,
  name: string,
  monthly_hours: number,                 // Base contracted hours
  status: "active" | "inactive"
}
```

## COMPONENT ARCHITECTURE

### Main Flow:
1. **Component.svelte** receives data from Budibase datasources
2. **DispatchBoard.svelte** manages state and orchestrates child components
3. **BoardHeader.svelte** handles month navigation
4. **TechnicianRow.svelte** renders each tech's row with day cells
5. **DayCell.svelte** is a drop target for schedules
6. **ScheduleBlock.svelte** is draggable and shows schedule details
7. **ScheduleModal.svelte** opens for create/edit operations

### State Management:
- Component props flow down from Budibase
- Events bubble up via Svelte's event system
- Writable stores for UI state (modals, selected items)

## CRITICAL FEATURES TO IMPLEMENT

### 1. Jalali Calendar Display
- Show Jalali month name (Farvardin, Dey, etc.)
- Show Jalali dates (1404/10/01, etc.)
- Highlight Fridays (weekend in Iran)
- Support month navigation (previous/next)

### 2. Drag & Drop Scheduling
- Drag schedule blocks between day cells
- Drag between technicians (reassign)
- Visual feedback during drag (ghost, drop zones)
- Snap to cell boundaries
- Cancel with Escape key

### 3. Real-Time Warnings (Non-Blocking!)
- **Tech Overload:** "Tech will have 48h this week (suggested: 40h)"
- **Company Overage:** "Company will use 20h / 16h this month"
- **Schedule Conflict:** "Tech has 2 other assignments on this date"
- Display warnings but ALWAYS allow save

### 4. Visual Indicators
- Color-coded status: Blue=Planned, Green=Confirmed, Gray=Completed
- Warning icons on blocks with issues
- Progress bars for company hours
- Highlight weekends (Fridays)

### 5. Responsive Design
- Desktop: Full grid view
- Tablet: Scroll horizontally
- Mobile: Card-based layout (future)

## DEVELOPMENT GUIDELINES

### Coding Standards:
- Use Svelte 5 syntax (runes if needed: $state, $derived, $effect)
- Prefer composition over inheritance
- Keep components under 200 lines
- Extract reusable logic to lib/
- Use TypeScript JSDoc comments for complex functions
- Follow Budibase's styleable patterns

### Jalali Date Handling:
```javascript
import moment from 'moment-jalaali';

// Always configure at module top
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

// Convert Gregorian to Jalali
const jalali = moment('2025-12-22', 'YYYY-MM-DD').format('jYYYY/jMM/jDD');

// Convert Jalali to Gregorian
const gregorian = moment('1404/10/02', 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
```

### Performance Considerations:
- Memoize date calculations (use $derived in Svelte 5)
- Virtual scrolling if > 30 technicians
- Debounce drag updates
- Lazy load schedule details

### Accessibility:
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ARIA labels for drag & drop
- Screen reader announcements for state changes
- Focus management in modals

## BUDIBASE INTEGRATION

### Plugin Events (emit to Budibase):
```javascript
onScheduleCreate?.(scheduleData);   // CREATE operation
onScheduleUpdate?.(scheduleData);   // UPDATE operation
onScheduleDelete?.(scheduleId);     // DELETE operation
```

### Plugin Settings (configurable in Budibase):
- `schedulesDataSource`: Query returning schedule data
- `techniciansDataSource`: Query returning technician data
- `companiesDataSource`: Query returning company data
- `defaultHours`: Default hours per schedule (e.g., 8)
- `showWarnings`: Toggle warning panel
- `allowOverlaps`: Allow same-tech overlapping schedules

## TESTING STRATEGY

### Unit Tests (to add):
- Jalali date conversions
- Hours calculations
- Conflict detection logic
- Schedule grid building

### Integration Tests:
- Drag & drop workflows
- Warning generation
- Modal interactions
- Data updates

### Manual Testing Checklist:
- [ ] Create schedule via drag
- [ ] Create schedule via modal
- [ ] Edit existing schedule
- [ ] Delete schedule
- [ ] Navigate months
- [ ] Check warnings appear
- [ ] Test on mobile/tablet
- [ ] Test with 30+ technicians
- [ ] Test with empty data
- [ ] Test Jalali date accuracy

## CURRENT DEVELOPMENT STATUS

### ✅ Completed:
- Project setup
- Jalali utility functions (lib/jalali.js)
- Basic component structure
- Schema definition

### 🔄 In Progress:
- DispatchBoard main component
- Drag & drop implementation
- Warning calculations

### ⏳ TODO:
- TechnicianRow component
- DayCell component
- ScheduleBlock component
- ScheduleModal component
- Warning panel
- Styling and polish
- Testing
- Documentation

## DEBUGGING TIPS

### Common Issues:

**Jalali dates off by one:**
- Check if using 0-based or 1-based months
- moment-jalaali uses 0-based: jMonth() returns 0-11

**Drag & drop not working:**
- Verify svelte-dnd-action is properly imported
- Check drop zones have correct ARIA attributes
- Ensure dragDisabled prop is false

**Component not rendering in Budibase:**
- Check schema.json is valid JSON
- Verify Component.svelte exports props correctly
- Run `npm run build` and check dist/ folder
- Check Budibase console for errors

**Hours calculations wrong:**
- Log intermediate values
- Check timezone handling (use UTC for dates)
- Verify database returns correct data types

## USEFUL COMMANDS
```bash
# Development (watch mode)
npm run watch

# Build for production
npm run build

# Install in local Budibase
# (Budibase must be running)
budi plugins --build

# Check for errors
npm run lint

# Format code
npm run format
```

## EXTERNAL RESOURCES

- Budibase Plugin Docs: https://docs.budibase.com/docs/custom-plugin
- Svelte 5 Docs: https://svelte-5-preview.vercel.app/docs
- moment-jalaali: https://github.com/jalaali/moment-jalaali
- svelte-dnd-action: https://github.com/isaacHagoel/svelte-dnd-action

## CONTACT & SUPPORT

**Project Owner:** Arsalan (MODDOM)
**Company:** Pirasys
**Location:** Tehran, Iran
**Started:** December 2025

## NOTES FOR CLAUDE CODE

When working on this project:
1. Always preserve Jalali calendar logic - it's critical
2. Never block user actions - only warn
3. Test with real Iranian company/tech names from the codebase
4. Consider Saturday-Friday work week (not Sunday-Saturday)
5. Remember: flexibility > enforcement in this business
6. Keep performance in mind - this runs in browser

## SAMPLE DATA FOR TESTING
```javascript
// Use these IDs from the actual database:
const REAL_COMPANIES = [
  { id: 21, name: "Pirasys Co.", monthly_hours: 16 },
  { id: 22, name: "AsrNovin", monthly_hours: 4 },
  { id: 23, name: "DorrehSanat", monthly_hours: 32 }
];

const REAL_TECHNICIANS = [
  { id: 7, full_name: "Hamed Bakhsheshi", suggested_max_hours_week: 40 },
  { id: 8, full_name: "Amir Hossein Jamali", suggested_max_hours_week: 40 },
  { id: 9, full_name: "Amir Zahedi", suggested_max_hours_week: 40 }
];
```

---

**Last Updated:** December 23, 2025
**Version:** 0.1.0-alpha
**Status:** Active Development
## IMPORTANT: Svelte Version

**This plugin uses Svelte 4**, not Svelte 5, because Budibase doesn't support Svelte 5 yet.

### Syntax Guidelines:
- Use `export let prop` for props (NOT `$props()`)
- Use `$: reactive = value` for derived values (NOT `$derived()`)
- Use `$: { ... }` for effects (NOT `$effect()`)
- Use `writable()` stores (NOT `$state()`)

### When Budibase Supports Svelte 5:
We can upgrade by changing package.json dependencies and converting syntax.

