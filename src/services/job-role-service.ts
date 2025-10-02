import type { JobRole } from "../models/job-roles.js";

export interface JobRoleService {
	getAllJobRoles(): Promise<JobRole[]>;
	getJobRoleById(id: string): Promise<JobRole | null>;
}

export class MockJobRoleService implements JobRoleService {
	private readonly sampleJobRoles: JobRole[] = [
		{
			id: "1",
			name: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2024-12-15"),
		},
		{
			id: "2",
			name: "Senior Software Engineer",
			location: "London",
			capability: "Engineering",
			band: "Senior Associate",
			closingDate: new Date("2024-11-30"),
		},
		{
			id: "3",
			name: "Product Manager",
			location: "Manchester",
			capability: "Product",
			band: "Senior Associate",
			closingDate: new Date("2024-12-01"),
		},
		{
			id: "4",
			name: "UX Designer",
			location: "Birmingham",
			capability: "Design",
			band: "Associate",
			closingDate: new Date("2024-11-25"),
		},
		{
			id: "5",
			name: "Data Scientist",
			location: "Edinburgh",
			capability: "Data & Analytics",
			band: "Senior Associate",
			closingDate: new Date("2024-12-10"),
		},
		{
			id: "6",
			name: "DevOps Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Associate",
			closingDate: new Date("2024-12-05"),
		},
		{
			id: "7",
			name: "Principal Software Engineer",
			location: "London",
			capability: "Engineering",
			band: "Principal",
			closingDate: new Date("2024-12-20"),
		},
		{
			id: "8",
			name: "Business Analyst",
			location: "Leeds",
			capability: "Business Analysis",
			band: "Associate",
			closingDate: new Date("2024-11-28"),
		},
		{
			id: "9",
			name: "Scrum Master",
			location: "Glasgow",
			capability: "Delivery",
			band: "Senior Associate",
			closingDate: new Date("2024-12-03"),
		},
		{
			id: "10",
			name: "Security Engineer",
			location: "London",
			capability: "Cyber Security",
			band: "Senior Associate",
			closingDate: new Date("2024-12-12"),
		},
	];

	async getAllJobRoles(): Promise<JobRole[]> {
		// Simulate API delay
		await this.delay(100);
		return [...this.sampleJobRoles];
	}

	async getJobRoleById(id: string): Promise<JobRole | null> {
		// Simulate API delay
		await this.delay(50);
		const jobRole = this.sampleJobRoles.find((role) => role.id === id);
		return jobRole || null;
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Export a singleton instance for easy use
export const jobRoleService = new MockJobRoleService();
