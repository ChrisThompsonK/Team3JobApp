# Kainos Branding - Updated to Match Official Website

## ✅ Colors & Typography Updated

**CORRECTED**: Colors and typography now match the official Kainos website (https://www.kainos.com):

- **Primary Color**: Purple/Magenta (#D946EF) - matches official site
- **Secondary Color**: Lighter Purple (#A855F7) 
- **Accent Color**: Pink (#EC4899)
- **Typography**: Inter font family (same as official site)
- **Design**: Clean, minimal white background with lots of space

## Official Logo Still Needed

**OFFICIAL LOGO FOUND**: You have access to the official Kainos logo at:
https://share.google/images/pC89b11cIM5RB7y1G

## Steps to Replace Current Logo

1. **Download the Official Logo**:
   - Access: https://share.google/images/pC89b11cIM5RB7y1G
   - Download in highest quality available
   - Preferred formats: SVG (vector) or high-resolution PNG with transparent background

2. **Replace the Logo Files**:
   - Save the official logo as: `public/images/kainos-logo.svg` (or `.png`)
   - If PNG format, update the HTML references from `.svg` to `.png`
   - Create a smaller version for favicon: `public/favicon.svg` (or `.png`)

3. **Update File References** (if changing from SVG to PNG):
   ```html
   <!-- In views/layout.njk, change: -->
   <img src="/images/kainos-logo.svg" alt="Kainos" class="kainos-logo">
   <!-- To: -->
   <img src="/images/kainos-logo.png" alt="Kainos" class="kainos-logo">
   
   <!-- Also update favicon reference in layout.njk: -->
   <link rel="icon" href="/favicon.svg" type="image/svg+xml">
   <!-- To: -->
   <link rel="icon" href="/favicon.png" type="image/png">
   ```

## Files Currently Using Logo

- `views/layout.njk` - Header and footer logo references
- `public/images/kainos-logo.svg` - Main logo file (REPLACE THIS)
- `public/favicon.svg` - Browser favicon (REPLACE THIS)

## Backup Created

- `public/images/kainos-logo-placeholder.svg` - Backup of current placeholder

## After Logo Replacement

1. **Test the Logo**:
   - Run `npm run dev` 
   - Visit http://localhost:3000
   - Check that logo displays correctly in header and footer
   - Verify favicon appears in browser tab

2. **Optimize Logo Size**:
   - Ensure logo file size is reasonable for web (<100KB preferred)
   - Check logo displays well at different screen sizes
   - Test logo readability on both light and dark backgrounds