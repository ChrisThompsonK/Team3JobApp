output "resource_group_name" {
  value       = data.azurerm_resource_group.main.name
  description = "Resource group name"
}

output "resource_group_id" {
  value       = data.azurerm_resource_group.main.id
  description = "Resource group ID"
}

output "frontend_container_app_id" {
  value       = azurerm_container_app.frontend.id
  description = "Frontend Container App ID"
}

output "frontend_container_app_name" {
  value       = azurerm_container_app.frontend.name
  description = "Frontend Container App name"
}

output "frontend_container_app_fqdn" {
  value       = azurerm_container_app.frontend.ingress[0].fqdn
  description = "Frontend Container App public FQDN"
}
