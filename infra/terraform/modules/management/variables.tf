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

variable "ec2_instance_id" {
  type        = string
  description = "EC2 instance ID to manage (start/stop)"
}

variable "health_check_url" {
  type        = string
  description = "URL for application health check (e.g. http://IP/api/health)"
}
