locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# =============================================================================
# IAM — Lambda execution role (fortune-bridge)
# =============================================================================

resource "aws_iam_role" "lambda" {
  name = "${local.name_prefix}-fortune-bridge-role"

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
  name = "${local.name_prefix}-fortune-bridge-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "arn:aws:logs:*:*:*"
    }]
  })
}

# =============================================================================
# Lambda — Fortune bridge (Agent → Backend API)
# =============================================================================

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/fortune_bridge.py"
  output_path = "${path.module}/lambda/fortune_bridge.zip"
}

resource "aws_lambda_function" "fortune_bridge" {
  function_name    = "${local.name_prefix}-fortune-bridge"
  runtime          = "python3.12"
  handler          = "fortune_bridge.handler"
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = 30
  memory_size      = 128

  environment {
    variables = {
      API_BASE_URL = var.app_api_base_url
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name_prefix}-fortune-bridge"
  retention_in_days = 14
}

# =============================================================================
# IAM — Bedrock Agent role
# =============================================================================

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "bedrock_agent" {
  name = "${local.name_prefix}-bedrock-agent-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "bedrock.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = {
          "aws:SourceAccount" = data.aws_caller_identity.current.account_id
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "bedrock_agent" {
  name = "${local.name_prefix}-bedrock-agent-policy"
  role = aws_iam_role.bedrock_agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["bedrock:InvokeModel"]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/${var.bedrock_model_id}"
      },
      {
        Effect   = "Allow"
        Action   = ["lambda:InvokeFunction"]
        Resource = aws_lambda_function.fortune_bridge.arn
      }
    ]
  })
}

# =============================================================================
# Bedrock Agent
# =============================================================================

resource "aws_bedrockagent_agent" "fortune" {
  agent_name              = "${local.name_prefix}-fortune-concierge"
  agent_resource_role_arn = aws_iam_role.bedrock_agent.arn
  foundation_model        = var.bedrock_model_id
  idle_session_ttl_in_seconds = 600

  instruction = <<-EOT
    あなたは「Fortune Compass 占いコンシェルジュ」です。
    ユーザーの質問に基づいて、適切な占いAPIを呼び出し、結果をわかりやすく日本語で伝えてください。

    以下の占いが利用可能です：
    1. 総合運勢ダッシュボード（dashboard）- 誕生日から総合運勢を表示
    2. 星座占い（zodiac）- 誕生日から星座を判定し運勢を占う
    3. タロット占い（tarot）- タロットカードを引いて占う
    4. おみくじ（omikuji）- 日本の伝統的なおみくじを引く
    5. 夢占い（dream）- 夢のキーワードから運勢を占う
    6. 血液型占い（blood-type）- 血液型から運勢を占う
    7. 風水（fengshui）- 風水に基づくアドバイス

    ルール：
    - ユーザーが誕生日を教えてくれたら、星座占いやダッシュボードを提案してください
    - 血液型を教えてくれたら、血液型占いを提案してください
    - 複数の占いを組み合わせて総合的なアドバイスを提供することもできます
    - 結果は親しみやすく、ポジティブな表現で伝えてください
    - 日本語で応答してください
  EOT
}

# =============================================================================
# Bedrock Agent Action Group
# =============================================================================

resource "aws_bedrockagent_agent_action_group" "fortune_api" {
  action_group_name          = "fortune-api"
  agent_id                   = aws_bedrockagent_agent.fortune.agent_id
  agent_version              = "DRAFT"
  description                = "Fortune Compass占いAPIエンドポイント"
  skip_resource_in_use_check = true

  action_group_executor {
    lambda = aws_lambda_function.fortune_bridge.arn
  }

  api_schema {
    payload = file("${path.module}/api_schema.yaml")
  }
}

# =============================================================================
# Lambda permission for Bedrock Agent
# =============================================================================

resource "aws_lambda_permission" "bedrock_agent" {
  statement_id  = "AllowBedrockAgentInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fortune_bridge.function_name
  principal     = "bedrock.amazonaws.com"
  source_arn    = aws_bedrockagent_agent.fortune.agent_arn
}

# =============================================================================
# Bedrock Agent Alias (prepared version for invocation)
# =============================================================================

resource "aws_bedrockagent_agent_alias" "live" {
  agent_alias_name = "live"
  agent_id         = aws_bedrockagent_agent.fortune.agent_id
  description      = "Live alias for fortune concierge agent"
}
