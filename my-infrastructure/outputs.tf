output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend_bucket.id
  description = "Name of the S3 bucket"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.frontend_bucket.arn
  description = "ARN of the S3 bucket"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
  description = "Domain name of the CloudFront distribution"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend_distribution.id
  description = "ID of the CloudFront distribution"
}
