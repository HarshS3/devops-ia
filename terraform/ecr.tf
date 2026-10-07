resource "aws_ecr_repository" "frontend" {
  name                 = "ecommerce/frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "product_service" {
  name                 = "ecommerce/product-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "review_service" {
  name                 = "ecommerce/review-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "ecr_repository_url_frontend" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecr_repository_url_product_service" {
  value = aws_ecr_repository.product_service.repository_url
}

output "ecr_repository_url_review_service" {
  value = aws_ecr_repository.review_service.repository_url
}
