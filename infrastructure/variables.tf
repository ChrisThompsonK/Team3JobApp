variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  default     = "dev"
}

variable "app_name" {
  type        = string
  description = "Application name"
  default     = "team3-job-app"
}

variable "region" {
  type        = string
  description = "Azure region"
  default     = "UK South"
}

variable "acr_name" {
  type        = string
  description = "Azure Container Registry name"
  default     = "aiacademy25"
}

variable "acr_resource_group_name" {
  type        = string
  description = "Resource group name where ACR exists"
  default     = "container-registry"
}

variable "frontend_image" {
  type        = string
  description = "Frontend container image URL"
  default     = "aiacademy25.azurecr.io/team3-job-app-frontend:latest"
}

variable "frontend_cpu" {
  type        = string
  description = "CPU allocation for frontend"
  default     = "0.25"
}

variable "frontend_memory" {
  type        = string
  description = "Memory allocation for frontend"
  default     = "0.5Gi"
}

variable "frontend_managed_identity_id" {
  type        = string
  description = "Frontend Managed Identity ID from team3-job-app-tf"
  default     = ""
}
