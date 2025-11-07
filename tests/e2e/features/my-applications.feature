Feature: My Applications
  As a regular user
  I want to view and manage my job applications
  So that I can track my job application status

  Scenario: Regular user can see their applications list
    When I log in as a regular user
    And I click the My Applications button
    Then I should see the applications page

  Scenario: User can return to home from My Applications
    When I log in as a regular user
    And I click the My Applications button
    And I click the back to home button
    Then I should be on the home page

  Scenario: User can navigate using Kainos logo
    When I log in as a regular user
    And I click the My Applications button
    And I click the Kainos logo
    Then I should be on the home page
