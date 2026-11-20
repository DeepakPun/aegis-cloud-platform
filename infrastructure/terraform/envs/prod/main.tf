# Verify AWS credentials and account context
data "aws_caller_identity" "current" {}

# ==============================================================================
# Phase 1: Networking, Container Registry & Database
# (Uncomment each block as we create the corresponding module files)
# ==============================================================================

module "vpc" {
  source = "../../modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

output "vpc_id" {
  description = "Production VPC ID"
  value       = module.vpc.vpc_id
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

output "ecr_repository_urls" {
  description = "ECR URLs for pushing frontend and backend Docker images"
  value       = module.ecr.repository_urls
}

module "rds" {
  source = "../../modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  vpc_cidr           = var.vpc_cidr
  private_subnet_ids = module.vpc.private_subnet_ids
  db_username        = var.db_username
  db_password        = var.db_password
}

output "rds_endpoint" {
  description = "PostgreSQL database endpoint"
  value       = module.rds.db_endpoint
}


# ==============================================================================
# Phase 2: AWS EKS Kubernetes Cluster
# ==============================================================================

# module "eks" {
#   source = "../../modules/eks"
#
#   project_name       = var.project_name
#   environment        = var.environment
#   vpc_id             = module.vpc.vpc_id
#   private_subnet_ids = module.vpc.private_subnet_ids
# }

# ==============================================================================
# Helpful Outputs
# ==============================================================================

output "aws_account_id" {
  description = "Verified AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}
