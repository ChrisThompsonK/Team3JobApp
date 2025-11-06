Feature: Job Application Portal Homepage
  As a user
  I want to view the homepage
  So that I can navigate to different sections of the job portal

  Scenario: Load the homepage successfully
    When I navigate to the homepage
    Then the page title should contain "Kainos Job Portal"

  Scenario: Display main navigation
    When I navigate to the homepage
    Then the main navigation should be visible
