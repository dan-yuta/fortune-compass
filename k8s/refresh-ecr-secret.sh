#!/bin/bash
# Refresh ECR image pull secret for k3s
# Runs via cron every 6 hours (ECR tokens expire in 12h)

set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
NAMESPACE="fortune-compass"
SECRET_NAME="ecr-secret"

# Get ECR registry URL from instance metadata or environment
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Get ECR login token
TOKEN=$(aws ecr get-login-password --region "${AWS_REGION}")

# Create or update the Kubernetes secret
sudo k3s kubectl create secret docker-registry "${SECRET_NAME}" \
  --docker-server="${ECR_REGISTRY}" \
  --docker-username=AWS \
  --docker-password="${TOKEN}" \
  -n "${NAMESPACE}" \
  --dry-run=client -o yaml | sudo k3s kubectl apply -f -

echo "$(date): ECR secret refreshed for ${ECR_REGISTRY}"
