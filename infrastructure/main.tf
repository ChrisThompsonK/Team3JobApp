resource "azurerm_resource_group" "main" {
  name     = "${var.app_name}-${var.environment}-rg"
  location = var.region
}

data "azurerm_container_app_environment" "main" {
  name                = "cae-${var.app_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
}

data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

data "azurerm_key_vault" "main" {
  name                = "kv-team3-jobapp-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_container_app" "frontend" {
  name                         = "ca-${var.app_name}-frontend-${var.environment}"
  container_app_environment_id = data.azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.frontend.id]
  }

  template {
    container {
      name   = "frontend"
      image  = var.frontend_image
      cpu    = var.frontend_cpu
      memory = var.frontend_memory

      # Key Vault reference syntax for env vars
      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name        = "API_BASE_URL"
        secret_name = "api-base-url-ref"
      }
    }

    min_replicas = 1
    max_replicas = 3
  }

  # Define the Key Vault references as secrets
  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = "${data.azurerm_key_vault.main.vault_uri}secrets/SessionSecret"
    identity            = azurerm_user_assigned_identity.frontend.id
  }

  secret {
    name                = "api-base-url-ref"
    key_vault_secret_id = "${data.azurerm_key_vault.main.vault_uri}secrets/ApiBaseUrl"
    identity            = azurerm_user_assigned_identity.frontend.id
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
    server   = "${var.acr_name}.azurecr.io"
    identity = azurerm_user_assigned_identity.frontend.id
  }
}

