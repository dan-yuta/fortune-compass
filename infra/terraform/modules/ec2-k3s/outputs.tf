output "public_ip" {
  value = aws_eip.k3s.public_ip
}

output "public_dns" {
  description = "Computed public DNS from EIP (ec2-X-X-X-X.region.compute.amazonaws.com)"
  value       = "ec2-${replace(aws_eip.k3s.public_ip, ".", "-")}.${var.aws_region}.compute.amazonaws.com"
}

output "instance_id" {
  value = aws_instance.k3s.id
}

output "private_key_pem" {
  value     = tls_private_key.k3s.private_key_pem
  sensitive = true
}
