# Tailwind CSS Setup

This project now uses Tailwind CSS v4 with the CLI approach for styling.

## Files Structure

```
src/
  styles/
    input.css          # Tailwind input file with @import and @theme
public/
  css/
    output.css         # Generated CSS file (served by Express)
views/
  *.njk              # Nunjucks templates using Tailwind classes
```

## Available Scripts

- `npm run build:css` - Build CSS once
- `npm run build:css:watch` - Watch for changes and rebuild CSS automatically
- `npm run build:css:prod` - Build minified CSS for production

## Development Workflow

1. **Start the CSS watcher** (in one terminal):
   ```bash
   npm run build:css:watch
   ```

2. **Start the development server** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Add Tailwind classes** to your `.njk` templates
4. The CSS will rebuild automatically when you save changes

## Customization

Edit `src/styles/input.css` to customize your theme:

```css
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-brand-primary: #007acc;
  --color-brand-secondary: #0366d6;
  
  /* Custom fonts */
  --font-family-heading: "Inter", sans-serif;
  
  /* Custom breakpoints */
  --breakpoint-3xl: 1920px;
}
```

## Example Tailwind Classes Used

- `bg-gray-100` - Light gray background
- `max-w-3xl` - Maximum width
- `mx-auto` - Center horizontally
- `p-10` - Padding on all sides
- `rounded-lg` - Rounded corners
- `shadow-lg` - Large shadow
- `text-blue-600` - Blue text color
- `hover:text-blue-800` - Darker blue on hover

## Production Build

For production, use the minified CSS:

```bash
npm run build:css:prod
```

This generates a smaller, optimized CSS file.