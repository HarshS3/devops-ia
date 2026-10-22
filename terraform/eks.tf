module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "ecommerce-cluster"
  cluster_version = "1.31"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  enable_irsa                    = false

  eks_managed_node_groups = {
    general_v2 = {
      min_size     = 1
      max_size     = 6
      desired_size = 6

      instance_types       = ["t3.micro"]
      capacity_type        = "ON_DEMAND"
      ami_type             = "AL2_x86_64"
      
      # This runs automatically when nodes boot to fix the 4-pod limit!
      post_bootstrap_user_data = <<-EOT
        sed -i 's/"maxPods": 4/"maxPods": 11/' /etc/kubernetes/kubelet/kubelet-config.json 2>/dev/null || true
        sed -i 's/--max-pods=4/--max-pods=11/g' /etc/systemd/system/kubelet.service.d/30-kubelet-extra-args.conf 2>/dev/null || true
        systemctl daemon-reload 2>/dev/null || true
        systemctl restart kubelet
      EOT

      iam_role_additional_policies = {
        ebs_csi = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
        ssm     = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      }
    }
  }

  cluster_addons = {
    vpc-cni = {
      most_recent = true
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  tags = {
    Environment = "dev"
    Project     = "ecommerce-devops"
  }

  access_entries = {
    terraform_user = {
      kubernetes_groups = []
      principal_arn     = "arn:aws:iam::520646131385:user/terraform"
      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = {
            type       = "cluster"
          }
        }
      }
    }
  }
}
