Feature: Job Listings
  As a user
  I want to view job listings
  So that I can find and apply for jobs

  Scenario: Display job listings page
    When I navigate to the job listings page
    Then I should be on the job listings page

  Scenario: View job details
    When I navigate to the job listings page
    And I click on the first job listing
    Then the job details page should load
