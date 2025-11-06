Feature: Submit Job Application (Authenticated User)
  As an authenticated user
  I want to submit a job application
  So that I can apply for positions on the job portal

  Background:
    Given I am logged in as a test user
    And I navigate to the job application page for job "1"

  @form
  Scenario: Display application form with all required fields
    When I view the application form
    Then the form should display all required fields:
      | fieldId          | fieldType |
      | firstName        | input     |
      | lastName         | input     |
      | email            | input     |
      | phone            | input     |
      | countryCode      | select    |
      | currentJobTitle  | input     |
      | yearsOfExperience| select    |
      | linkedinUrl      | input     |
      | cv               | input     |
      | coverLetter      | textarea  |
      | additionalComments| textarea  |
      | acceptTerms      | checkbox  |
    And the submit button should be visible

  @form
  Scenario: Display job role summary information
    When I view the job application page
    Then the job role card should display relevant information
    And the card text should be visible

  @validation
  Scenario: Prevent submission with empty required fields
    When I attempt to submit the form without filling any fields
    Then the form should still be visible
    And submission should be prevented

  @validation
  Scenario: Validate email format
    When I enter an invalid email format "invalid-email"
    And I attempt to submit the form
    Then the form should still be visible
    And browser validation should prevent submission

  @submission
  Scenario: Accept valid application with all required fields
    When I fill the application form with valid data:
      | field                | value                                    |
      | firstName            | Test                                     |
      | lastName             | User{timestamp}                          |
      | email                | test-apply-{timestamp}@example.com       |
      | countryCode          | +44                                      |
      | phone                | 7700900000                               |
      | currentJobTitle      | Senior Software Engineer                 |
      | yearsOfExperience    | 5-10                                     |
      | linkedinUrl          | https://www.linkedin.com/in/testprofile |
      | coverLetter          | I am very interested in this position    |
      | additionalComments   | Looking forward to this opportunity      |
    And I accept the terms and conditions
    And I submit the form
    Then the form should be successfully submitted
    And I should see a success message or confirmation
    And I should be redirected to the job details page

  @multitenant
  Scenario: Support multiple country phone codes
    When I test phone codes for different countries:
      | countryCode | phone      |
      | +44         | 7700900000 |
      | +1          | 5551234567 |
      | +91         | 9876543210 |
      | +61         | 412345678  |
    Then each country code should be properly selected in the form
    And phone numbers should be accepted for each country

  @upload
  Scenario: Allow file upload for CV
    When I fill the form with valid data including CV upload
    And I upload a PDF file for the CV
    Then the file should be successfully attached to the form
    And the file input should have a value

  @validation
  Scenario: Prevent submission without terms acceptance
    When I fill all required fields with valid data
    And I do not accept the terms and conditions
    And I attempt to submit the form
    Then the form should still be visible
    And submission should be prevented

  @validation
  Scenario: Preserve form data on validation error
    When I fill the form with data:
      | field                | value                          |
      | firstName            | Preserved                      |
      | lastName             | Data                           |
      | email                | preserved@example.com          |
      | currentJobTitle      | Test Engineer                  |
      | yearsOfExperience    | 5-10                           |
      | linkedinUrl          | https://www.linkedin.com/in/test |
      | coverLetter          | This is my cover letter text    |
      | additionalComments   | Additional information here    |
    And I attempt to submit without all required fields
    Then the form data should be preserved in the form fields

  @validation
  Scenario: Show error for invalid LinkedIn URL
    When I fill the form with an invalid LinkedIn URL "not-a-valid-url"
    And I attempt to submit the form
    Then browser validation should detect the invalid URL

  @special-characters
  Scenario: Handle special characters in cover letter
    When I fill the form with special characters in the cover letter:
      | field       | value                        |
      | firstName   | Test                         |
      | lastName    | SpecialChars                 |
      | email       | test-special@example.com     |
      | coverLetter | I am excited! • (bullet) & C++ |
    Then the special characters should be properly preserved
    And the form should accept the special character content

  @navigation
  Scenario: Navigate back to job details
    When I click the back button
    Then I should be redirected to the job details page

  @authentication
  Scenario: Not allow non-authenticated user to access apply page
    Given I am not logged in
    When I navigate directly to the apply page
    Then I should be redirected to the login page
    And the login form should be visible

  @duplicate-prevention
  Scenario: Prevent duplicate applications to same job
    When I submit a valid application to a job
    And the application is successfully submitted
    And I navigate back to apply for the same job again
    And I submit another application with the same details
    Then an error message should indicate that I've already applied to this job
    And the duplicate application should be prevented
