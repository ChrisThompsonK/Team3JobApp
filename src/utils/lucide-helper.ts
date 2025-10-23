import * as LucideIcons from 'lucide-static';

/**
 * Convert kebab-case or camelCase to PascalCase for Lucide icon names
 * e.g., 'chevron-down' -> 'ChevronDown', 'user' -> 'User'
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Generate Lucide icon SVG markup
 * @param name - The name of the Lucide icon (e.g., 'menu', 'user', 'check', 'chevron-down')
 * @param className - Optional CSS classes to apply to the icon
 * @param size - Optional size (defaults to current font size via em units)
 * @returns SVG string for the icon
 */
export function lucideIcon(
  name: string,
  className = '',
  size?: number | string,
): string {
  // Convert name to PascalCase for lucide-static
  const iconName = toPascalCase(name);
  
  // Get the icon from lucide-static
  const icon = LucideIcons[iconName as keyof typeof LucideIcons];

  if (!icon || typeof icon !== 'string') {
    console.warn(`Lucide icon "${name}" (${iconName}) not found.`);
    return `<!-- Icon "${name}" not found -->`;
  }

  // Parse the SVG string
  let svg = icon;

  // Add or merge class attribute
  if (className) {
    if (svg.includes('class="')) {
      // Append to existing class
      svg = svg.replace(/class="([^"]*)"/, `class="$1 ${className}"`);
    } else {
      // Add class attribute after the opening <svg tag
      svg = svg.replace('<svg', `<svg class="${className}"`);
    }
  }

  // Handle size
  if (size) {
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    // Replace existing width/height or add them
    if (svg.includes('width=')) {
      svg = svg.replace(/width="[^"]*"/, `width="${sizeValue}"`);
      svg = svg.replace(/height="[^"]*"/, `height="${sizeValue}"`);
    } else {
      svg = svg.replace('<svg', `<svg width="${sizeValue}" height="${sizeValue}"`);
    }
  }

  // Ensure currentColor for stroke
  if (!svg.includes('stroke=') && svg.includes('stroke-width')) {
    svg = svg.replace('<svg', '<svg stroke="currentColor"');
  }

  return svg;
}

/**
 * Get a safe HTML string that can be used in Nunjucks templates
 * This is the function that will be exposed to Nunjucks
 */
export function icon(name: string, className = ''): string {
  return lucideIcon(name, className);
}
