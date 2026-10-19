aws ssm send-command `
  --instance-ids i-0823af54e3388e587 i-08feaf129765720b2 i-0b330ecb8b2edc715 i-0d37b803b28d4e860 `
  --document-name "AWS-RunShellScript" `
  --parameters '{"commands":["sed -i ''s/--max-pods=4/--max-pods=11/g'' /etc/systemd/system/kubelet.service.d/30-kubelet-extra-args.conf", "systemctl daemon-reload", "systemctl restart kubelet"]}' `
  --region ap-southeast-2
