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

variable "vpc_id" {
  type = string
}

variable "public_subnet_id" {
  type        = string
  description = "Single public subnet ID for the EC2 instance"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ecr_registry" {
  type        = string
  description = "ECR registry domain (e.g. 123456789.dkr.ecr.ap-northeast-1.amazonaws.com)"
}

variable "backend_image" {
  type        = string
  description = "Full backend image URI with tag"
}

variable "frontend_image" {
  type        = string
  description = "Full frontend image URI with tag"
}
