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
