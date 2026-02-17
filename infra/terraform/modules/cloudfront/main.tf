locals {
  name_prefix     = "${var.project_name}-${var.environment}"
  origin_id       = "${local.name_prefix}-origin"
  admin_origin_id = "${local.name_prefix}-admin-origin"
}

# =============================================================================
# CloudFront Function — /admin path rewrite
# =============================================================================

resource "aws_cloudfront_function" "admin_rewrite" {
  count   = var.enable_admin_origin ? 1 : 0
  name    = "${local.name_prefix}-admin-rewrite"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrite /admin requests to /index.html"
  publish = true

  code = <<-EOF
    function handler(event) {
      var request = event.request;
      request.uri = '/index.html';
      return request;
    }
  EOF
}

# =============================================================================
# CloudFront Distribution
# =============================================================================

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  comment         = "${local.name_prefix} distribution"
  is_ipv6_enabled = true

  # Primary origin: EC2 (k3s)
  origin {
    domain_name = var.origin_domain
    origin_id   = local.origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Admin origin: S3 website endpoint (management console)
  dynamic "origin" {
    for_each = var.enable_admin_origin ? [1] : []
    content {
      domain_name = var.admin_origin_domain
      origin_id   = local.admin_origin_id

      custom_origin_config {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "http-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
  }

  # Default: forward to frontend (Next.js)
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Origin", "Accept", "Accept-Language"]

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # /api/* : no cache, forward everything
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # Static assets: cache aggressively
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 86400
    default_ttl = 604800
    max_ttl     = 31536000
    compress    = true
  }

  # /admin* : route to S3 management console
  dynamic "ordered_cache_behavior" {
    for_each = var.enable_admin_origin ? [1] : []
    content {
      path_pattern           = "/admin*"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      target_origin_id       = local.admin_origin_id
      viewer_protocol_policy = "redirect-to-https"

      forwarded_values {
        query_string = false

        cookies {
          forward = "none"
        }
      }

      min_ttl     = 0
      default_ttl = 300
      max_ttl     = 3600

      function_association {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.admin_rewrite[0].arn
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${local.name_prefix}-cdn"
  }
}
