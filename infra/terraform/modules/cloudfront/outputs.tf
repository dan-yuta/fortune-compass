output "distribution_domain_name" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "distribution_id" {
  value = aws_cloudfront_distribution.main.id
}

output "distribution_url" {
  value = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "admin_url" {
  description = "Management console URL via CloudFront"
  value       = var.enable_admin_origin ? "https://${aws_cloudfront_distribution.main.domain_name}/admin" : ""
}
