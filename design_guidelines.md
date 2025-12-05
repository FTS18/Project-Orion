# Design Guidelines: Dual-Mode Agentic AI Loan Assistant

## Design Approach
**Material Design 3** - Selected for its robust enterprise patterns, excellent form handling, clear information hierarchy, and professional aesthetic appropriate for financial services. Material's elevation system and structured layouts are ideal for the multi-panel agent interface and data-dense displays.

## Typography System

**Font Family**: 
- Primary: 'Inter' (Google Fonts) for interface, forms, data
- Monospace: 'JetBrains Mono' for logs, technical displays

**Scale**:
- Hero/Landing: text-5xl font-bold (48px)
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Secondary/Meta: text-sm (14px)
- Labels/Captions: text-xs font-medium uppercase tracking-wide (12px)

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Tight spacing: p-2, gap-2 (8px) - within components
- Standard spacing: p-4, gap-4 (16px) - component padding, card spacing
- Section spacing: p-8, gap-8 (32px) - between major sections
- Layout margins: p-12, p-16 (48px-64px) - page margins, hero spacing

**Grid System**:
- Container: max-w-7xl mx-auto px-4 md:px-8
- Dual-pane layouts: 60/40 split for chat + agent panels (grid-cols-5, col-span-3 + col-span-2)
- Wizard steps: Single column max-w-2xl centered
- Agent panels: 4-column grid for worker agents (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)

## Component Library

### Navigation
- **Header**: Fixed top nav, h-16, with logo left, mode toggle center, profile/actions right
- **Mode Toggle**: Large prominent switch with "Standard Mode" / "Agentic AI Mode" labels
- **Breadcrumbs**: For wizard progression, text-sm with chevron separators

### Landing Page (Single-Page Hero)
- **Hero Section**: h-screen with split layout - left: headline + value props + dual CTA buttons, right: abstract workflow visualization (geometric shapes representing agent flow)
- **Hero Image**: Right side - abstract/geometric illustration showing interconnected nodes representing AI agents (not photographic)
- **Features Grid**: 3-column grid showcasing dual modes, security, speed
- **How It Works**: 2-column alternating layout showing Standard vs AI Mode workflows

### Standard Mode - Wizard
- **Stepper**: Horizontal progress bar at top, numbered steps with labels (1. Details, 2. Documents, 3. Verification, 4. Review)
- **Form Cards**: Elevated cards (shadow-md) with p-6, form fields in vertical stack with gap-4
- **Input Fields**: h-12, rounded-lg borders, focus states with ring-2
- **File Upload**: Dashed border dropzone, h-32, with icon + "Drop files here" text
- **Action Buttons**: Fixed bottom bar with Back (text) + Continue (filled) buttons

### Agentic AI Mode - Chat Interface
- **Master Chat**: Left panel (60%), full-height scrollable message thread
  - User messages: Right-aligned, max-w-md, rounded-2xl rounded-tr-sm
  - Agent messages: Left-aligned, max-w-md, rounded-2xl rounded-tl-sm
  - Timestamp/status: text-xs below each message
- **Input Bar**: Fixed bottom, h-16, with text input + send icon button + mic icon
- **Worker Agent Panels**: Right sidebar (40%), 2x2 grid of agent cards
  - Each card: p-4, rounded-lg, border
  - Agent status indicator: Small dot (h-2 w-2 rounded-full) with pulsing animation when active
  - Latest action: text-sm, truncate
  - Expandable to full detail view

### Workflow Visualization
- **Graph Canvas**: svg-based flow diagram showing Master → Worker connections
- **Nodes**: Rounded rectangles with agent icons, connected by curved paths
- **Active State**: Animated glow/pulse on currently executing agent
- **Logs Panel**: Collapsible bottom drawer, h-48, terminal-style with monospace font

### Data Display Components
- **Info Cards**: Grid layout for customer data, p-4, with label/value pairs in 2-column grid
- **Status Badges**: inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase
  - Approved, Rejected, Pending, Processing states
- **Data Tables**: Striped rows, text-sm, sticky header for scrolling
- **Metric Cards**: Large numbers (text-4xl font-bold) with labels and trend indicators

### Sanction Letter
- **PDF Preview**: Modal overlay with preview + download actions
- **Download Button**: Prominent filled button with download icon

### Forms & Inputs
- **Text Inputs**: h-11, rounded-md, px-3, consistent border width
- **Select Dropdowns**: Same height as text inputs, chevron-down icon
- **Radio/Checkbox Groups**: Vertical stack gap-3, each option h-10 with ring on focus
- **Validation**: Inline error text-sm below field, input border highlight

### Cards & Surfaces
- **Elevation Levels**:
  - Base cards: border with no shadow
  - Interactive cards: border + shadow-sm, hover:shadow-md transition
  - Modal/Dialog: shadow-xl
- **Rounding**: Consistent rounded-lg (8px) for most components, rounded-xl for modals

## Responsive Behavior
- **Mobile** (< 768px): Stack all multi-column layouts, full-width cards, collapse agent panels to tabs
- **Tablet** (768-1024px): 2-column grids, side-by-side for key comparisons
- **Desktop** (> 1024px): Full multi-panel layout with sidebars

## Animations
- **Minimal Use**: Transitions only on hover states (shadow, transform), loading spinners, and active agent pulse
- **Durations**: transition-all duration-200 for interactive elements
- **Agent Workflow**: Subtle animated path drawing when agent transitions occur

## Accessibility
- All form inputs: Associated labels, aria-labels for icons
- Focus indicators: ring-2 ring-offset-2 on all interactive elements
- Keyboard navigation: Full tab order, Enter to submit, Esc to close modals
- Status announcements: aria-live regions for agent status changes

## Images
- **Hero Image**: Right side of hero - abstract geometric illustration with interconnected circular nodes and connecting lines representing AI agent network (2:3 aspect ratio, vertical orientation)
- **Feature Icons**: Simple line icons for security badge, speed meter, chat bubble (from Heroicons)
- **Agent Avatars**: Circular icons with solid fills representing each agent type (sales, verification, underwriting, sanction)
- **No photographs**: Keep visual language abstract and professional