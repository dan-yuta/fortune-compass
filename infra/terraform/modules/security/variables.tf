variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "enable_security_hub" {
  type        = bool
  description = "Enable AWS Security Hub"
  default     = true
}

variable "enable_guardduty" {
  type        = bool
  description = "Enable AWS GuardDuty"
  default     = true
}

variable "enable_inspector" {
  type        = bool
  description = "Enable AWS Inspector"
  default     = true
}

variable "enable_config" {
  type        = bool
  description = "Enable AWS Config (only 1 recorder per region allowed)"
  default     = true
}

variable "enable_access_analyzer" {
  type        = bool
  description = "Enable IAM Access Analyzer"
  default     = true
}
