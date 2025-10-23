import type { Request, Response } from 'express';
import { api } from '../services/api.js';

export class AnalyticsController {
  /**
   * Render the analytics dashboard page (admin only)
   */
  async getAnalyticsDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Get the date from query parameter (defaults to today if not provided)
      const { date } = req.query;
      const selectedDate = date && typeof date === 'string' ? date : undefined;

      // Get access token from request
      const accessToken = req.accessToken;

      // Fetch analytics data from backend
      const analyticsData = await api.getApplicationAnalytics(selectedDate, accessToken);

      // Render the analytics page with the data
      res.render('analytics/dashboard', {
        title: 'Analytics Dashboard',
        user: req.user,
        analytics: analyticsData.data,
        selectedDate: analyticsData.date,
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).render('error', {
        message: 'Unable to load analytics data',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }

  /**
   * Get analytics data as JSON for AJAX requests (admin only)
   */
  async getAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query;
      const selectedDate = date && typeof date === 'string' ? date : undefined;

      // Get access token from request
      const accessToken = req.accessToken;

      const analyticsData = await api.getApplicationAnalytics(selectedDate, accessToken);
      res.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch analytics data',
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
