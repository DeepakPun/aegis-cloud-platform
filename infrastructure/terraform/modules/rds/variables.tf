variable "project_name" {
  description = "Base name prefix for RDS resources"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g., prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where RDS will be deployed"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC allowed to connect to PostgreSQL"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "db_username" {
  description = "Master username for PostgreSQL"
  type        = string
}

variable "db_password" {
  description = "Master password for PostgreSQL"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Initial database name to create inside PostgreSQL"
  type        = string
  default     = "aegisdb"
}
