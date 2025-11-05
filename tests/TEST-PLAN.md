# Kainos Job Portal - Test Plan

## Application Overview
The Kainos Job Portal is a comprehensive job application system with role-based access (Admin and User) for managing job postings and applications.

---

## Identified User Flows

### 1. **Authentication Flows**
- User login (admin/regular user)
- User registration
- User logout
- Session persistence
- Protected route access

### 2. **Home Page Flows**
- View homepage as anonymous user
- View homepage as authenticated user  
- Search jobs from homepage
- Navigate to job listings
- Navigate to My Applications (authenticated users)

### 3. **Job Listings Flows**
- Browse all jobs
- Search jobs by keyword
- Filter jobs by:
  - Location
  - Capability
  - Band
- Sort jobs by various criteria
- Paginate through job results
- View job details

### 4. **Job Details & Application Flows (Regular User)**
- View job details
- Apply for a job
- Upload CV/Resume
- Submit application with cover letter
- View application confirmation
- Check application status
- View "My Applications" page
- Withdraw application

### 5. **Admin Job Management Flows**
- Create new job posting
- Edit existing job posting
- Delete job posting
- View all applications for a job
- Review application details
- Hire applicant
- Reject applicant
- Generate job roles report
- View analytics dashboard

### 6. **My Applications Flow (User)**
- View all submitted applications
- Track application status
- Filter/sort own applications
- Withdraw pending applications

---

## Comprehensive Test Cases

### **Authentication Test Cases**
1. ✅ TC-AUTH-001: Display login page correctly
2. TC-AUTH-002: Login with valid admin credentials
3. TC-AUTH-003: Login with valid user credentials
4. TC-AUTH-004: Login fails with invalid email format
5. TC-AUTH-005: Login fails with wrong password
6. TC-AUTH-006: Login fails with non-existent user
7. TC-AUTH-007: Show validation errors for empty form
8. TC-AUTH-008: Navigate to register page
9. TC-AUTH-009: Successfully register new user
10. TC-AUTH-010: Logout successfully
11. TC-AUTH-011: Session persists across page refresh
12. TC-AUTH-012: Redirect to login when accessing protected pages
13. TC-AUTH-013: Remember me functionality

### **Home Page Test Cases**
14. TC-HOME-001: Display homepage correctly
15. TC-HOME-002: Search jobs from homepage
16. TC-HOME-003: Navigate to all jobs
17. TC-HOME-004: Navigate to My Applications (authenticated)
18. TC-HOME-005: Show different UI for admin vs user
19. TC-HOME-006: Display Kainos branding correctly

### **Job Listings Test Cases**
20. TC-JOBS-001: Display job listings page
21. TC-JOBS-002: Display job cards when jobs available
22. TC-JOBS-003: Search jobs by keyword
23. TC-JOBS-004: Filter jobs by location
24. TC-JOBS-005: Filter jobs by capability
25. TC-JOBS-006: Filter jobs by band
26. TC-JOBS-007: Combine multiple filters
27. TC-JOBS-008: Sort jobs ascending
28. TC-JOBS-009: Sort jobs descending
29. TC-JOBS-010: Clear all filters
30. TC-JOBS-011: Paginate through results
31. TC-JOBS-012: Handle empty job listings
32. TC-JOBS-013: Click on job card to view details
33. TC-JOBS-014: Show "Add New Job" button for admin
34. TC-JOBS-015: Show job count correctly

### **Job Application Test Cases (User)**
35. TC-APPLY-001: View job details page
36. TC-APPLY-002: Display job information correctly
37. TC-APPLY-003: Show "Apply" button for authenticated users
38. TC-APPLY-004: Navigate to application form
39. TC-APPLY-005: Fill application form with valid data
40. TC-APPLY-006: Upload CV successfully
41. TC-APPLY-007: Submit application successfully
42. TC-APPLY-008: Show success message after submission
43. TC-APPLY-009: Validation: required fields
44. TC-APPLY-010: Validation: email format
45. TC-APPLY-011: Validation: phone number format
46. TC-APPLY-012: Validation: file upload type
47. TC-APPLY-013: Validation: file upload size
48. TC-APPLY-014: Show "Already Applied" message
49. TC-APPLY-015: Cannot apply to closed positions

