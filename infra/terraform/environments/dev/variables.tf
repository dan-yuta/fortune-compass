variable "project_name" {
  type    = string
  default = "fortune-compass"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "frontend_image" {
  type        = string
  description = "Full ECR image URI for frontend (e.g. 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-frontend:abc123)"
}

variable "backend_image" {
  type        = string
  description = "Full ECR image URI for backend"
}
