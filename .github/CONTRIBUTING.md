# Contributing
We love contributions! We've compiled these docs to help you understand our contribution guidelines. If you still have questions, please [contact us](mailto:curriculum-materials@digital.education.gov.uk), we'd be super happy to help.

Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Pull Request Guidelines](#pull-request-guidelines)

## Issue Reporting Guidelines

Try to search for your issue - it may have already been answered or even fixed in the development branch. However, 
if you find that an old, closed issue still persists in the latest version, you should open a new issue.


## Pull Request Guidelines

- Branch from `master`.
- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.
- Make sure your `npm test` passes.
- If adding a new feature:
  - Add accompanying test case.
  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.
- If fixing bug:
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

## Development Setup

You will need Node.js version 10+

After cloning this repository, run:

```bash
npm install
```

## Project Structure

- `__tests__` contains all tests. The unit tests are written with [Jest](https://jestjs.io/).
- `src` contains the source code. The codebase is written in ES2015 with [Flow](https://flow.org/en/) type annotations.

## Testing and linting

See [testing and linting](/docs/contributing/testing-and-linting.md).
