import { describe, expect, it } from 'vitest';
import { MockJobRoleService } from '../services/job-role-service.js';

describe('MockJobRoleService', () => {
  const service = new MockJobRoleService();

  it('should return all job roles', async () => {
    const jobRoles = await service.getAllJobRoles();
    expect(jobRoles).toHaveLength(10);
    expect(jobRoles[0]).toHaveProperty('id');
    expect(jobRoles[0]).toHaveProperty('name');
    expect(jobRoles[0]).toHaveProperty('location');
    expect(jobRoles[0]).toHaveProperty('capability');
    expect(jobRoles[0]).toHaveProperty('band');
    expect(jobRoles[0]).toHaveProperty('closingDate');
  });

  it('should return a job role by id', async () => {
    const jobRole = await service.getJobRoleById('1');
    expect(jobRole).not.toBeNull();
    expect(jobRole?.name).toBe('Software Engineer');
    expect(jobRole?.capability).toBe('Engineering');
  });

  it('should return null for non-existent job role', async () => {
    const jobRole = await service.getJobRoleById('999');
    expect(jobRole).toBeNull();
  });
});
