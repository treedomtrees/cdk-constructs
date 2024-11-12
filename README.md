# Treedom CDK Constructs

This repository is a collection of shared AWS CDK constructs authored by the Treedom development team. Each package contained in the `packages` folder contains a different set of constructs and can be installed separately.

__Made with ❤️ at&nbsp;&nbsp;[<img src="https://assets.treedom.net/image/upload/manual_uploads/treedom-logo-contrib_gjrzt6.png" height="24" alt="Treedom" border="0" align="top" />](#-join-us-in-making-a-difference-)__, [join us in making a difference](#-join-us-in-making-a-difference-)!

## Packages

### @treedom/cdk-constructs-datadog

A package containing CDK constructs for Datadog integration.

- [Documentation](./packages/datadog/README.md)
- [Package Information](./packages/datadog/package.json)

### @treedom/cdk-constructs-sqs-lambda

A package containing CDK constructs for SQS and Lambda integration.

- [Documentation](./packages/sqs-lambda/README.md)
- [Package Information](./packages/sqs-lambda/package.json)

## Installation

To install a specific package, use npm:

```bash
npm install @treedom/cdk-constructs-datadog
# or
npm install @treedom/cdk-constructs-sqs-lambda
```

## Usage

Please refer to the individual package README files for detailed usage instructions and API references.

## Development

### Prerequisites

- Node.js (version specified in the root package.json)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:treedomtrees/cdk-constructs.git
   cd cdk-constructs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Scripts

- `npm run lint`: Run ESLint on all TypeScript files in the packages.

Note: Build and test scripts are package-specific. Refer to individual package.json files for details.

### Development Workflow

1. Create a new branch for your feature or bug fix.
2. Make your changes in the appropriate package(s).
3. Write or update tests as necessary.
4. Run `npm run lint` from the root directory to ensure your code follows the project's coding standards.
5. Navigate to the specific package directory and run `npm run build` to build the package.
6. Run `npm run test` in the package directory to ensure all tests pass.
7. Commit your changes and push to your branch.
8. Create a pull request for review.

Ensure you have the necessary permissions to publish to the @treedom organization on npm.

## Versioning

We use [Semantic Versioning](https://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/treedomtrees/cdk-constructs/tags).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions from the community! Please read our [contributing guidelines](https://github.com/treedomtrees/.github/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

For support, please open an issue in the [GitHub repository](https://github.com/treedomtrees/cdk-constructs/issues). For urgent matters, you can contact the Treedom IT team at it@treedom.net.

## 🌳 Join Us in Making a Difference! 🌳

We invite all developers who use Treedom's open-source code to support our mission of sustainability by planting a tree with us. By contributing to reforestation efforts, you help create a healthier planet and give back to the environment. Visit our [Treedom Open Source Forest](https://www.treedom.net/en/organization/treedom/event/treedom-open-source) to plant your tree today and join our community of eco-conscious developers.

Additionally, you can integrate the Treedom GitHub badge into your repository to showcase the number of trees in your Treedom forest and encourage others to plant new ones. Check out our [integration guide](https://github.com/treedomtrees/.github/blob/main/TREEDOM_BADGE.md) to get started.

Together, we can make a lasting impact! 🌍💚


