# Aegis Cloud Platform

**End-to-End Cloud-Native Full-Stack Platform on AWS EKS, Terraform, Helm & DevSecOps CI/CD**

Aegis Cloud Platform demonstrates a production-grade cloud infrastructure and DevSecOps workflow—taking a containerized Next.js and Node/Express application from local development to a high-availability AWS Kubernetes deployment backed by Infrastructure as Code, automated security gates, and observability.

---

## Architecture Overview

```text
[ Users / Browser ]
         │
         ▼
[ AWS Elastic Load Balancer (NGINX Ingress Controller) ]
         │
         ├─── /      ──▶ [ Next.js Frontend Pods (EKS Private Subnets) ]
         └─── /api/* ──▶ [ Express REST API Pods + HPA (EKS Private Subnets) ]
                                  │
                                  ├──▶ [ MongoDB (ClusterIP Service) ]
                                  └──▶ [ AWS RDS PostgreSQL 16 (Private Subnets) ]
```

### Core Stack

- **Application:** Next.js / React Frontend (`:3000`), Node.js / Express REST API (`:3001`) with JWT authentication, RBAC, and `/health` readiness probes.
- **Infrastructure as Code (Terraform):** Modular AWS provisioning (`vpc`, `ecr`, `rds`, `eks`) across two Availability Zones with a remote **Amazon S3 backend** and native `.tflock` state locking.
- **Containerization & Orchestration:** Multi-stage, non-root Alpine Docker images hosted in private **Amazon ECR** repositories (`scan_on_push` enabled), deployed via a custom **Helm chart** with Horizontal Pod Autoscaling (HPA) and NGINX Ingress path routing.
- **DevSecOps & CI/CD (GitHub Actions):** Automated security scanning with **Gitleaks** (secrets), **Semgrep** (SAST), **Checkov** (Terraform IaC policy checks), and **Trivy** (container vulnerability scanning), paired with automated Terraform and Helm deployment workflows.
- **Observability:** Prometheus and Grafana configuration (`kubernetes/monitoring/prometheus-values.yaml`) for cluster and workload telemetry.

---

## Live AWS Deployment Proof

![Aegis Cloud Platform Live on AWS EKS](docs/live-deployment.png)

_Deployed on Amazon EKS (`us-east-1`) behind an AWS Classic/Network Load Balancer via NGINX Ingress, verified end-to-end across frontend UI, `/api/health` readiness probes, and database connectivity._

---

## Repository Structure

```text
aegis-cloud-platform/
├── .github/workflows/          # DevSecOps CI, EKS CD, and Terraform automation pipelines
├── apps/
│   ├── frontend/               # Next.js UI + multi-stage Alpine Dockerfile
│   └── backend/                # Express API + multi-stage Alpine Dockerfile
├── infrastructure/terraform/
│   ├── envs/prod/              # Root production orchestration, variables & S3 backend
│   └── modules/                # Reusable VPC, ECR, RDS, and EKS modules
├── kubernetes/
│   ├── helm/aegis-app/         # Custom Helm chart (Deployments, Services, Ingress, HPA)
│   └── monitoring/             # Prometheus & Grafana Helm values
├── docs/                       # Architecture diagrams, progress logs & live screenshots
└── docker-compose.yml          # Local full-stack development environment
```

---

## Engineering Milestones (Git Tags)

Each phase of the platform was developed on an isolated feature branch, merged via Pull Request, and tagged for traceability:

| Tag                             | Milestone                             | Key Deliverables                                                                                               |
| :------------------------------ | :------------------------------------ | :------------------------------------------------------------------------------------------------------------- |
| **`4.01.app_core`**             | Application Core & Containerization   | Next.js frontend, Express API (JWT + RBAC), multi-stage non-root Dockerfiles, local Compose                    |
| **`4.02.aws_infra`**            | Phase 1: AWS Core Infrastructure      | Remote S3 state backend with locking, multi-AZ VPC (public/private subnets + NAT), ECR, private RDS PostgreSQL |
| **`4.03.eks_helm`**             | Phase 2: Kubernetes & Helm Deployment | AWS EKS control plane & managed node group, NGINX Ingress Controller, custom Helm chart with HPA               |
| **`4.04.devsecops_monitoring`** | Phase 3: DevSecOps & Observability    | GitHub Actions pipelines (Gitleaks, Semgrep, Checkov, Trivy) & Prometheus/Grafana values                       |

---

## Quick Start

### 1. Local Development

```bash
docker compose up --build
```

### 2. Provision AWS Infrastructure (Terraform)

```bash
cd infrastructure/terraform/envs/prod
terraform init
terraform plan
terraform apply
```

### 3. Deploy Application to EKS (Helm)

```bash
aws eks update-kubeconfig --region us-east-1 --name aegis-prod-eks
helm upgrade --install aegis-app ./kubernetes/helm/aegis-app \
  --set-string awsAccountId="<AWS_ACCOUNT_ID>"
```

### 4. Clean Teardown

```bash
helm uninstall aegis-app
helm uninstall ingress-nginx -n ingress-nginx
cd infrastructure/terraform/envs/prod && terraform destroy
```
