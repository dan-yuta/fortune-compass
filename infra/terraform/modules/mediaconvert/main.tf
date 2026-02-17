locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

data "aws_caller_identity" "current" {}

# =============================================================================
# S3 — Input / Output buckets
# =============================================================================

resource "aws_s3_bucket" "input" {
  bucket = "${local.name_prefix}-media-input"
}

resource "aws_s3_bucket" "output" {
  bucket = "${local.name_prefix}-media-output"
}

resource "aws_s3_bucket_lifecycle_configuration" "input" {
  bucket = aws_s3_bucket.input.id

  rule {
    id     = "cleanup-processed"
    status = "Enabled"
    filter {}

    expiration {
      days = 7
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "output" {
  bucket = aws_s3_bucket.output.id

  rule {
    id     = "cleanup-old-outputs"
    status = "Enabled"
    filter {}

    expiration {
      days = 30
    }
  }
}

# =============================================================================
# IAM — MediaConvert service role
# =============================================================================

resource "aws_iam_role" "mediaconvert" {
  name = "${local.name_prefix}-mediaconvert-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "mediaconvert.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "mediaconvert" {
  name = "${local.name_prefix}-mediaconvert-policy"
  role = aws_iam_role.mediaconvert.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.input.arn,
          "${aws_s3_bucket.input.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.output.arn,
          "${aws_s3_bucket.output.arn}/*"
        ]
      }
    ]
  })
}

# =============================================================================
# IAM — Lambda execution role
# =============================================================================

resource "aws_iam_role" "lambda" {
  name = "${local.name_prefix}-transcode-lambda-role"

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
  name = "${local.name_prefix}-transcode-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "mediaconvert:CreateJob",
          "mediaconvert:DescribeEndpoints"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = aws_iam_role.mediaconvert.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.input.arn,
          "${aws_s3_bucket.input.arn}/*"
        ]
      }
    ]
  })
}

# =============================================================================
# Lambda — Transcode trigger
# =============================================================================

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/transcode_trigger.py"
  output_path = "${path.module}/lambda/transcode_trigger.zip"
}

resource "aws_lambda_function" "transcode_trigger" {
  function_name    = "${local.name_prefix}-transcode-trigger"
  runtime          = "python3.12"
  handler          = "transcode_trigger.handler"
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = 60
  memory_size      = 128

  environment {
    variables = {
      OUTPUT_BUCKET       = aws_s3_bucket.output.id
      MEDIACONVERT_ROLE   = aws_iam_role.mediaconvert.arn
      AWS_REGION_NAME     = var.aws_region
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name_prefix}-transcode-trigger"
  retention_in_days = 14
}

# =============================================================================
# S3 Notification — .mp4 upload triggers Lambda
# =============================================================================

resource "aws_lambda_permission" "s3" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transcode_trigger.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.input.arn
}

resource "aws_s3_bucket_notification" "input" {
  bucket = aws_s3_bucket.input.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.transcode_trigger.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".mp4"
  }

  depends_on = [aws_lambda_permission.s3]
}

# =============================================================================
# EventBridge — MediaConvert job completion logging
# =============================================================================

resource "aws_cloudwatch_event_rule" "mediaconvert_complete" {
  name        = "${local.name_prefix}-mediaconvert-complete"
  description = "Capture MediaConvert job state changes"

  event_pattern = jsonencode({
    source      = ["aws.mediaconvert"]
    detail-type = ["MediaConvert Job State Change"]
    detail = {
      status = ["COMPLETE", "ERROR"]
    }
  })
}

resource "aws_cloudwatch_log_group" "mediaconvert_events" {
  name              = "/aws/events/${local.name_prefix}-mediaconvert"
  retention_in_days = 14
}

resource "aws_cloudwatch_event_target" "mediaconvert_logs" {
  rule      = aws_cloudwatch_event_rule.mediaconvert_complete.name
  target_id = "MediaConvertToCloudWatch"
  arn       = aws_cloudwatch_log_group.mediaconvert_events.arn
}

resource "aws_cloudwatch_log_resource_policy" "mediaconvert_events" {
  policy_name     = "${local.name_prefix}-mediaconvert-events"
  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action = [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "${aws_cloudwatch_log_group.mediaconvert_events.arn}:*"
    }]
  })
}
