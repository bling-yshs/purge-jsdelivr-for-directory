# purge-jsdelivr-for-directory

"purge" the jsdelivr cache for files in some directories in the current
repository.

## Usage

### Inputs

| name         | type               | Default               | Required | comment                                                                                                                                  |
| ------------ | ------------------ | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `token`      | `string`           | `${{ github.token }}` | false    | No need to set up                                                                                                                        |
| `path`       | `string` or `list` | ''                    | false    | The directories of the file that needs to "purge", support multiple directories. If not input, the default is the root of the repository |
| `retry`      | `string`           | 10                    | false    | If "purge" fails, the number of retries                                                                                                  |
| `branchName` | `string`           |                       | false    | repository branch name, if left blank, it means is default branch of the repository                                                      |

### Example

```yaml
name: refresh jsdelivr
run-name: 'refresh jsdelivr'
on:
  push:
  workflow_dispatch:

jobs:
  refresh-jsdelivr:
    runs-on: ubuntu-latest
    steps:
      - name: Purge jsDelivr cache
        uses: bling-yshs/purge-jsdelivr-for-directory@v1.0.0
        with:
          path: |
            rules
            dir2
            dir3
            dir4
          retry: '3'
```

### Example repository

[custom-clash-rule](https://github.com/bling-yshs/custom-clash-rule)
