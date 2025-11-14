import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware to detect suspicious URL manipulation attempts
 * Redirects to a fun "hacker detected" page for common attack patterns
 */
export const hackerDetector = (req: Request, res: Response, next: NextFunction): void => {
  // List of legitimate route patterns - anything not matching these is suspicious
  const legitimateRoutes = [
    /^\/$/,                                    // Home page
    /^\/daisyui-test$/,                       // Test page
    /^\/auth\/(login|register|logout|profile)$/,  // Auth routes
    /^\/analytics$/,                          // Analytics dashboard
    /^\/my-applications$/,                    // User applications
    /^\/jobs$/,                               // Job list
    /^\/jobs\/new$/,                          // New job form
    /^\/jobs\/report$/,                       // Jobs report
    /^\/jobs\/\d+$/,                          // Job by ID (numeric only)
    /^\/jobs\/\d+\/(details|edit|apply)$/,    // Job sub-routes
    /^\/jobs\/\d+\/hire\/\d+$/,              // Hire applicant
    /^\/jobs\/\d+\/reject\/\d+$/,            // Reject applicant
    /^\/jobs\/\d+\/delete$/,                  // Delete job
    /^\/applications\/\d+\/withdraw$/,        // Withdraw application
    /^\/css\/.*\.css$/,                       // CSS files
    /^\/images\/.*\.(png|jpg|jpeg|gif|svg|ico)$/i, // Image files
    /^\/js\/.*\.js$/,                         // JS files
    /^\/uploads\//,                           // Upload files
    /^\/favicon\.ico$/,                       // Favicon
  ];

  const suspiciousPatterns = [
    /--/, // SQL injection attempts (double dash comments)
    /\.\.\/|\.\.\\/, // Path traversal attempts
    /<script>/i, // XSS attempts
    /;/, // Command injection attempts (but allow in query strings)
    /\${/, // Template injection attempts
    /%00|%0d|%0a/i, // Null byte / newline injection
    /\bunion\b.*\bselect\b/i, // SQL union-based injection
    /\bor\b.*\b1\s*=\s*1\b/i, // SQL boolean-based injection
    /\bdrop\b.*\btable\b/i, // SQL drop table attempts
    /\bexec\b|\bexecute\b/i, // SQL execute attempts
    /\|{2}|&{2}/, // Command chaining attempts (|| or &&)
    /`.*`/, // Backtick command execution
    /\$\(.*\)/, // Command substitution
    /\balert\b.*\(/i, // JavaScript alert XSS
    /javascript:/i, // JavaScript protocol
    /on\w+\s*=/i, // Event handler attributes
    /\beval\b.*\(/i, // Eval injection attempts
    /__proto__|prototype/i, // Prototype pollution attempts
  ];

  const url = req.originalUrl;
  const path = req.path;
  
  // Decode for pattern matching but keep original for display
  let decodedUrl = url;
  let decodedPath = path;
  try {
    decodedUrl = decodeURIComponent(url);
    decodedPath = decodeURIComponent(path);
  } catch {
    // Invalid URI encoding is suspicious
    renderHackerPage(res, req);
    return;
  }

  const params = JSON.stringify(req.query);

  // Check if the URL matches any suspicious patterns
  const hasSuspiciousPattern = suspiciousPatterns.some(
    (pattern) => pattern.test(decodedUrl) || pattern.test(decodedPath) || pattern.test(params)
  );

  // Check if the path matches any legitimate route (excluding query strings)
  const pathOnly = decodedPath.split('?')[0] || decodedPath;
  const isLegitimateRoute = legitimateRoutes.some((pattern) => pattern.test(pathOnly));

  // Trigger hacker page if suspicious pattern found OR if route is not legitimate
  if (hasSuspiciousPattern || !isLegitimateRoute) {
    renderHackerPage(res, req);
    return;
  }

  next();
};

/**
 * Render the hacker detected page
 */
function renderHackerPage(res: Response, req: Request): void {
  // Log the attempt (for fun, not serious security logging)
  console.log(`🚨 Suspicious activity detected: ${req.method} ${req.originalUrl}`);
  console.log(`   User Agent: ${req.get('user-agent')}`);
  console.log(`   IP: ${req.ip}`);

  // Render the fun hacker-detected page
  res.status(403).render('hacker-detected', {
    title: 'Hacker Detected!',
    url: req.originalUrl,
    method: req.method,
    Math: Math, // Pass Math object for random number generation in template
  });
}
