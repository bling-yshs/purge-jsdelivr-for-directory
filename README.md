# purge-jsdelivr-for-directory

## Action function

Refresh the cache of jsdelivr for a folder in the current repository

## Usage

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
        uses: bling-yshs/purge-jsdelivr-for-directory@v1.0
        with:
          path: |
            rules
```

### Example repository

[custom-clash-rule](https://github.com/bling-yshs/custom-clash-rule)
