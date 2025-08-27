# shadcn/ui Complete Reference Guide

## Overview
shadcn/ui is not a traditional component library - it's a collection of copy-and-paste components built using Radix UI and Tailwind CSS. The philosophy is "This is how you build your component library."

## Core Principles
1. **Open Code**: Full transparency - you own and control the code
2. **Composition**: Predictable, shared interface across components
3. **Distribution**: Flat-file schema with CLI-based distribution
4. **Beautiful Defaults**: Consistent, minimal design out of the box
5. **AI-Ready**: Open code structure optimized for LLM integration

## Installation for Vite + React + TypeScript

### 1. Initial Setup
```bash
# Create new Vite project
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### 2. Add Tailwind CSS
```bash
npm install -D tailwindcss @tailwindcss/vite
```

### 3. Configure CSS (src/index.css)
```css
@import "tailwindcss";
```

### 4. Configure TypeScript
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. Install Node Types
```bash
npm install -D @types/node
```

### 6. Update vite.config.ts
```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 7. Initialize shadcn
```bash
npx shadcn@latest init
```

## CLI Commands

### init
Initialize configuration and dependencies
```bash
npx shadcn@latest init [options]

Options:
  -t, --template <template>     Template (next, next-monorepo, vite)
  -b, --base-color <color>      Base color (neutral, gray, zinc, stone, slate)
  -y, --yes                     Skip confirmation
  -f, --force                   Force overwrite
  --src-dir                     Use src directory
  --css-variables               Use CSS variables
```

### add
Add components to your project
```bash
npx shadcn@latest add [component] [options]

Options:
  -y, --yes                     Skip confirmation
  -o, --overwrite               Overwrite existing files
  -a, --all                     Add all components
  -p, --path <path>             Component path
  --src-dir                     Use src directory
  --css-variables               Use CSS variables

Examples:
  npx shadcn@latest add button
  npx shadcn@latest add dialog sheet
  npx shadcn@latest add --all
```

### build
Generate registry JSON files
```bash
npx shadcn@latest build [options]

Options:
  -o, --output <path>           Output directory for JSON files
```

## Complete Component List

### Layout Components
- Sidebar - Composable sidebar navigation
- Resizable - Resizable panels and layouts

### Form Components
- Button - Interactive button component
- Checkbox - Check/uncheck input
- Input - Text input field
- Input OTP - One-time password input
- Label - Form label component
- Radio Group - Radio button selection
- Select - Dropdown selection
- Slider - Range slider input
- Switch - Toggle switch
- Textarea - Multi-line text input
- Toggle - Toggle button
- Toggle Group - Group of toggle buttons
- React Hook Form - Form integration

### Navigation Components
- Breadcrumb - Navigation breadcrumbs
- Context Menu - Right-click menu
- Dropdown Menu - Dropdown menu component
- Menubar - Application menubar
- Navigation Menu - Navigation menu
- Pagination - Page navigation
- Tabs - Tab navigation

### Overlay Components
- Alert Dialog - Modal alert dialog
- Dialog - Modal dialog
- Drawer - Sliding drawer panel
- Hover Card - Hover information card
- Popover - Popover content
- Sheet - Side sheet overlay
- Tooltip - Hover tooltips

### Data Display
- Accordion - Collapsible content sections
- Alert - Alert messages
- Avatar - User avatars
- Badge - Status badges
- Card - Content cards
- Carousel - Image/content carousel
- Chart - Data charts
- Collapsible - Collapsible content
- Data Table - Complex data tables
- Progress - Progress indicators
- Scroll-area - Scrollable areas
- Separator - Visual separator
- Skeleton - Loading skeletons
- Table - Basic tables
- Typography - Text styling

### Date & Time
- Calendar - Date picker calendar
- Date Picker - Date selection

### Utilities
- Aspect Ratio - Maintain aspect ratios
- Combobox - Searchable select
- Command - Command palette
- Sonner - Toast notifications
- Toast - Toast messages

