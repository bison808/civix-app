# DELTA Wireframes & User Flow

## Core User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                     USER FLOW DIAGRAM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Landing] → [ZIP Verify] → [Interests] → [Feed]           │
│                                     ↓                        │
│                              [Bill Detail]                   │
│                                     ↓                        │
│                            [Like/Dislike]                    │
│                                     ↓                        │
│                            [Impact View]                     │
│                                     ↓                        │
│                          [Rep Scoreboard]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Screen Wireframes

### 1. ONBOARDING - ZIP Verification
```
┌─────────────────────────┐
│     DELTA               │
│     ═════               │
│                         │
│  Be the difference Δ    │
│                         │
│  ┌───────────────────┐  │
│  │ Enter ZIP Code    │  │
│  └───────────────────┘  │
│                         │
│  [  Verify & Start  ]   │
│                         │
│  ─────────────────────  │
│  Why we need this ⓘ     │
└─────────────────────────┘
```

### 2. ONBOARDING - Interest Selection
```
┌─────────────────────────┐
│ ← Back    Step 2 of 3   │
│                         │
│ What matters to you?    │
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐│
│ │ 🏥  │ │ 🎓  │ │ 💰  ││
│ │Health│ │ Edu │ │ Tax ││
│ └─────┘ └─────┘ └─────┘│
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐│
│ │ 🌍  │ │ 🏠  │ │ ⚖️  ││
│ │Climate│ │Housing│ │Justice││
│ └─────┘ └─────┘ └─────┘│
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐│
│ │ 💼  │ │ 🚗  │ │ 🔒  ││
│ │ Jobs │ │Transit│ │Privacy││
│ └─────┘ └─────┘ └─────┘│
│                         │
│     [ Continue → ]      │
└─────────────────────────┘
```

### 3. HOME FEED (Mobile)
```
┌─────────────────────────┐
│ Δ DELTA    🔍  🔔  ☰    │
├─────────────────────────┤
│ Bills Affecting You     │
│ ┌──────┬──────┬───────┐ │
│ │ All  │Local │Impact │ │
│ └──────┴──────┴───────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ HB-2024            │ │
│ │ Healthcare Access   │ │
│ │ ──────────────────│ │
│ │ "Makes insulin     │ │
│ │  affordable..."    │ │
│ │                    │ │
│ │ 👍 2.3K  👎 145    │ │
│ │                    │ │
│ │ [See Impact on You]│ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ SB-445             │ │
│ │ School Funding     │ │
│ │ ──────────────────│ │
│ │ "Increases local   │ │
│ │  school budget..." │ │
│ │                    │ │
│ │ 👍 5.1K  👎 892    │ │
│ │                    │ │
│ │ [See Impact on You]│ │
│ └─────────────────────┘ │
│                         │
│ [↓] Load More           │
└─────────────────────────┘
```

### 4. BILL DETAIL
```
┌─────────────────────────┐
│ ← Back         Share ⤴  │
├─────────────────────────┤
│ HB-2024                 │
│ Healthcare Access Act   │
│                         │
│ ┌─────────────────────┐ │
│ │   SIMPLE VERSION    │ │
│ │   ══════════════    │ │
│ │ This bill will:     │ │
│ │ • Cap insulin at $35│ │
│ │ • Cover preventive  │ │
│ │   care 100%        │ │
│ │ • No surprise bills │ │
│ └─────────────────────┘ │
│                         │
│ YOUR IMPACT:            │
│ ┌─────────────────────┐ │
│ │ 💰 Save ~$200/month │ │
│ │ 🏥 Free checkups    │ │
│ │ ⏰ Vote: Jan 15     │ │
│ └─────────────────────┘ │
│                         │
│ ┌──────────┬──────────┐ │
│ │    👍    │    👎    │ │
│ │   LIKE   │ DISLIKE  │ │
│ └──────────┴──────────┘ │
│                         │
│ + Add comment (optional)│
│                         │
│ [View Full Text →]      │
└─────────────────────────┘
```

### 5. ONE-CLICK FEEDBACK
```
┌─────────────────────────┐
│                         │
│    How do you feel?     │
│                         │
│  ┌─────────────────┐    │
│  │                 │    │
│  │     👍          │    │
│  │   SUPPORT       │    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │                 │    │
│  │     👎          │    │
│  │   OPPOSE        │    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ Tell us why...  │    │
│  │ (optional)      │    │
│  └─────────────────┘    │
│                         │
│    [ Submit ]           │
│                         │
└─────────────────────────┘
```

