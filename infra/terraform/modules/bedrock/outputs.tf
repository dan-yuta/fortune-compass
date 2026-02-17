output "agent_id" {
  description = "Bedrock Agent ID"
  value       = aws_bedrockagent_agent.fortune.agent_id
}

output "agent_alias_id" {
  description = "Bedrock Agent alias ID"
  value       = aws_bedrockagent_agent_alias.live.agent_alias_id
}

output "agent_arn" {
  description = "Bedrock Agent ARN"
  value       = aws_bedrockagent_agent.fortune.agent_arn
}

output "lambda_function_name" {
  description = "Fortune bridge Lambda function name"
  value       = aws_lambda_function.fortune_bridge.function_name
}

output "invoke_command" {
  description = "Example CLI command to invoke the agent"
  value       = "aws bedrock-agent-runtime invoke-agent --agent-id ${aws_bedrockagent_agent.fortune.agent_id} --agent-alias-id ${aws_bedrockagent_agent_alias.live.agent_alias_id} --session-id test-001 --input-text '今日の運勢を教えて'"
}
