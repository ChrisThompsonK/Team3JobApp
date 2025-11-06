import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Download } from '@playwright/test';

/**
 * CSV and File Utilities
 * Helper functions for file operations and CSV parsing
 */

/**
 * Get a safe temporary directory
 */
export const getTempDir = (): string => {
  const tempDir = process.env.TEMP || process.env.TMP || os.tmpdir();
  return tempDir;
};

/**
 * Save a downloaded file to the temp directory
 */
export const saveDownloadedFile = async (
  download: Download,
  filename?: string
): Promise<string> => {
  const suggestedFilename = filename || download.suggestedFilename();
  const filePath = path.join(getTempDir(), suggestedFilename);
  await download.saveAs(filePath);
  return filePath;
};

/**
 * Check if a file exists
 */
export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

/**
 * Read file content as UTF-8 string
 */
export const readFileContent = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf-8');
};

/**
 * Delete a file safely
 */
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(`Failed to delete file ${filePath}:`, error);
  }
};

/**
 * Parse a CSV line handling quoted fields and escaped quotes
 * @param line - A single CSV line
 * @returns Array of parsed field values
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
};

/**
 * Parse entire CSV content into a 2D array
 * @param csvContent - Full CSV content as string
 * @returns 2D array where each row is an array of field values
 */
export const parseCSV = (csvContent: string): string[][] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  return lines.map((line) => parseCSVLine(line));
};

/**
 * Extract CSV headers from content
 * @param csvContent - Full CSV content as string
 * @returns Array of header names
 */
export const getCSVHeaders = (csvContent: string): string[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];
  return parseCSVLine(lines[0]);
};

/**
 * Extract CSV data rows (excluding header)
 * @param csvContent - Full CSV content as string
 * @returns 2D array of data rows
 */
export const getCSVDataRows = (csvContent: string): string[][] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length <= 1) return []; // No data rows if only header
  return lines.slice(1).map((line) => parseCSVLine(line));
};

/**
 * Validate CSV has expected headers
 * @param csvContent - Full CSV content as string
 * @param expectedHeaders - Array of expected header names
 * @returns true if headers match
 */
export const validateCSVHeaders = (
  csvContent: string,
  expectedHeaders: string[]
): boolean => {
  const headers = getCSVHeaders(csvContent);
  return JSON.stringify(headers) === JSON.stringify(expectedHeaders);
};

/**
 * Get CSV row count (excluding header)
 * @param csvContent - Full CSV content as string
 * @returns Number of data rows
 */
export const getCSVRowCount = (csvContent: string): number => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  return Math.max(0, lines.length - 1); // Subtract header
};

/**
 * Validate that CSV filename matches expected pattern
 * @param filename - The filename to validate
 * @param pattern - Regex pattern to match
 * @returns true if filename matches pattern
 */
export const validateFilename = (filename: string, pattern: RegExp): boolean => {
  return pattern.test(filename);
};

/**
 * Extract date from CSV filename in format: job-roles-report-YYYY-MM-DD.csv
 * @param filename - The filename to extract date from
 * @returns Date object or null if format doesn't match
 */
export const extractDateFromFilename = (filename: string): Date | null => {
  const dateRegex = /job-roles-report-(\d{4})-(\d{2})-(\d{2})\.csv/;
  const match = filename.match(dateRegex);

  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  return new Date(year, month - 1, day);
};

/**
 * Validate date components are valid
 * @param year - Year value
 * @param month - Month value (1-12)
 * @param day - Day value (1-31)
 * @returns true if date components are valid
 */
export const isValidDateComponents = (
  year: number,
  month: number,
  day: number
): boolean => {
  return (
    year > 2020 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31
  );
};
