const core = require('@actions/core')
const github = require('@actions/github')

// read action inputs
const actionInput = {
  token: core.getInput('token', { required: true }),
  path: core
    .getInput('path', { required: true })
    .split('\n')
    .map(url => url.trim()),
  retry: parseInt(core.getInput('retry'), 10)
}

async function run() {
  core.info('start action')
  // processInput
  if (Number.isNaN(actionInput.retry) || actionInput.retry <= 0) {
    actionInput.retry = 3
  }
  // get branch name
  core.info(JSON.stringify(github.context))
  const fullRef = github.context.ref
  const branchName = fullRef.split('/')[2]
  const cdnList = []
  // https://purge.jsdelivr.net/gh/bling-yshs/custom-clash-rule@main/proxy.yaml
  const octokit = github.getOctokit(actionInput.token)
  for (const path of actionInput.path) {
    const response = await octokit.request(
      `GET /repos/{owner}/{repo}/contents/{path}?ref=${branchName}`,
      {
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
    const infoList = response.data.data
    core.info(`信息：${JSON.stringify(infoList)}`)
    for (const infoListElement of infoList) {
      if (infoListElement.type === 'dir') {
        continue
      }
      const url = `https://purge.jsdelivr.net/gh/${github.context.payload.repository.full_name}@${branchName}/${infoListElement.path}`
      cdnList.push(url)
    }
  }
  const info = JSON.stringify(cdnList)
  core.info(`信息：${info}`)
  core.info('apple end')
}

// run the action
try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
