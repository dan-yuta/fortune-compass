output "security_hub_id" {
  description = "Security Hub account ID"
  value       = var.enable_security_hub ? aws_securityhub_account.main[0].id : ""
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = var.enable_guardduty ? aws_guardduty_detector.main[0].id : ""
}

output "inspector_enabled" {
  description = "Whether Inspector is enabled"
  value       = var.enable_inspector
}

output "config_recorder_id" {
  description = "Config recorder ID"
  value       = var.enable_config ? aws_config_configuration_recorder.main[0].id : ""
}

output "config_bucket_name" {
  description = "S3 bucket for Config delivery"
  value       = var.enable_config ? aws_s3_bucket.config[0].id : ""
}

output "access_analyzer_id" {
  description = "IAM Access Analyzer ID"
  value       = var.enable_access_analyzer ? aws_accessanalyzer_analyzer.main[0].id : ""
}
