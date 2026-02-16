locals {
  name_prefix   = "${var.project_name}-${var.environment}"
  function_name = "${local.name_prefix}-ec2-manager"
}

# =============================================================================
# IAM — Lambda execution role
# =============================================================================

resource "aws_iam_role" "lambda" {
  name = "${local.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "${local.function_name}-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:StartInstances",
          "ec2:StopInstances"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ec2:ResourceTag/Name" = "${local.name_prefix}-k3s"
          }
        }
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:DescribeInstances"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# =============================================================================
# Lambda function
# =============================================================================

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/ec2_manager.py"
  output_path = "${path.module}/lambda/ec2_manager.zip"
}

resource "aws_lambda_function" "ec2_manager" {
  function_name    = local.function_name
  runtime          = "python3.12"
  handler          = "ec2_manager.handler"
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = 30
  memory_size      = 128

  environment {
    variables = {
      INSTANCE_ID      = var.ec2_instance_id
      HEALTH_CHECK_URL = var.health_check_url
      AWS_REGION_NAME  = var.aws_region
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 14
}

# =============================================================================
# IAM — Step Functions execution role
# =============================================================================

resource "aws_iam_role" "step_functions" {
  name = "${local.name_prefix}-sfn-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "states.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "step_functions" {
  name = "${local.name_prefix}-sfn-policy"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = aws_lambda_function.ec2_manager.arn
    }]
  })
}

# =============================================================================
# Step Functions — Start & Stop state machines
# =============================================================================

resource "aws_sfn_state_machine" "start" {
  name     = "${local.name_prefix}-ec2-start"
  role_arn = aws_iam_role.step_functions.arn

  definition = templatefile("${path.module}/step_functions_start.asl.json", {
    lambda_arn = aws_lambda_function.ec2_manager.arn
  })
}

resource "aws_sfn_state_machine" "stop" {
  name     = "${local.name_prefix}-ec2-stop"
  role_arn = aws_iam_role.step_functions.arn

  definition = templatefile("${path.module}/step_functions_stop.asl.json", {
    lambda_arn = aws_lambda_function.ec2_manager.arn
  })
}

# =============================================================================
# API Gateway — REST API with API Key
# =============================================================================

resource "aws_api_gateway_rest_api" "management" {
  name        = "${local.name_prefix}-management"
  description = "EC2 Management API for Fortune Compass"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# --- /manage resource ---

resource "aws_api_gateway_resource" "manage" {
  rest_api_id = aws_api_gateway_rest_api.management.id
  parent_id   = aws_api_gateway_rest_api.management.root_resource_id
  path_part   = "manage"
}

# --- POST /manage ---

resource "aws_api_gateway_method" "manage_post" {
  rest_api_id      = aws_api_gateway_rest_api.management.id
  resource_id      = aws_api_gateway_resource.manage.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "manage_post" {
  rest_api_id             = aws_api_gateway_rest_api.management.id
  resource_id             = aws_api_gateway_resource.manage.id
  http_method             = aws_api_gateway_method.manage_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.ec2_manager.invoke_arn
}

# --- OPTIONS /manage (CORS) ---

resource "aws_api_gateway_method" "manage_options" {
  rest_api_id   = aws_api_gateway_rest_api.management.id
  resource_id   = aws_api_gateway_resource.manage.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "manage_options" {
  rest_api_id = aws_api_gateway_rest_api.management.id
  resource_id = aws_api_gateway_resource.manage.id
  http_method = aws_api_gateway_method.manage_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "manage_options" {
  rest_api_id = aws_api_gateway_rest_api.management.id
  resource_id = aws_api_gateway_resource.manage.id
  http_method = aws_api_gateway_method.manage_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "manage_options" {
  rest_api_id = aws_api_gateway_rest_api.management.id
  resource_id = aws_api_gateway_resource.manage.id
  http_method = aws_api_gateway_method.manage_options.http_method
  status_code = aws_api_gateway_method_response.manage_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.manage_options]
}

# --- Deployment & Stage ---

resource "aws_api_gateway_deployment" "management" {
  rest_api_id = aws_api_gateway_rest_api.management.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.manage,
      aws_api_gateway_method.manage_post,
      aws_api_gateway_integration.manage_post,
      aws_api_gateway_method.manage_options,
      aws_api_gateway_integration.manage_options,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.manage_post,
    aws_api_gateway_integration.manage_options,
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.management.id
  rest_api_id   = aws_api_gateway_rest_api.management.id
  stage_name    = "prod"
}

# --- API Key & Usage Plan ---

resource "aws_api_gateway_api_key" "management" {
  name    = "${local.name_prefix}-mgmt-key"
  enabled = true
}

resource "aws_api_gateway_usage_plan" "management" {
  name = "${local.name_prefix}-mgmt-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.management.id
    stage  = aws_api_gateway_stage.prod.stage_name
  }

  throttle_settings {
    burst_limit = 5
    rate_limit  = 2
  }
}

resource "aws_api_gateway_usage_plan_key" "management" {
  key_id        = aws_api_gateway_api_key.management.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.management.id
}

# --- Lambda permission for API Gateway ---

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ec2_manager.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.management.execution_arn}/*/*"
}

# =============================================================================
# S3 — Static website for management console
# =============================================================================

resource "aws_s3_bucket" "console" {
  bucket = "${local.name_prefix}-mgmt-console"
}

resource "aws_s3_bucket_website_configuration" "console" {
  bucket = aws_s3_bucket.console.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "console" {
  bucket = aws_s3_bucket.console.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "console" {
  bucket = aws_s3_bucket.console.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.console.arn}/*"
    }]
  })

  depends_on = [aws_s3_bucket_public_access_block.console]
}

resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.console.id
  key          = "index.html"
  content      = templatefile("${path.module}/console/index.html", {
    api_endpoint = "${aws_api_gateway_stage.prod.invoke_url}/manage"
    api_key      = aws_api_gateway_api_key.management.value
    app_url      = var.health_check_url != "" ? replace(var.health_check_url, "/api/health", "") : ""
  })
  content_type = "text/html"
  etag         = md5(templatefile("${path.module}/console/index.html", {
    api_endpoint = "${aws_api_gateway_stage.prod.invoke_url}/manage"
    api_key      = aws_api_gateway_api_key.management.value
    app_url      = var.health_check_url != "" ? replace(var.health_check_url, "/api/health", "") : ""
  }))
}
