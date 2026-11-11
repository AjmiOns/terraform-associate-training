# Terraform Certification Prep

Study notes, quizzes and hands-on labs while preparing for the HashiCorp Terraform Associate certification, alongside my university IaC course.

## Structure

| Folder | Content |
|---|---|
| `course/` | Chapter notes, written in my own words |
| `quiz/` | Comprehension questions and flashcards |
| `labs/` | Self-contained hands-on labs (each has its own `provider.tf` and state) |
| `cheatsheets/` | Quick references |

## Progress

| # | Chapter | Notes | Quiz | Lab | Done |
|---|---|---|---|---|---|
| 01 | Intro to IaC and first deployment | ✅ | [Take Quiz](https://ajmions.github.io/terraform-associate-training/quiz/introduction-quiz.html) | ✅ | ✅ |
| 02 | *To be added* | ⬜ | ⬜ | ⬜ | ⬜ |

## Rules

- Never commit credentials or `*.tfstate` files.
- Run `terraform fmt` and `terraform validate` before every commit.
- Every lab ends with `terraform destroy`.
- Commit messages: `lab01: add provider config`, `course01: add notes`.