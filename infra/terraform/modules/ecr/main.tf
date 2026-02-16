locals {
  name_prefix = "${var.project_name}-${var.environment}"
  repositories = ["frontend", "backend"]
}

resource "aws_ecr_repository" "app" {
  for_each             = toset(local.repositories)
  name                 = "${local.name_prefix}-${each.key}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name_prefix}-${each.key}"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  for_each   = toset(local.repositories)
  repository = aws_ecr_repository.app[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
