resource "azurerm_resource_group" "main" {
  name     = "team3-job-app-dev-fe"
  location = var.region
}

data "azurerm_resource_group" "shared" {
  name = "team3-job-app-dev-rg"
}

data "azurerm_container_app_environment" "main" {
  name                = "cae-${var.app_name}-${var.environment}"
  resource_group_name = data.azurerm_resource_group.shared.name
}

data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

data "azurerm_key_vault" "main" {
  name                = "kv-team3-jobapp-${var.environment}"
  resource_group_name = data.azurerm_resource_group.shared.name
}

data "azurerm_user_assigned_identity" "frontend" {
  name                = "mi-${var.app_name}-frontend-${var.environment}"
  resource_group_name = data.azurerm_resource_group.shared.name
}

resource "azurerm_container_app" "frontend" {
  name                         = "ca-${var.app_name}-frontend-${var.environment}"
  container_app_environment_id = data.azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.frontend.id]
  }

  template {
    container {
      name   = "frontend"
      image  = var.frontend_image
      cpu    = var.frontend_cpu
      memory = var.frontend_memory

      # Key Vault reference syntax for env vars
      env {
        name        = "NODE_ENV"
        value       = "production"
      }

      env {
        name        = "PORT"
        value       = "3000"
      }

      env {
        name        = "API_BASE_URL"
        secret_name = "api-base-url"
      }

      env {
        name        = "API_TIMEOUT"
        value       = "5000"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "JWT_ACCESS_SECRET"
        secret_name = "jwt-access-secret"
      }

      env {
        name        = "JWT_REFRESH_SECRET"
        secret_name = "jwt-refresh-secret"
      }

      env {
        name        = "PASSWORD_HASH_ROUNDS"
        value       = "12"
      }

      env {
        name        = "LOG_LEVEL"
        value       = "info"
      }

      env {
        name        = "ENABLE_CORS"
        value       = "true"
      }
    }

    min_replicas = 1
    max_replicas = 3
  }

  # Define the Key Vault references as secrets
  secret {
    name                = "api-base-url"
    key_vault_secret_id = "${data.azurerm_key_vault.main.vault_uri}secrets/api-base-url"
    identity            = data.azurerm_user_assigned_identity.frontend.id
  }

  secret {
    name                = "database-url"
    key_vault_secret_id = "${data.azurerm_key_vault.main.vault_uri}secrets/database-url"
    identity            = data.azurerm_user_assigned_identity.frontend.id
  }

  secret {
    name                = "jwt-access-secret"
    key_vault_secret_id = "${data.azurerm_key_vault.main.vault_uri}secrets/jwt-access-secret"
    identity            = data.azurerm_user_assigned_identity.frontend.id
  }

  secret {
    name                = "jwt-refresh-secret"
    key_vault_secret_id = "${data.azurerm_key_vault.main.vault_uri}secrets/jwt-refresh-secret"
    identity            = data.azurerm_user_assigned_identity.frontend.id
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000
    transport                  = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server   = "aiacademy25-bbaue6bgenhkd0dj.azurecr.io"
    identity = data.azurerm_user_assigned_identity.frontend.id
  }
}