### **My Applications Test Cases (User)**
50. TC-MYAPP-001: View My Applications page
51. TC-MYAPP-002: Display all user applications
52. TC-MYAPP-003: Show application status correctly
53. TC-MYAPP-004: Filter applications by status
54. TC-MYAPP-005: Sort applications
55. TC-MYAPP-006: View application details
56. TC-MYAPP-007: Withdraw pending application
57. TC-MYAPP-008: Cannot withdraw accepted/rejected applications

### **Admin - Create Job Test Cases**
59. TC-ADMIN-CREATE-001: Navigate to create job form
60. TC-ADMIN-CREATE-002: Fill all required fields
61. TC-ADMIN-CREATE-003: Set closing date
62. TC-ADMIN-CREATE-004: Set number of open positions
63. TC-ADMIN-CREATE-005: Add job description
64. TC-ADMIN-CREATE-006: Add responsibilities
65. TC-ADMIN-CREATE-007: Submit job successfully
66. TC-ADMIN-CREATE-008: Validation: required fields
67. TC-ADMIN-CREATE-009: Validation: date format
68. TC-ADMIN-CREATE-010: Validation: numeric fields

### **Admin - Edit Job Test Cases**
69. TC-ADMIN-EDIT-001: Navigate to edit job form
70. TC-ADMIN-EDIT-002: Pre-populate form with existing data
71. TC-ADMIN-EDIT-003: Update job details
72. TC-ADMIN-EDIT-004: Save changes successfully
73. TC-ADMIN-EDIT-005: Cancel edit operation

### **Admin - Delete Job Test Cases**
74. TC-ADMIN-DELETE-001: Show delete button
75. TC-ADMIN-DELETE-002: Confirm deletion dialog
76. TC-ADMIN-DELETE-003: Delete job successfully
77. TC-ADMIN-DELETE-004: Cancel deletion

### **Admin - Application Management Test Cases**
78. TC-ADMIN-APP-001: View all applications for a job
79. TC-ADMIN-APP-002: View application details modal
80. TC-ADMIN-APP-003: View applicant CV
81. TC-ADMIN-APP-004: Hire applicant
82. TC-ADMIN-APP-005: Verify open positions decrease
83. TC-ADMIN-APP-006: Reject applicant
84. TC-ADMIN-APP-007: Update application status
85. TC-ADMIN-APP-008: Cannot hire when no open positions
86. TC-ADMIN-APP-009: Filter applications by status
87. TC-ADMIN-APP-010: Sort applications

### **Admin - Analytics Test Cases**
88. TC-ADMIN-ANALYTICS-001: Access analytics dashboard
89. TC-ADMIN-ANALYTICS-002: View job statistics
90. TC-ADMIN-ANALYTICS-003: View application metrics
91. TC-ADMIN-ANALYTICS-004: Generate reports
92. TC-ADMIN-ANALYTICS-005: Export data

### **Cross-Functional Test Cases**
93. TC-CF-001: Mobile responsive - homepage
94. TC-CF-002: Mobile responsive - job listings
95. TC-CF-003: Mobile responsive - application form
96. TC-CF-004: Browser compatibility (Chrome, Firefox, Safari)
97. TC-CF-005: Performance - page load times
98. TC-CF-006: Accessibility - keyboard navigation
99. TC-CF-007: Accessibility - screen reader support
100. TC-CF-008: Security - SQL injection prevention
101. TC-CF-009: Security - XSS prevention
102. TC-CF-010: Session timeout handling

---

## Priority Classification

### **P0 - Critical (Must Have)**
- Authentication flows
- Job listings display
- Job application submission
- Admin job management

### **P1 - High (Should Have)**
- Search and filter functionality
- My Applications page
- Application status updates
- File upload

### **P2 - Medium (Nice to Have)**
- Analytics dashboard
- Report generation
- Advanced filtering
- Mobile responsiveness

### **P3 - Low (Future Enhancement)**
- Performance optimization
- Advanced accessibility
- Email notifications

---

## Test Environment
- **Base URL**: http://localhost:3000
- **Test Users**:
  - Admin: admin@example.com / ChangeMe123!
  - Regular User: (needs to be created)
- **Browsers**: Chrome, Firefox, Safari (WebKit)
- **Test Framework**: Playwright + TypeScript

---

## Automated Test Coverage Target
- **Phase 1 (Current)**: 20% - Basic authentication and navigation
- **Phase 2 (Next Sprint)**: 50% - Core user and admin flows
- **Phase 3 (Future)**: 80% - Complete E2E coverage

---

## Notes
- All tests should include proper error handling
- Screenshots and videos captured on failure
- Traces enabled for debugging
- Page Object Model pattern for maintainability
