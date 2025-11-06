Feature: Job Portal User Experience
  As a job seeker
  I want to browse and apply for jobs
  So that I can find employment opportunities

  Background:
    Given I am on the job portal home page

  Scenario: View available job listings
    When I navigate to the job listings page
    Then I should see a list of available job roles
    And each job listing should display the job title and location

  Scenario: Search for specific job roles
    When I search for "Software Engineer" jobs
    Then I should see only Software Engineer positions
    And the search results should be filtered accordingly

  Scenario: View detailed job information
    When I click on a job listing
    Then I should see detailed job information including:
      | Job Title       |
      | Location        |
      | Salary Range    |
      | Job Description |
      | Requirements    |

  Scenario: Apply for a job position
    Given I am logged into the job portal
    When I view a job listing
    And I click the "Apply Now" button
    Then I should be able to submit my application
    And I should receive confirmation of my application

  Scenario: User registration and login
    Given I am a new user
    When I register for an account with valid details
    Then I should be able to log in successfully
    And I should have access to my profile

  Scenario: View application history
    Given I am logged into the job portal
    And I have applied for jobs previously
    When I navigate to my applications page
    Then I should see a list of my job applications
    And the status of each application