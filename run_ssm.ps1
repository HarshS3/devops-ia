aws ssm send-command `
  --instance-ids i-0204bd7146fa2f87b i-0374b6260b49bb71b i-00eef9f5acaf0db06 i-08a774ebed11088c2 `
  --document-name "AWS-RunShellScript" `
  --parameters '{"commands":["sed -i ''s/\"maxPods\": 4/\"maxPods\": 11/'' /etc/kubernetes/kubelet/kubelet-config.json", "systemctl restart kubelet"]}' `
  --region us-east-1
