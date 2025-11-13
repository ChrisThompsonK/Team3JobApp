terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.azure_region
  tags     = var.common_tags
}

# Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true
  tags                = var.common_tags
}

# Azure Storage Account for static assets
resource "azurerm_storage_account" "frontend_storage" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.common_tags
}

# Storage Container for static assets
resource "azurerm_storage_container" "frontend_container" {
  name                  = "frontend-assets"
  storage_account_name  = azurerm_storage_account.frontend_storage.name
  container_access_type = "blob"
}
