# Terraform Destroy DependencyViolation Guide

## The Problem
When running `terraform destroy`, you may encounter errors like this:
```
Error: deleting EC2 Subnet: api error DependencyViolation: The subnet has dependencies and cannot be deleted.
```

## Diagnosis (Why this happens)
1. **Dynamic AWS Resources**: When you deploy the application using `kubectl apply -f k8s/`, the `frontend` Kubernetes Service is configured as `type: LoadBalancer`.
2. **Kubernetes creates AWS Resources**: Kubernetes automatically talks to AWS and provisions a Classic Load Balancer (ELB) and several Elastic Network Interfaces (ENIs) inside your subnets.
3. **Terraform is Blind**: Terraform did not create these ELBs/ENIs, so it doesn't track them in its state file.
4. **The Trap**: When you run `terraform destroy`, Terraform deletes the EKS Cluster first. Because the cluster is gone, Kubernetes is dead and cannot clean up the ELBs. The ELBs and their network interfaces are now **orphaned** inside the subnets. When Terraform tries to delete the subnets and the VPC, AWS blocks it because those orphaned resources are still sitting inside them!

## The Fix (If you're already stuck)
If your `terraform destroy` is already failing, you must manually delete the orphaned Load Balancers and Security Groups created by Kubernetes:

1. **Delete Orphaned ELBs:**
   ```bash
   aws elb describe-load-balancers --region ap-southeast-2
   aws elb delete-load-balancer --load-balancer-name <name-from-above> --region ap-southeast-2
   ```
2. **Delete Orphaned Security Groups:**
   ```bash
   aws ec2 describe-security-groups --region ap-southeast-2 --filters "Name=group-name,Values=k8s-elb*"
   aws ec2 delete-security-group --group-id <sg-id-from-above> --region ap-southeast-2
   ```
3. **Resume Terraform:**
   ```bash
   terraform destroy -auto-approve
   ```

## The Prevention (How to avoid this forever)
To safely destroy your infrastructure to save costs over the weekend, you MUST tell Kubernetes to clean up its own resources **before** you destroy the cluster.

**Always run this command first:**
```bash
kubectl delete -f ./k8s/
```
*(Wait 1-2 minutes for Kubernetes to delete the ELBs from AWS)*

**Then you can safely run:**
```bash
cd terraform
terraform destroy -auto-approve
```
