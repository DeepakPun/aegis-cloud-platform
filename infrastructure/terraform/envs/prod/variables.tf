variable "aws_region" {
  description = "AWS region where aegis-cloud-platform resources will be deployed"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base name prefix for all cloud resources"
  type        = string
  default     = "aegis"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the production VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "Master username for the PostgreSQL RDS instance"
  type        = string
  default     = "aegis_admin"
}

variable "db_password" {
  description = "Master password for the PostgreSQL RDS instance (set via terraform.tfvars or TF_VAR_db_password)"
  type        = string
  sensitive   = true
}
