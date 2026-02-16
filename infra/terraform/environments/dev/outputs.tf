output "app_url" {
  description = "Application URL (CloudFront)"
  value       = module.cloudfront.distribution_url
}

output "cloudfront_domain" {
  description = "CloudFront domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "ec2_public_ip" {
  description = "EC2 (k3s) public IP"
  value       = module.ec2_k3s.public_ip
}

output "ec2_public_dns" {
  description = "EC2 (k3s) public DNS"
  value       = module.ec2_k3s.public_dns
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.repository_urls["frontend"]
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.repository_urls["backend"]
}

output "k3s_ssh_private_key" {
  description = "SSH private key for k3s EC2 instance"
  value       = module.ec2_k3s.private_key_pem
  sensitive   = true
}
