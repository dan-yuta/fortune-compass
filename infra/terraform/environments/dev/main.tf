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

# --- ALB ---

module "alb" {
  source = "../../modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
}

# --- ECS ---

module "ecs" {
  source = "../../modules/ecs"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  vpc_id                    = module.networking.vpc_id
  private_subnet_ids        = module.networking.private_subnet_ids
  alb_security_group_id     = module.alb.alb_security_group_id
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn
  frontend_image            = var.frontend_image
  backend_image             = var.backend_image
  cors_origin               = "https://${module.cloudfront.distribution_domain_name}"
}

# --- CloudFront ---

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name = var.project_name
  environment  = var.environment
  alb_dns_name = module.alb.alb_dns_name
}
