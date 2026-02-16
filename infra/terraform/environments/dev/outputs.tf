output "alb_dns_name" {
  description = "ALB DNS name (access the app here)"
  value       = module.alb.alb_dns_name
}

output "app_url" {
  description = "Application URL"
  value       = "http://${module.alb.alb_dns_name}"
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.repository_urls["frontend"]
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.repository_urls["backend"]
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}
