
const WEEKS = [
  { n: 1, cls: "w1", title: "Week 1: Terraform foundations", goal: "Write your first configurations", target: "Build and destroy a simple AWS resource" },
  { n: 2, cls: "w2", title: "Week 2: Intermediate Terraform", goal: "How Terraform manages real infrastructure", target: "Explain the full infrastructure lifecycle" },
  { n: 3, cls: "w3", title: "Week 3: Advanced topics and exam prep", goal: "Become exam-ready", target: "Pass a timed mock at 85% or higher" }
];
const SESSIONS = [
  [1, 1, "IaC concepts, Terraform architecture, declarative vs imperative", "Install Terraform and run `terraform version`"],
  [2, 1, "Providers, plugins, version constraints, `.terraform.lock.hcl`, registry", "Configure the AWS provider and pin its version"],
  [3, 1, "HCL syntax, blocks, arguments, attributes", "Write your first `.tf` file"],
  [4, 1, "Resources vs data sources", "Create an S3 bucket and an AMI data-source lookup"],
  [5, 1, "Variables, outputs, locals", "Make your configuration reusable"],
  [6, 1, "Workflow and CLI, `terraform console`, debugging with `TF_LOG`", "Practice init, fmt, validate, plan, apply, destroy"],
  [7, 1, "State fundamentals, then Week 1 review with 10-15 practice questions", "Inspect `terraform.tfstate`; start your wrong-answer log"],
  [8, 2, "Lists, maps, objects, tuples, sets", "Create complex variables"],
  [9, 2, "Expressions, functions, conditionals, loops, `dynamic` blocks, splat and `for` expressions", "Use `for_each` and `count`"],
  [10, 2, "Dependencies and lifecycle, `-replace` and `taint`, provisioners and why they are a last resort", "Use `depends_on` and `create_before_destroy`"],
  [11, 2, "Terraform modules", "Build a reusable EC2 module"],
  [12, 2, "Module inputs, outputs, sources, versions, `moved` blocks", "Create root and child modules"],
  [13, 2, "State management, backends, state locking, state commands", "Configure an S3 remote backend with locking"],
  [14, 2, "Drift, `terraform import` and import blocks, CLI workspaces, then Week 2 review with 10-15 questions", "Import a resource and inspect state; update your wrong-answer log"],
  [15, 3, "Sensitive variables, secrets handling, Vault concepts", "Secure your configuration"],
  [16, 3, "Ephemeral values, write-only arguments, custom conditions, validation, checks", "Add validation rules to the project"],
  [17, 3, "HCP Terraform: `terraform login`, `cloud` block, workspaces, projects, collaboration", "Create a demo workspace"],
  [18, 3, "HCP Terraform integrations, governance, remote operations", "Explore a remote workflow"],
  [19, 3, "Full revision of all 8 objectives", "40-50 practice questions; review the wrong-answer log"],
  [20, 3, "Mock exam and weak-topic revision", "Simulate the 60-minute exam"],
  [21, 3, "Flex day: catch up on missed sessions or retake weak areas", "Retake a mock; book the exam"]
].map(([day, week, topics, exercise]) => ({ day, week, topics, exercise }));
const CHECKS = [
  "I understand all 8 official exam objectives.",
  "I can write basic Terraform configurations without copying tutorials.",
  "I understand providers, resources and data sources.",
  "I understand state, backends and state locking.",
  "I can create and use Terraform modules.",
  "I understand lifecycle rules, dependencies and validation.",
  "I understand HCP Terraform workspaces and projects.",
  "I score 85% or higher consistently on timed mock exams.",
  "My wrong-answer log shows no repeated mistakes in the last two mocks."
];
