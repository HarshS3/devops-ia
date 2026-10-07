terraform {
  required_version = ">= 1.0.0"
  
  backend "s3" {
    bucket         = "ecommerce-devops-tfstate-559007813412"
    key            = "ecommerce/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ecommerce-devops-tf-lock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
