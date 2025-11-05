/**
 * Test Data Factory
 *
 * Provides standardized test data for the Kainos Job Portal tests
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

export interface TestJobRole {
  title: string;
  description: string;
  department: string;
  location: string;
  salary: string;
  requirements: string[];
  benefits: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'temporary';
}

export interface TestApplication {
  jobId: string;
  applicantEmail: string;
  coverLetter: string;
  resumePath?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

/**
 * Test user data
 */
export const testUsers: Record<string, TestUser> = {
  // Default test users - using actual seeded credentials
  admin: {
    email: 'admin@example.com',
    password: 'ChangeMe123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  } as const,

  user: {
    email: 'admin@example.com', // Using admin for now until we can seed regular users
    password: 'ChangeMe123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin', // Will act as user in tests
  } as const,

  candidate: {
    email: 'candidate@test.com',
    password: 'Candidate123!',
    firstName: 'Jane',
    lastName: 'Candidate',
    role: 'user',
  },
};

/**
 * Test job roles data
 */
export const testJobRoles: Record<string, TestJobRole> = {
  softwareEngineer: {
    title: 'Software Engineer',
    description: 'Join our dynamic software engineering team to build innovative solutions.',
    department: 'Engineering',
    location: 'Belfast',
    salary: '£35,000 - £45,000',
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      '2+ years of software development experience',
      'Proficiency in JavaScript, TypeScript, or similar languages',
      'Experience with modern web frameworks',
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Flexible working hours',
      'Professional development opportunities',
    ],
    type: 'full-time',
  },

  projectManager: {
    title: 'Project Manager',
    description: 'Lead cross-functional teams to deliver exceptional client solutions.',
    department: 'Management',
    location: 'London',
    salary: '£45,000 - £55,000',
    requirements: [
      'PMP or similar project management certification',
      '3+ years of project management experience',
      'Strong leadership and communication skills',
      'Experience with Agile methodologies',
    ],
    benefits: [
      'Competitive salary',
      'Performance bonuses',
      'Training and certification support',
      'Remote working options',
    ],
    type: 'full-time',
  },

  uxDesigner: {
    title: 'UX Designer',
    description: 'Create intuitive user experiences for our digital products.',
    department: 'Design',
    location: 'Edinburgh',
    salary: '£30,000 - £40,000',
    requirements: [
      'Portfolio demonstrating UX design skills',
      'Proficiency in design tools (Figma, Sketch, Adobe XD)',
      '2+ years of UX design experience',
      'Understanding of user research methodologies',
    ],
    benefits: [
      'Creative freedom',
      'Latest design tools and hardware',
      'Conference attendance',
      'Collaborative work environment',
    ],
    type: 'full-time',
  },
};

/**
 * Invalid test data for negative testing
 */
export const invalidTestData = {
  users: {
    invalidEmail: {
      email: 'invalid-email',
      password: 'ValidPassword123!',
    },
    shortPassword: {
      email: 'test@kainos.com',
      password: '123',
    },
    emptyFields: {
      email: '',
      password: '',
    },
  },

  jobRoles: {
    missingTitle: {
      title: '',
      description: 'A job without a title',
      department: 'Engineering',
      location: 'Belfast',
    },
    missingDepartment: {
      title: 'Test Job',
      description: 'A job without a department',
      department: '',
      location: 'London',
    },
  },
};

/**
 * Helper functions for generating test data
 */
export namespace TestDataGenerator {
  /**
   * Generate a unique email for testing
   */
  export function generateUniqueEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}@kainos.com`;
  }

  /**
   * Generate a unique job title
   */
  export function generateUniqueJobTitle(baseTitle: string = 'Test Job'): string {
    const timestamp = Date.now();
    return `${baseTitle} ${timestamp}`;
  }

  /**
   * Generate random user data
   */
  export function generateRandomUser(): TestUser {
    const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
    const surnames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Garcia'];

    const firstName = names[Math.floor(Math.random() * names.length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];

    return {
      email: generateUniqueEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}`),
      password: 'TestPassword123!',
      firstName,
      lastName,
      role: 'user',
    };
  }

  /**
   * Generate random job role data
   */
  export function generateRandomJobRole(): TestJobRole {
    const titles = ['Developer', 'Analyst', 'Consultant', 'Specialist', 'Manager'];
    const departments = ['Engineering', 'Consulting', 'Sales', 'Marketing', 'HR'];
    const locations = ['Belfast', 'London', 'Edinburgh', 'Birmingham', 'Manchester'];

    const title = titles[Math.floor(Math.random() * titles.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    return {
      title: generateUniqueJobTitle(title),
      description: `Join our ${department} team as a ${title} in ${location}.`,
      department,
      location,
      salary: '£30,000 - £50,000',
      requirements: [
        'Relevant degree or equivalent experience',
        'Strong communication skills',
        'Team player with problem-solving abilities',
      ],
      benefits: ['Competitive salary', 'Professional development', 'Flexible working'],
      type: 'full-time',
    };
  }

  /**
   * Get test data by environment
   */
  export function getEnvironmentData(env: string = 'test'): {
    baseUrl: string;
    dbUrl?: string;
    adminUser: TestUser;
  } {
    const environments = {
      test: {
        baseUrl: 'http://localhost:3000',
        adminUser: testUsers.admin,
      },
      staging: {
        baseUrl: 'https://staging.kainos-jobs.com',
        adminUser: {
          ...testUsers.admin,
          email: 'admin@staging.kainos.com',
        },
      },
      production: {
        baseUrl: 'https://jobs.kainos.com',
        adminUser: {
          ...testUsers.admin,
          email: 'admin@kainos.com',
        },
      },
    };

    return environments[env as keyof typeof environments] || environments.test;
  }
}

/**
 * Test data validation helpers
 */
export namespace TestDataValidator {
  /**
   * Validate email format
   */
  export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  export function isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate required job role fields
   */
  export function isValidJobRole(jobRole: Partial<TestJobRole>): boolean {
    const requiredFields = ['title', 'description', 'department', 'location'];
    return requiredFields.every(
      (field) =>
        jobRole[field as keyof TestJobRole] &&
        String(jobRole[field as keyof TestJobRole]).trim().length > 0
    );
  }
}
