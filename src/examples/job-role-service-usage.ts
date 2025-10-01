// Example usage of the Job Role Service
// This file demonstrates how to use the MockJobRoleService in your application

import { jobRoleService } from '../services/job-role-service.js';

// Example: Get all job roles
export async function getAllJobRolesExample() {
  try {
    const jobRoles = await jobRoleService.getAllJobRoles();
    console.log('All Job Roles:', jobRoles);
    return jobRoles;
  } catch (error) {
    console.error('Error fetching job roles:', error);
    return [];
  }
}

// Example: Get specific job role by ID
export async function getJobRoleByIdExample(id: string) {
  try {
    const jobRole = await jobRoleService.getJobRoleById(id);
    if (jobRole) {
      console.log(`Job Role ${id}:`, jobRole);
      return jobRole;
    } else {
      console.log(`Job Role with ID ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching job role ${id}:`, error);
    return null;
  }
}

// Example: Filter by capability
export async function getEngineeringRolesExample() {
  try {
    const engineeringRoles = await jobRoleService.getJobRolesByCapability('Engineering');
    console.log('Engineering Roles:', engineeringRoles);
    return engineeringRoles;
  } catch (error) {
    console.error('Error fetching engineering roles:', error);
    return [];
  }
}

// Example: Filter by location
export async function getBelfastRolesExample() {
  try {
    const belfastRoles = await jobRoleService.getJobRolesByLocation('Belfast');
    console.log('Belfast Roles:', belfastRoles);
    return belfastRoles;
  } catch (error) {
    console.error('Error fetching Belfast roles:', error);
    return [];
  }
}

// Example: Filter by band
export async function getSeniorRolesExample() {
  try {
    const seniorRoles = await jobRoleService.getJobRolesByBand('Senior Associate');
    console.log('Senior Associate Roles:', seniorRoles);
    return seniorRoles;
  } catch (error) {
    console.error('Error fetching senior roles:', error);
    return [];
  }
}
