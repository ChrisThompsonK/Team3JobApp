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

      // Calculate statistics server-side
      const {
        applicationsCreatedToday,
        applicationsHiredToday,
        applicationsRejectedToday,
        applicationsAcceptedToday,
      } = analyticsData.data;
      const total = applicationsCreatedToday || 1; // Avoid division by zero

      const hiredPercentage = ((applicationsHiredToday / total) * 100).toFixed(1);
      const rejectedPercentage = ((applicationsRejectedToday / total) * 100).toFixed(1);
      const acceptedPercentage = ((applicationsAcceptedToday / total) * 100).toFixed(1);

      // Get today's date for the date picker max attribute
      const today = new Date().toISOString().split('T')[0];

      // Render the analytics page with the data
      res.render('analytics/dashboard', {
        title: 'Analytics Dashboard',
        user: req.user,
        analytics: analyticsData.data,
        selectedDate: analyticsData.date,
        today,
        statistics: {
          hiredPercentage,
          rejectedPercentage,
          acceptedPercentage,
          conversionRate: hiredPercentage,
          rejectionRate: rejectedPercentage,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).render('error', {
        message: 'Unable to load analytics data',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
