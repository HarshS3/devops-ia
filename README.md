# Ecommerce DevOps Project

This repository contains the Infrastructure as Code, Kubernetes manifests, and application source code for our E-commerce platform.

## Infrastructure as Code (Terraform)
We use Terraform to automatically provision our AWS environment (EKS Cluster, VPC, ECR Repositories). 

### Remote State Backend
We follow Enterprise DevOps best practices by storing our Terraform state in the cloud rather than locally.
- **S3 Bucket**: `ecommerce-devops-tfstate-520646131385` (Stores `terraform.tfstate` with Versioning enabled)
- **DynamoDB Table**: `ecommerce-devops-tf-lock` (Prevents concurrent apply conflicts)

Because the state is stored remotely, GitHub Actions is able to safely run `terraform apply` on every merge to `master`.

### How to Destroy Infrastructure
If you need to tear down the AWS environment to save costs, simply run the following from your local terminal:
```bash
cd terraform
terraform destroy --auto-approve
```
Because your local terminal is connected to the S3 bucket, it will safely read the remote state and destroy the resources.

## Last Deployed
Infrastructure re-provisioned: 2026-10-22
