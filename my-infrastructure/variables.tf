variable "azure_region" {
  type        = string
  description = "Azure region for resources"
  default     = "uksouth"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the Azure resource group"
}

variable "acr_name" {
  type        = string
  description = "Name of the Azure Container Registry (must be globally unique, alphanumeric only)"
}

variable "acr_sku" {
  type        = string
  description = "SKU for Azure Container Registry"
  default     = "Basic"
}

variable "storage_account_name" {
  type        = string
  description = "Name of the Azure Storage Account (must be globally unique, lowercase alphanumeric only)"
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags to apply to all resources"
  default = {
    Project     = "Team3-JobApp"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
