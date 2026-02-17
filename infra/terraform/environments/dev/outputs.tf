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

# --- Management ---

output "management_console_url" {
  description = "Management console URL (CloudFront HTTPS)"
  value       = module.cloudfront.admin_url
}

output "management_api_endpoint" {
  description = "Management API endpoint"
  value       = module.management.api_endpoint
}

output "management_api_key" {
  description = "Management API key"
  value       = module.management.api_key
  sensitive   = true
}

# --- MediaConvert ---

output "media_input_bucket" {
  description = "S3 bucket for uploading source videos"
  value       = module.mediaconvert.input_bucket_name
}

output "media_output_bucket" {
  description = "S3 bucket for transcoded output videos"
  value       = module.mediaconvert.output_bucket_name
}

output "media_test_command" {
  description = "Test command: upload a video for transcoding"
  value       = module.mediaconvert.test_upload_command
}

# --- Security ---

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = module.security.guardduty_detector_id
}

output "config_bucket_name" {
  description = "AWS Config delivery S3 bucket"
  value       = module.security.config_bucket_name
}

# --- Bedrock Agent ---

output "bedrock_agent_id" {
  description = "Bedrock Agent ID"
  value       = module.bedrock.agent_id
}

output "bedrock_agent_invoke_command" {
  description = "CLI command to invoke the Bedrock Agent"
  value       = module.bedrock.invoke_command
}
