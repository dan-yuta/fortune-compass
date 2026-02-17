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

variable "app_api_base_url" {
  type        = string
  description = "Base URL for the Fortune Compass backend API (e.g. https://xxx.cloudfront.net)"
}

variable "bedrock_model_id" {
  type        = string
  description = "Bedrock foundation model ID for the agent"
  default     = "anthropic.claude-3-haiku-20240307-v1:0"
}
