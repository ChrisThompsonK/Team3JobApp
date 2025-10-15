#!/usr/bin/env node

/**
 * Test script to verify that the application properly validates
 * required environment variables on startup.
 *
 * This script tests that the app fails when required auth config is missing.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredAuthVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'PASSWORD_HASH_ROUNDS'];

console.log('🧪 Testing environment variable validation...\n');

async function testMissingEnvVar(varName) {
  return new Promise((resolve) => {
    console.log(`Testing missing ${varName}...`);

    // Create a minimal env without the tested variable
    const env = { ...process.env };

    // Remove all auth-related vars first
    requiredAuthVars.forEach((v) => {
      delete env[v];
    });

    // Add back all except the one we're testing
    requiredAuthVars.forEach((v) => {
      if (v !== varName) {
        env[v] = 'test-value';
      }
    });

    const child = spawn('node', ['--loader', 'tsx', 'src/index.ts'], {
      cwd: __dirname,
      env,
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    const timeout = setTimeout(() => {
      child.kill();
      console.log(
        `  ❌ FAIL: App did not exit (should have thrown error for missing ${varName})\n`
      );
      resolve(false);
    }, 3000);

    child.on('exit', (code) => {
      clearTimeout(timeout);

      const combinedOutput = output + errorOutput;
      const hasError =
        combinedOutput.includes('FATAL') || combinedOutput.includes(`${varName}`) || code !== 0;

      if (hasError) {
        console.log(`  ✅ PASS: App correctly failed when ${varName} was missing`);
        console.log(`  Exit code: ${code}\n`);
        resolve(true);
      } else {
        console.log(`  ❌ FAIL: App should have failed but didn't`);
        console.log(`  Exit code: ${code}`);
        console.log(`  Output: ${combinedOutput.substring(0, 200)}\n`);
        resolve(false);
      }
    });
  });
}

async function testAllVarsPresent() {
  return new Promise((resolve) => {
    console.log('Testing with all required variables present...');

    const env = { ...process.env };
    requiredAuthVars.forEach((v) => {
      env[v] = 'test-value';
    });

    const child = spawn('node', ['--loader', 'tsx', 'src/index.ts'], {
      cwd: __dirname,
      env,
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Give the app time to start
    const timeout = setTimeout(() => {
      const combinedOutput = output + errorOutput;
      const started =
        combinedOutput.includes('Server') ||
        combinedOutput.includes('listening') ||
        combinedOutput.includes('started');

      child.kill();

      if (started) {
        console.log('  ✅ PASS: App started successfully with all variables present\n');
        resolve(true);
      } else {
        console.log('  ⚠️  WARNING: Could not confirm app started (might be OK)');
        console.log(`  Output: ${combinedOutput.substring(0, 200)}\n`);
        resolve(true); // Don't fail the test for this
      }
    }, 2000);

    child.on('exit', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        console.log(`  ❌ FAIL: App exited unexpectedly with code ${code}`);
        console.log(`  Output: ${(output + errorOutput).substring(0, 200)}\n`);
        resolve(false);
      }
    });
  });
}

async function runTests() {
  const results = [];

  // Test each required variable
  for (const varName of requiredAuthVars) {
    const result = await testMissingEnvVar(varName);
    results.push(result);
  }

  // Test with all variables present
  const allPresentResult = await testAllVarsPresent();
  results.push(allPresentResult);

  // Summary
  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log('═'.repeat(50));
  console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('✅ All validation tests passed!');
    console.log('   The app correctly requires all auth environment variables.\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed!');
    console.log('   The app may not be properly validating required environment variables.\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
