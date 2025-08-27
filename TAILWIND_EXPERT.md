# Tailwind CSS Expert Sub-Agent Profile

## CRITICAL VERSION INFORMATION
- **Currently Installed**: Tailwind CSS v4.1.12
- **Configuration Method**: Using @tailwindcss/postcss plugin
- **Build Tool**: Vite

## TAILWIND V4 KEY DIFFERENCES FROM V3

### Configuration Approach
- **V3**: Uses `tailwind.config.js` with JavaScript configuration
- **V4**: CSS-first configuration using `@theme`, `@utility`, and CSS variables
- **Our Setup**: Hybrid - we have v4 installed but using v3-style config (THIS IS THE PROBLEM)

### How V4 Works
1. **PostCSS Plugin**: `@tailwindcss/postcss` processes Tailwind directives
2. **CSS Configuration**: Theme customization via CSS, not JS config
3. **Utility Generation**: JIT compilation based on content scanning

## PROPER V4 CONFIGURATION

### For Custom Max-Width Values in V4
```css
/* In src/index.css or a dedicated CSS file */
@layer utilities {
  .max-w-xs { max-width: 20rem; }
  .max-w-sm { max-width: 24rem; }
  .max-w-md { max-width: 28rem; }
  .max-w-lg { max-width: 32rem; }
  .max-w-xl { max-width: 36rem; }
  .max-w-2xl { max-width: 42rem; }
  .max-w-3xl { max-width: 48rem; }
  .max-w-4xl { max-width: 56rem; }
  .max-w-5xl { max-width: 64rem; }
  .max-w-6xl { max-width: 72rem; }
  .max-w-7xl { max-width: 80rem; }
}
```

### Or Using V4's Theme System
```css
@theme {
  --width-xs: 20rem;
  --width-sm: 24rem;
  --width-md: 28rem;
  --width-lg: 32rem;
  --width-xl: 36rem;
  --width-2xl: 42rem;
  --width-3xl: 48rem;
  --width-4xl: 56rem;
  --width-5xl: 64rem;
  --width-6xl: 72rem;
  --width-7xl: 80rem;
}
```

## CURRENT ISSUES TO FIX

### 1. Max-Width Classes Not Generated
**Problem**: Classes like `max-w-md`, `max-w-7xl` aren't being generated
**Reason**: V4 doesn't respect `tailwind.config.js` extend.maxWidth
**Solution**: Add custom utilities via CSS @layer

### 2. Full-Width Mobile Appearance
**Problem**: Everything stretches to 100% width on desktop
**Solution**: Apply proper max-width constraints using working methods

### 3. Form Field Overflow
**Problem**: Input fields extend past card boundaries
**Solution**: Proper box-sizing and width constraints

### 4. Theme Toggle Position
**Problem**: Overlaps with text content
**Solution**: Higher z-index and proper absolute/fixed positioning

### 5. Password Icon Size/Position
**Problem**: Too large and positioned outside input
**Solution**: Proper sizing and absolute positioning within relative parent

## ACTION PLAN

1. **Stop using tailwind.config.js for theme extension** - it doesn't work in v4
2. **Add custom utilities directly in CSS** using @layer utilities
3. **Use CSS variables for theming** via @theme directive
4. **Apply inline styles as fallback** when Tailwind classes don't exist
5. **Verify generated CSS** to ensure classes are actually created

## VERIFICATION COMMANDS

```bash
# Check if classes are generated
grep "max-w-" dist/assets/*.css

# Check Tailwind version
npm list tailwindcss

# Rebuild with clean cache
rm -rf node_modules/.vite && npm run build
```

## REFERENCES
- [Tailwind v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [Vite + Tailwind v4 Setup](https://tailwindcss.com/docs/installation/using-vite)
- [Custom Styles in v4](https://tailwindcss.com/docs/adding-custom-styles)