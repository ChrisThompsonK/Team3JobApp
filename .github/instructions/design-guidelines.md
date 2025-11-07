---
applyTo: '**'
---

# Kainos Design Guidelines

## Overview
All pages, endpoints, and components in this application must follow the official Kainos brand identity and color scheme to maintain a consistent, professional appearance throughout the web application.

---

## Color Scheme

### Brand Colors
All Kainos colors are defined as CSS variables in `/src/styles/input.css`:

- **Primary Navy**: `#2b4c7e` → `var(--kainos-primary)`
  - Main brand color, used for headers and primary elements
  
- **Secondary Navy**: `#1e3a5f` → `var(--kainos-secondary)`
  - Darker shade for depth and contrast
  
- **Accent Green**: `#7cb342` → `var(--kainos-green)`
  - Action buttons, success states, and highlights
  
- **Dark Navy**: `#152238` → `var(--kainos-dark)`
  - Text on light backgrounds, deep shadows
  
- **Light Blue**: `#e8f0ff` → `var(--kainos-light)`
  - Backgrounds, cards, and subtle highlights
  
- **Text Color**: `#2b4c7e` → `var(--kainos-text)`
  - Primary text color for headings and important content

---

## CSS Classes and Usage

### Gradients
```css
/* Navy gradient for hero sections and headers */
.kainos-gradient {
  background: linear-gradient(135deg, var(--kainos-primary) 0%, var(--kainos-secondary) 100%);
}

/* Text gradient for prominent headings */
.kainos-text-gradient {
  background: linear-gradient(135deg, var(--kainos-primary) 0%, var(--kainos-green) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Buttons
```css
/* Primary action buttons - green with white text */
.btn-kainos {
  background: var(--kainos-green);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 24px;
}

/* Outline buttons */
.btn-kainos-outline {
  background: transparent;
  color: var(--kainos-primary);
  border: 2px solid var(--kainos-primary);
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  padding: 10px 22px;
}
```

### Logo
```css
/* Kainos logo sizing */
.kainos-logo {
  height: 48px;
  width: auto;
}
```

---

## Typography

### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

### Headings
- All headings (`h1` through `h6`) use:
  - `font-weight: 600` (semi-bold)
  - `line-height: 1.2`
  - `color: var(--kainos-text)` (navy blue)

### Body Text
- `font-weight: 400` (regular)
- `line-height: 1.6`

---

## Component Guidelines

### DaisyUI Integration
- Use DaisyUI components as the base
- Override colors with Kainos brand colors
- Maintain consistent spacing and layout patterns

### Page Layout
- Use `.kainos-text-gradient` for main page headings
- Apply `.kainos-gradient` for hero sections and prominent headers
- Use `.btn-kainos` for primary call-to-action buttons
- Utilize DaisyUI's card components with Kainos color scheme

### Example Page Structure
```html
<div class="w-full max-w-7xl mx-auto">
  <!-- Page Header -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-5xl font-bold kainos-text-gradient">Page Title</h1>
    <a href="/action" class="btn btn-kainos">Primary Action</a>
  </div>
  
  <!-- Content Cards -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <!-- Card content -->
    </div>
  </div>
</div>
```

---

## Consistency Requirements

### New Pages Must:
1. ✅ Use Kainos color variables from CSS
2. ✅ Apply `.kainos-text-gradient` to main headings
3. ✅ Use `.btn-kainos` for primary action buttons
4. ✅ Maintain navy blue and green theme throughout
5. ✅ Follow existing layout patterns and spacing
6. ✅ Use DaisyUI components with Kainos color overrides

### Avoid:
- ❌ Hardcoded color values (use CSS variables instead)
- ❌ Colors outside the Kainos brand palette
- ❌ Inconsistent button styles
- ❌ Mixed design patterns

---

## Color Usage Examples

### Backgrounds
```html
<!-- Light background for cards -->
<div class="bg-kainos-light p-6 rounded-lg">
  Content here
</div>

<!-- Navy gradient for hero sections -->
<div class="kainos-gradient text-white p-12">
  Hero content
</div>
```

### Text
```html
<!-- Gradient heading -->
<h1 class="text-5xl font-bold kainos-text-gradient">
  Heading with gradient
</h1>

<!-- Navy text -->
<p class="text-kainos-primary">
  Important text in navy blue
</p>
```

### Buttons
```html
<!-- Primary action button -->
<button class="btn btn-kainos">
  Primary Action
</button>

<!-- Outline button -->
<button class="btn btn-kainos-outline">
  Secondary Action
</button>

<!-- DaisyUI button with Kainos color -->
<button class="btn btn-primary">
  Uses Kainos primary color
</button>
```

---

## Reference Files
- **CSS Source**: `/src/styles/input.css` - Contains all Kainos custom styles and variables
- **Tailwind Config**: `/tailwind.config.js` - Kainos color definitions for Tailwind
- **Example Pages**: 
  - `/views/index.njk` - Homepage with hero section
  - `/views/job-roles/job-role-list.njk` - Job listings page
  - `/views/job-roles/apply.njk` - Job application form
  - `/views/job-roles/detail.njk` - Job details page

---

## Tailwind Configuration

The Kainos colors are also configured in Tailwind for easy utility class usage:

```javascript
// tailwind.config.js
colors: {
  kainos: {
    primary: '#2B4C7E',
    secondary: '#1E3A5F',
    accent: '#7CB342',
    dark: '#152238',
    light: '#E8F0FF',
    green: '#7CB342',
    'green-light': '#A5D66A',
    'green-dark': '#5A8C30',
  },
}
```

Usage:
```html
<div class="bg-kainos-primary text-white">Navy background</div>
<div class="text-kainos-green">Green text</div>
<div class="border-kainos-primary">Navy border</div>
```

---

## Questions?
If you're unsure about styling for a new component or page:
1. Reference existing pages that already follow the Kainos design guidelines
2. Consult the CSS source file at `/src/styles/input.css`
3. Check the Tailwind config at `/tailwind.config.js`
4. Use DaisyUI components with Kainos color overrides