### 6. IMPACT VISUALIZATION
```
┌─────────────────────────┐
│ How This Affects You    │
├─────────────────────────┤
│                         │
│ MONTHLY SAVINGS         │
│ ┌─────────────────────┐ │
│ │ ▁▁▁▁▄▄▆█████████   │ │
│ │ Now        After    │ │
│ │ $450  →    $250     │ │
│ └─────────────────────┘ │
│                         │
│ YOUR NEIGHBORHOOD       │
│ ┌─────────────────────┐ │
│ │   [Map View]        │ │
│ │   • 3 new clinics   │ │
│ │   • 24/7 pharmacy   │ │
│ │   • Free vaccines   │ │
│ └─────────────────────┘ │
│                         │
│ TIMELINE               │
│ ├──●──○──○──○──○──○──│ │
│ Vote  Feb  Apr  Jul   │ │
│ Jan 15               │ │
│                         │
│ [See Full Analysis →]   │
└─────────────────────────┘
```

### 7. REPRESENTATIVE SCOREBOARD
```
┌─────────────────────────┐
│ Your Representatives    │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Sen. Jane Smith     │ │
│ │ ═══════════════     │ │
│ │ Alignment: 78% ✓   │ │
│ │                    │ │
│ │ Recent Votes:      │ │
│ │ HB-2024: YES ✓     │ │
│ │ SB-445: YES ✓      │ │
│ │ HB-891: NO ✗       │ │
│ │                    │ │
│ │ [📧 Email] [📞Call]│ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Rep. John Doe      │ │
│ │ ═══════════════     │ │
│ │ Alignment: 45% ⚠   │ │
│ │                    │ │
│ │ Recent Votes:      │ │
│ │ HB-2024: NO ✗      │ │
│ │ SB-445: YES ✓      │ │
│ │ HB-891: NO ✗       │ │
│ │                    │ │
│ │ [📧 Email] [📞Call]│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 8. SETTINGS
```
┌─────────────────────────┐
│ ← Back    Settings      │
├─────────────────────────┤
│                         │
│ NOTIFICATIONS           │
│ ┌─────────────────────┐ │
│ │ New Bills      [✓] │ │
│ │ Vote Reminders [✓] │ │
│ │ Rep Updates    [✓] │ │
│ │ Impact Alerts  [✓] │ │
│ └─────────────────────┘ │
│                         │
│ PREFERENCES             │
│ ┌─────────────────────┐ │
│ │ Simplify Level     │ │
│ │ [Basic|Med|Detail] │ │
│ │                    │ │
│ │ Text Size          │ │
│ │ [Sm|Med|Lg|XL]     │ │
│ └─────────────────────┘ │
│                         │
│ PRIVACY                 │
│ ┌─────────────────────┐ │
│ │ Share ZIP     [✓] │ │
│ │ Analytics     [✓] │ │
│ │ Public Votes  [ ] │ │
│ └─────────────────────┘ │
│                         │
│ [Update Interests]      │
│ [Change ZIP Code]       │
│ [Sign Out]             │
└─────────────────────────┘
```

## Interaction Patterns

### Touch Gestures
- **Swipe Right**: Like/Support
- **Swipe Left**: Dislike/Oppose  
- **Swipe Up**: See more details
- **Swipe Down**: Refresh feed
- **Long Press**: Share options
- **Pinch**: Zoom on impact charts

### Animation Transitions
- **Feed Loading**: Skeleton screens
- **Card Interactions**: Spring physics
- **Like/Dislike**: Haptic + color burst
- **Navigation**: Slide transitions
- **Data Updates**: Fade in/out

### Responsive Breakpoints
- **Mobile (320-767px)**: Single column, full width
- **Tablet (768-1023px)**: 2 column grid, sidebar nav
- **Desktop (1024px+)**: 3 column layout, persistent nav

## Design System Components

### Typography Scale
- **Display**: 32px/40px (Headers)
- **Title**: 24px/32px (Bill titles)
- **Body**: 16px/24px (Content)
- **Caption**: 14px/20px (Meta info)
- **Micro**: 12px/16px (Labels)

### Color Usage
- **Primary Actions**: Delta purple (#7C3AED)
- **Support**: Green (#22C55E)
- **Oppose**: Red (#EF4444)
- **Neutral**: Gray (#6B7280)
- **Background**: White/Off-white
- **Text**: Dark gray (#111827)

### Spacing Grid
- Base unit: 4px
- Component padding: 16px
- Card margins: 12px
- Section spacing: 24px
- Page margins: 20px (mobile), 40px (desktop)