# Aegis Cloud Platform — Cloud-Native Task & Credential Manager

An end-to-end **Full-Stack, DevOps, and DevSecOps** reference architecture. This platform demonstrates how a decoupled full-stack application with JWT authentication and Role-Based Access Control (RBAC) is provisioned via Infrastructure as Code, orchestrated on Kubernetes, monitored in real time, and protected by automated security gates.

> **Live Portfolio:** [deepakpun.com](https://deepakpun.com) | **Sandbox Labs:** [://deepakpun.com](https://://deepakpun.com)

---

## System Architecture

*(Placeholder: Add your Excalidraw / Draw.io architecture diagram to `docs/architecture-diagram.png`)*

```text
[ Developer Push / PR ]
         │
         ▼
[ GitHub Actions DevSecOps Pipeline ]
   ├── 1. Secret Scan (Gitleaks)
   ├── 2. SAST Code Scan (Semgrep)
   ├── 3. IaC Policy Audit (Checkov)
   └── 4. Container CVE Scan (Trivy) ──▶ [ AWS ECR ]
                                              │
                                              ▼
[ AWS VPC (provisioned via Terraform) ] ──▶ [ AWS EKS (Kubernetes + Helm) ]
   ├── Public Subnets: NGINX Ingress / ALB     ├── Frontend Pods (React/Next.js)
   └── Private Subnets: EKS Nodes & AWS RDS    ├── Backend Pods (Node/Python API)
                                               └── Prometheus + Grafana Stack
```

---

## Tech Stack & Tooling

* **Application:** React / Next.js (Frontend), Node.js / Express or Python / Flask (REST API), PostgreSQL
* **Cloud & IaC:** AWS (VPC, EKS, ECR, RDS, IAM, Secrets Manager), Terraform (Modular Architecture)
* **Containers & Orchestration:** Docker (Multi-stage non-root Alpine builds), Kubernetes, Helm, NGINX Ingress
* **CI/CD & DevSecOps:** GitHub Actions, Gitleaks, Semgrep, Checkov, Trivy
* **Observability:** Prometheus, Grafana

---

## Progressive Engineering Milestones (Git Tags)

Each phase of this platform was built on an isolated feature branch, verified with automated health checks, and snapshotted using annotated Git tags for full traceability:

| Milestone | Git Tag | Focus Area | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | [`v1.0-aws-terraform`](../../tree/v1.0-aws-terraform) | **App & Cloud Foundation** | Full-stack CRUD app with JWT/RBAC, hardened Dockerfiles, and modular Terraform scripts for AWS VPC, ECR, and RDS. |
| **Phase 2** | [`v2.0-k8s-helm`](../../tree/v2.0-k8s-helm) | **Kubernetes Orchestration** | Custom Helm chart (`aegis-app`), Horizontal Pod Autoscaling (HPA), NGINX Ingress routing, and AWS EKS deployment. |
| **Phase 3** | [`v3.0-devsecops`](../../tree/v3.0-devsecops) | **Security & Observability** | Automated CI security gates (Gitleaks, Semgrep, Checkov, Trivy) blocking vulnerable builds, plus Prometheus & Grafana dashboards. |

---

## Repository Structure

```text
aegis-cloud-platform/
├── .github/workflows/          # CI/CD & DevSecOps automation pipelines
├── apps/                       # Decoupled frontend and backend microservices
├── infrastructure/terraform/   # Modular AWS IaC (VPC, ECR, RDS, EKS)
├── kubernetes/                 # Custom Helm charts and Prometheus/Grafana configs
├── docs/                       # Architecture diagrams and walkthrough notes
└── docker-compose.yml          # Local full-stack development environment
```

---

## Local Development Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd aegis-cloud-platform
   ```

2. **Spin up the local stack (Frontend + Backend + PostgreSQL):**
   ```bash
   docker compose up --build
   ```

3. **Verify API health:**
   ```bash
   curl http://localhost:5000/health
   ```

---

## Cloud Provisioning (Terraform)

To deploy the AWS infrastructure from scratch:

```bash
cd infrastructure/terraform/envs/prod
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

To tear down all cloud resources and avoid ongoing AWS charges:

```bash
terraform destroy
```
