# DevSecOps Demonstration Guide

This guide contains the exact snippets you can use to demonstrate your CI/CD DevSecOps pipeline in action. When you present to your professor, you can copy/paste these snippets into your code, push to GitHub, and watch the pipeline automatically block the deployment.

---

### 1. Secret Scanning Demonstration (Trivy FS)
**File to modify:** `product-service/index.js`
**Where to paste:** Anywhere near the top (e.g., Line 4)
**Snippet to add:**
```javascript
// Fake secret for security scanner detection
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
```
**What happens:** Trivy will instantly detect an exposed AWS Credential in the source code and block the build, preventing secrets from leaking into production.

---

### 2. Dependency Vulnerability Scanning (Trivy FS)
**File to modify:** `product-service/package.json`
**Where to paste:** Inside the `"dependencies"` block
**Snippet to add:**
```json
    "lodash": "4.17.10"
```
**What happens:** Trivy will scan the `package.json` and flag `lodash 4.17.10` for containing a critical Prototype Pollution vulnerability (CVE-2019-10744).

---

### 3. Dockerfile Best Practices Linting (Hadolint)
**File to modify:** `product-service/Dockerfile`
**Where to paste:** Below the `WORKDIR /app` line
**Snippet to add:**
```dockerfile
USER root
RUN cd /app
```
**What happens:** Hadolint will fail the build with rules `DL3002` (Last USER should not be root) and `SC2164` (Use WORKDIR instead of running cd). 

---

### 4. Container OS Vulnerability Scanning (Trivy Image)
**File to modify:** `product-service/Dockerfile`
**What to change:** Change the `FROM` image on Line 1.
**Change from:**
```dockerfile
FROM node:18-alpine
```
**Change to:**
```dockerfile
FROM node:14.0.0-alpine
```
**What happens:** Trivy will scan the compiled Docker image and block it from being pushed to AWS ECR because Node 14 Alpine contains dozens of unpatched operating system CVEs.

---

### 5. Infrastructure as Code (IaC) Scanning (Checkov)
**File to modify:** `k8s/product-service.yaml`
**Where to paste:** Directly under `imagePullPolicy: IfNotPresent`
**Snippet to add:**
```yaml
        securityContext:
          privileged: true
```
**What happens:** Checkov will scan your Kubernetes infrastructure manifests and block the deployment because running privileged containers in a Kubernetes cluster can allow attackers to escape the container and take over the AWS EC2 worker node.

---

### Appendix: Switching Between Audit Mode and Hard Blocking
Right now, the pipeline is in **Audit Mode** (warnings are logged, but the deployment still succeeds). This is useful for getting initial code out without being blocked by minor warnings. 

If you want to demonstrate the pipeline strictly **blocking** the deployment when a vulnerability is found, you need to switch the pipeline back to **Hard Blocking Mode**.

**File to modify:** `.github/workflows/ci.yml`

#### 1. Enable Blocking for IaC (Checkov)
Find the `Checkov IaC Scan` step and **delete** the `soft_fail: true` line.
```yaml
      - name: Checkov IaC Scan
        uses: bridgecrewio/checkov-action@master
        with:
          directory: ./k8s
          # DELETE THE LINE BELOW TO ENABLE BLOCKING:
          # soft_fail: true 
```

#### 2. Enable Blocking for Secrets, Dependencies, and Images (Trivy)
Find both the `Trivy FS Scan` and `Trivy Image Scan` steps. Change `exit-code: '0'` to `exit-code: '1'`.
```yaml
      - name: Trivy FS Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'table'
          # CHANGE '0' to '1' TO ENABLE BLOCKING:
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```
