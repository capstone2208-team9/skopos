# Skopos API Monitoring Solution

Monitor Multi-step API interactions


## Tech/Frameworks

Built with:
- AWS CDK
- React
  - Formik/Yup for form validation
  - Apollo Client
- ExpressJS
- Apollo Server
- TypeGraphql
- Prisma
- XState


- Skopos deploys to your AWS account

Installation Steps:  
1. Install [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_prerequisites)
2. Configure your AWS account (Skopos will use your default credentials)

## This repo uses npm workspaces  

packages
cdk - aws cdk app  
frontend - skopos react app

To install all dependencies  
`npm install`

To install package in specific workspace  
`npm install -w packages/cdk <package_name>`  



