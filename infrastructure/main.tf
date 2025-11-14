variable "environment" {
  type    = string
  default = "dev"
}

variable "app_name" {
  type    = string
  default = "team3-job-app"
}

variable "region" {
  type    = string
  default = "UK South"
}

resource "azurerm_resource_group" "main" {
  name     = "${var.app_name}-${var.environment}-rg"
  location = var.region
}
