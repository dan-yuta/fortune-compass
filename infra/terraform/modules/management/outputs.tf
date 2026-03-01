output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_api_gateway_stage.prod.invoke_url}/manage"
}

output "api_key" {
  description = "API Key for management API"
  value       = aws_api_gateway_api_key.management.value
  sensitive   = true
}

output "console_url" {
  description = "Management console URL (S3 static website)"
  value       = "http://${aws_s3_bucket.console.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.ec2_manager.function_name
}

output "console_website_endpoint" {
  description = "S3 website endpoint for management console"
  value       = aws_s3_bucket_website_configuration.console.website_endpoint
}
