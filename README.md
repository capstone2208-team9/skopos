![Skopos Logo](src/react-app/public/SKOPOS_logo_inverted.png)


# Skopos API Monitoring Solution

Monitor Multi-step API interactions

Skopos is deployed to your AWS account

Skopos consists of a React frontend which is hosted on S3, as well as all the backend infrastructure to get started monitoring APIs.  
After deploying the url for the React app will be provided in the command line output <ReactStack.ReactSiteURL>

## Getting Started

1. have your AWS account configured via aws-cli (Skopos uses the locally configured AWS account)
2. install [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_prerequisites)
3. `npm i -g skopos`
4. `skopos bootstrap`
5. `skopos deploy`

## Tech/Frameworks

Built with:
- AWS CDK
- React
  - Formik/Yup for form validation
  - Apollo Client
  - Tailwind CSS
- ExpressJS
- Apollo Server
- TypeGraphql
- Prisma
- XState