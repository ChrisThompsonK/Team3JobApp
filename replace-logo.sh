#!/bin/bash

# Kainos Logo Replacement Script
# Usage: ./replace-logo.sh path/to/your/official-logo.svg

echo "🎨 Kainos Logo Replacement Script"
echo "=================================="

if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide the path to your official Kainos logo file"
    echo "Usage: ./replace-logo.sh path/to/your/official-logo.svg"
    echo ""
    echo "Example:"
    echo "  ./replace-logo.sh ~/Downloads/kainos-official-logo.svg"
    exit 1
fi

LOGO_FILE="$1"

# Check if file exists
if [ ! -f "$LOGO_FILE" ]; then
    echo "❌ Error: File '$LOGO_FILE' not found"
    exit 1
fi

# Get file extension
EXTENSION="${LOGO_FILE##*.}"
echo "📁 Logo file: $LOGO_FILE"
echo "📄 File type: $EXTENSION"

# Copy the logo to the correct location
echo "📋 Copying logo to public/images/kainos-logo.$EXTENSION"
cp "$LOGO_FILE" "public/images/kainos-logo.$EXTENSION"

# Create favicon from logo (basic copy - you may want to resize)
echo "🔖 Creating favicon"
cp "$LOGO_FILE" "public/favicon.$EXTENSION"

# If it's not SVG, remind user to update HTML references
if [ "$EXTENSION" != "svg" ]; then
    echo ""
    echo "⚠️  IMPORTANT: Your logo is not SVG format"
    echo "   You need to update the HTML references in views/layout.njk"
    echo "   Change .svg to .$EXTENSION in the img src and favicon link"
    echo ""
    echo "   Current references:"
    echo "   - <img src=\"/images/kainos-logo.svg\" ...>"
    echo "   - <link rel=\"icon\" href=\"/favicon.svg\" ...>"
    echo ""
    echo "   Should become:"
    echo "   - <img src=\"/images/kainos-logo.$EXTENSION\" ...>"
    echo "   - <link rel=\"icon\" href=\"/favicon.$EXTENSION\" ...>"
fi

echo ""
echo "✅ Logo replacement complete!"
echo "🚀 Run 'npm run dev' and visit http://localhost:3000 to see your logo"
echo ""
echo "📝 Next steps:"
echo "   1. Test logo display on website"
echo "   2. Check favicon in browser tab"
echo "   3. Verify logo looks good at different sizes"
echo "   4. Update any color schemes if needed"