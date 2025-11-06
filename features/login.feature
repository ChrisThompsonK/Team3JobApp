Feature: User Login
  As a user
  I want to log in to the application
  So that I can access protected features like job applications

  Scenario: User can register and log in
    Given I am on the register page
    When I fill in the registration form with:
      | field            | value                      |
      | email            | testuser@example.com       |
      | password         | TestPassword123!           |
      | confirmPassword  | TestPassword123!           |
    And I click the register button
    Then I should be logged in
    And I should be redirected to the home page

  Scenario: User can log out
    Given I am logged in as testuser@example.com with password TestPassword123!
    When I click the logout button
    Then I should be logged out
    And I should be redirected to the home page

  Scenario: User cannot log in with wrong password
    Given I am on the login page
    When I fill in the login form with:
      | field    | value                |
      | email    | testuser@example.com |
      | password | WrongPassword123!    |
    And I click the login button
    Then I should see an error message about invalid credentials
    And I should remain on the login page
