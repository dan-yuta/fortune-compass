#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1

echo "=== [$(date)] Starting k3s setup ==="

# ---- System packages ----
apt-get update -y
apt-get install -y curl unzip

# ---- AWS CLI v2 ----
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# ---- k3s (includes Traefik Ingress) ----
curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode=644

echo "Waiting for k3s to be ready..."
until k3s kubectl get nodes 2>/dev/null | grep -q " Ready"; do
  sleep 5
done
echo "k3s is ready!"

# ---- Namespace ----
k3s kubectl create namespace fortune-compass

# ---- ECR pull secret ----
TOKEN=$(aws ecr get-login-password --region ${aws_region})
k3s kubectl create secret docker-registry ecr-secret \
  --docker-server=${ecr_registry} \
  --docker-username=AWS \
  --docker-password="$TOKEN" \
  -n fortune-compass

# ---- ECR secret refresh cron (every 6h, tokens expire in 12h) ----
cat > /usr/local/bin/refresh-ecr-secret.sh << 'CRONSCRIPT'
#!/bin/bash
TOKEN=$(aws ecr get-login-password --region ${aws_region})
k3s kubectl create secret docker-registry ecr-secret \
  --docker-server=${ecr_registry} \
  --docker-username=AWS \
  --docker-password="$TOKEN" \
  -n fortune-compass \
  --dry-run=client -o yaml | k3s kubectl apply -f -
echo "$(date): ECR secret refreshed"
CRONSCRIPT
chmod +x /usr/local/bin/refresh-ecr-secret.sh
echo "0 */6 * * * root /usr/local/bin/refresh-ecr-secret.sh >> /var/log/ecr-refresh.log 2>&1" > /etc/cron.d/ecr-refresh

# ---- Apply Kubernetes manifests ----
k3s kubectl apply -f - << 'K8S'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fortune-compass
  labels:
    app: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      imagePullSecrets:
        - name: ecr-secret
      containers:
        - name: backend
          image: ${backend_image}
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "8080"
            - name: CORS_ORIGIN
              value: "*"
          readinessProbe:
            httpGet:
              path: /api/health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /api/health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
          resources:
            requests:
              cpu: 128m
              memory: 256Mi
            limits:
              cpu: 256m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: fortune-compass
spec:
  selector:
    app: backend
  ports:
    - port: 8080
      targetPort: 8080
      protocol: TCP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: fortune-compass
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      imagePullSecrets:
        - name: ecr-secret
      containers:
        - name: frontend
          image: ${frontend_image}
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
            - name: HOSTNAME
              value: "0.0.0.0"
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          resources:
            requests:
              cpu: 128m
              memory: 256Mi
            limits:
              cpu: 256m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: fortune-compass
spec:
  selector:
    app: frontend
  ports:
    - port: 3000
      targetPort: 3000
      protocol: TCP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fortune-compass
  namespace: fortune-compass
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 3000
K8S

echo "=== [$(date)] k3s setup complete ==="
