variable "project_name" {
  description = "Base name prefix for VPC resources"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g., prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}
