# The magic lambda function

Upload addSecurityHeaders into aws lambda

node js 8.10
handler: index.handler

IMPORTANT: Use "US East (N. Virginia)" as Region for the lambda function!!!

The ARN is in the top-right of the aws-modify-lambda function screen. You need the ARN + a version to use in the playbook.
Use "Action" -> "Publish a new version" to create a new version.

IMPORTANT: Version $LATEST doesn't work, it's a limitation of AWS. Use the actual version number instead.
