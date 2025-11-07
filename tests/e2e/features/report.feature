Feature: Report Generation
  As an admin user
  I want to generate CSV reports of available jobs
  So that I can analyze and export job data

  Scenario: Admin user can see Report button on job listings
    When I log in as an admin user
    And I navigate to job listings
    Then I should see the Report button
