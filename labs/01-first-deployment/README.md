# Lab 01: First AWS deployment

## Goal
Configure the AWS provider and deploy a first resource with Terraform.

## Prerequisites
- Terraform installed and in `Path`
- AWS CLI profile `terraform-lab` configured
- `aws sts get-caller-identity --profile terraform-lab` works

## Steps
1. `terraform init`
2. `terraform fmt`
3. `terraform validate`
4. `terraform plan`
5. `terraform apply`

## Expected result
_Describe what you should see (resource created, outputs...)._

## What I learned / problems
- 

## Cleanup
```bash
terraform destroy
```
Always check the plan and the target account before confirming.
