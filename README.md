# Gcore DNS action

![CI](https://github.com/solinumasso/gcore-dns-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/solinumasso/gcore-dns-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/solinumasso/gcore-dns-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/solinumasso/gcore-dns-action/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/solinumasso/gcore-dns-action/actions/workflows/github-code-scanning/codeql)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action provides the following functionality for GitHub Actions users:

- upsert a DNS record
- delete a DNS record

## Usage

See [action.yml](action.yml)

```yaml
- uses: solinumasso/gcore-dns-action
  with:
    # Gcore credentials
    api-key: ${{ secrets.GCORE_API_KEY }}
    # See options here: https://api.gcore.com/docs/iam#section/Authentication/APIKey

    # Whether to upsert the record or making sure it's not there
    present: true

    zone: example.com
    subdomain: www
    # If preset is true, otherwise useless
    target: example.org.

    # Optional parameters

    # default: CNAME
    type: CNAME
    # Record type
    # default: 600
    ttl: 600
```

The only output is `record` which is the raw output from Gcore API if
`present: true`.

## Contributions

Contributions are welcome! See [Contributor's Guide](contributors.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Aknowledge

This repository has been created from GitHub's template
[typescript-action](https://github.com/actions/typescript-action) under
[MIT license](https://github.com/actions/typescript-action/blob/main/LICENSE)
