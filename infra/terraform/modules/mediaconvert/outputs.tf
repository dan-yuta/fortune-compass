output "input_bucket_name" {
  description = "S3 bucket for uploading source videos"
  value       = aws_s3_bucket.input.id
}

output "output_bucket_name" {
  description = "S3 bucket for transcoded output videos"
  value       = aws_s3_bucket.output.id
}

output "lambda_function_name" {
  description = "Transcode trigger Lambda function name"
  value       = aws_lambda_function.transcode_trigger.function_name
}

output "test_upload_command" {
  description = "Example command to test video upload"
  value       = "aws s3 cp test.mp4 s3://${aws_s3_bucket.input.id}/test.mp4"
}

output "check_jobs_command" {
  description = "Example command to check MediaConvert jobs"
  value       = "aws mediaconvert list-jobs --region ${var.aws_region} --status COMPLETE --endpoint-url $(aws mediaconvert describe-endpoints --region ${var.aws_region} --query 'Endpoints[0].Url' --output text)"
}
