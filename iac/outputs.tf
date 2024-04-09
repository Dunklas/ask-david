output "cloudfront_id" {
  value     = aws_cloudfront_distribution.this.id
  sensitive = true
}

output "s3_bucket_name" {
  value     = aws_s3_bucket.this.id
  sensitive = true
}
