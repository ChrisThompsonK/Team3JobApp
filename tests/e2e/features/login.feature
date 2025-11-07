Feature: User Login
  As a user
  I want to log in to the application
  So that I can access my applications and features

  Scenario: Regular user logs in successfully
    When I log in as a regular user
    Then I should be redirected away from the login page

  Scenario: Admin user logs in successfully
    When I log in as an admin user
    Then I should be redirected away from the login page
