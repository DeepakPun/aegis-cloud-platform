variable "project_name" {
  description = "Base name prefix for ECR repositories"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g., prod)"
  type        = string
}

variable "repositories" {
  description = "List of microservice repository names to create"
  type        = list(string)
  default     = ["frontend", "backend"]
}
