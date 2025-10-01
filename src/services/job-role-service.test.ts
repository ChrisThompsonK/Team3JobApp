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

  it('should filter job roles by capability', async () => {
    const engineeringRoles = await service.getJobRolesByCapability('Engineering');
    expect(engineeringRoles).toHaveLength(4);
    expect(engineeringRoles.every((role) => role.capability === 'Engineering')).toBe(true);
  });

  it('should filter job roles by band', async () => {
    const associateRoles = await service.getJobRolesByBand('Associate');
    expect(associateRoles).toHaveLength(4);
    expect(associateRoles.every((role) => role.band === 'Associate')).toBe(true);
  });

  it('should filter job roles by location', async () => {
    const belfastRoles = await service.getJobRolesByLocation('Belfast');
    expect(belfastRoles).toHaveLength(2);
    expect(belfastRoles.every((role) => role.location === 'Belfast')).toBe(true);
  });

  it('should handle case-insensitive filtering', async () => {
    const engineeringRoles = await service.getJobRolesByCapability('ENGINEERING');
    expect(engineeringRoles).toHaveLength(4);
  });
});
