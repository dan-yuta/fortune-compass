variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "origin_domain" {
  type        = string
  description = "Origin domain name (EC2 public DNS or ALB DNS)"
}

variable "admin_origin_domain" {
  type        = string
  description = "S3 website endpoint for admin console origin"
  default     = ""
}

variable "enable_admin_origin" {
  type        = bool
  description = "Enable /admin path routing to S3 management console"
  default     = false
}
