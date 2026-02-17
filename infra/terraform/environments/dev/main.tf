# --- Data ---

data "aws_caller_identity" "current" {}

locals {
  ecr_registry = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

# --- Networking ---

module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  environment  = var.environment
}

# --- ECR ---

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# --- EC2 + k3s ---

module "ec2_k3s" {
  source = "../../modules/ec2-k3s"

  project_name     = var.project_name
  environment      = var.environment
  aws_region       = var.aws_region
  vpc_id           = module.networking.vpc_id
  public_subnet_id = module.networking.public_subnet_ids[0]
  ecr_registry     = local.ecr_registry
  backend_image    = "${module.ecr.repository_urls["backend"]}:latest"
  frontend_image   = "${module.ecr.repository_urls["frontend"]}:latest"
}

# --- Management (Lambda + Step Functions + API Gateway + S3) ---

module "management" {
  source = "../../modules/management"

  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  ec2_instance_id = module.ec2_k3s.instance_id
  health_check_url = "http://${module.ec2_k3s.public_ip}/api/health"
}

# --- CloudFront ---

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name        = var.project_name
  environment         = var.environment
  origin_domain       = module.ec2_k3s.public_dns
  enable_admin_origin = true
  admin_origin_domain = module.management.console_website_endpoint
}

# --- MediaConvert (動画変換) ---

module "mediaconvert" {
  source = "../../modules/mediaconvert"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

# --- Security (セキュリティ監査) ---

module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  enable_security_hub    = true
  enable_guardduty       = true
  enable_inspector       = true
  enable_config          = true
  enable_access_analyzer = true
}

# --- Bedrock Agent (対話型占いコンシェルジュ) ---

module "bedrock" {
  source = "../../modules/bedrock"

  project_name     = var.project_name
  environment      = var.environment
  aws_region       = var.aws_region
  app_api_base_url = module.cloudfront.distribution_url
}