## Theming System

### CSS Variables Structure
The theming system uses CSS variables with a `background` and `foreground` convention:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode values ... */
}
```

### Color System
- Uses OKLCH color format for better color interpolation
- Available base colors: neutral, stone, zinc, gray, slate
- Each color includes 50-950 scale variations
- Automatic dark mode support

### Dark Mode Implementation
1. Add dark mode toggle to your app
2. Apply `.dark` class to `<html>` element
3. Use Tailwind's dark mode utilities

Example:
```jsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')

// Component with dark mode
<div className="bg-background text-foreground dark:bg-background dark:text-foreground">
  Content adapts to theme
</div>
```

### Custom Theme Configuration
Update `components.json`:
```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## Usage Examples

### Basic Button
```tsx
import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <Button variant="outline" size="lg">
      Click me
    </Button>
  )
}
```

### Dialog with Form
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogDemo() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Data Table with Sorting
```tsx
import { DataTable } from "@/components/ui/data-table"

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
]

export function TableDemo() {
  return <DataTable columns={columns} data={users} />
}
```

## Best Practices

### 1. Component Composition
- Build complex UI by composing smaller components
- Keep components focused and single-purpose
- Use compound components for related functionality

### 2. Styling
- Prefer Tailwind utilities over custom CSS
- Use CSS variables for theme consistency
- Apply dark mode classes consistently

### 3. Accessibility
- All components are built on Radix UI primitives
- Includes proper ARIA attributes
- Keyboard navigation support built-in

### 4. Performance
- Components are tree-shakeable
- Only import what you need
- Lazy load heavy components

### 5. Customization
- Modify component files directly - you own the code
- Extend with your own variants
- Create wrapper components for repeated patterns

## Integration with Existing Projects

### For BigFootLive Platform
The platform already uses shadcn/ui components. To add new components:

```bash
# Navigate to frontend directory
cd /home/ava-io/repos/bigfootlive-react-frontend

# Add a new component
npx shadcn@latest add [component-name]

# Example: Add a command palette
npx shadcn@latest add command
```

### Component Organization
```
src/
├── components/
│   ├── ui/           # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── custom/       # Your custom components
└── lib/
    └── utils.ts      # Utility functions
```

## Framework Integrations

### Supported Frameworks
- Next.js (App Router & Pages Router)
- Vite
- Laravel
- Remix
- Astro
- TanStack Router
- React Router

### State Management
- Works with any state management solution
- Supports controlled and uncontrolled components
- Compatible with React Hook Form

### Data Fetching
- Integrates with TanStack Query
- Works with SWR
- Compatible with server components (Next.js)

## Troubleshooting

### Common Issues

1. **CSS not applying**
   - Ensure Tailwind is properly configured
   - Check if CSS variables are defined
   - Verify dark mode class is applied

2. **TypeScript errors**
   - Update tsconfig paths
   - Install missing type definitions
   - Check component imports

3. **Component not found**
   - Run `npx shadcn@latest add [component]`
   - Check import paths
   - Verify installation completed

4. **Theme not switching**
   - Ensure dark class toggles on root element
   - Check CSS variable definitions
   - Verify Tailwind dark mode config

## Resources

- Official Documentation: https://ui.shadcn.com
- GitHub: https://github.com/shadcn-ui/ui
- Examples: https://github.com/shadcn-ui/ui/tree/main/apps/www
- Component Preview: https://ui.shadcn.com/docs/components
- Themes: https://ui.shadcn.com/themes
- Blocks: https://ui.shadcn.com/blocks

## Version Compatibility

- React: 18.0+
- TypeScript: 5.0+
- Tailwind CSS: 3.4+ (v4 for latest features)
- Node.js: 18.0+

---

This reference guide provides comprehensive information for using shadcn/ui in the BigFootLive platform and other projects. The component library's philosophy of ownership and customization makes it ideal for building scalable, maintainable UI systems.