module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "ecommerce-cluster"
  cluster_version = "1.31"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general_v2 = {
      min_size     = 1
      max_size     = 3
      desired_size = 3

      instance_types       = ["t3.micro"]
      capacity_type        = "ON_DEMAND"
      ami_type             = "AL2_x86_64"
      bootstrap_extra_args = "--use-max-pods false --kubelet-extra-args '--max-pods=11'"
      iam_role_additional_policies = {
        ebs_csi = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
      }
    }
  }

  cluster_addons = {
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
      principal_arn     = "arn:aws:iam::559007813412:user/terraform"
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
