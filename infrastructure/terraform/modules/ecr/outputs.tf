output "repository_urls" {
  description = "Map of service names to their ECR repository URLs"
  value       = { for k, repo in aws_ecr_repository.this : k => repo.repository_url }
}
