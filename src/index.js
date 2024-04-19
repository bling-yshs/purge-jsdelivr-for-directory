const core = require('@actions/core')
const github = require('@actions/github')
const httpClient = require('@actions/http-client') // https://github.com/actions/http-client

// read action inputs
const actionInput = {
  token: core.getInput('token', { required: true }),
  path: core
    .getInput('path', { required: true })
    .split('\n')
    .map(url => url.trim()),
  retry: parseInt(core.getInput('retry'), 10),
  branchName: core.getInput('branchName')
}

const result = {
  token: undefined,
  path: undefined,
  retry: undefined,
  branchName: undefined
}

async function run() {
  core.info('start action')
  // processInput
  // token
  result.token = actionInput.token
  // path
  result.path = actionInput.path
  if (Number.isNaN(actionInput.retry) || actionInput.retry <= 0) {
    result.retry = 10
  } else {
    result.retry = actionInput.retry
  }
  // branchName
  if (actionInput.branchName === '') {
    result.branchName = github.context.payload.repository.master_branch
  } else {
    result.branchName = actionInput.retry
  }
  
  const cdnList = []
  // https://purge.jsdelivr.net/gh/bling-yshs/custom-clash-rule@main/proxy.yaml
  const octokit = github.getOctokit(result.token)
  for (const path of result.path) {
    core.info(
      `${result.branchName}|||
      ${github.context.payload.repository.owner.name}|||
      ${github.context.payload.repository.name}|||
      ${path}
      `
    )
    const response = await octokit.request(
      `GET /repos/{owner}/{repo}/contents/{path}?ref=${result.branchName}`,
      {
        owner: github.context.payload.repository.owner.name,
        repo: github.context.payload.repository.name,
        path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
    const infoList = response.data
    for (const infoListElement of infoList) {
      if (infoListElement.type === 'dir') {
        continue
      }
      const url = `https://purge.jsdelivr.net/gh/${github.context.payload.repository.full_name}@${result.branchName}/${infoListElement.path}`
      cdnList.push(url)
    }
  }
  core.info(`urls：${JSON.stringify(cdnList)}`)
  const http = new httpClient.HttpClient()
  for (const url of cdnList) {
    for (let i = 0; i < result.retry + 1; i++) {
      if (i === result.retry) {
        core.error(`⛔️refresh failed: ${url}`)
        break
      }
      const cdnResponse = await http.get(url)
      if (cdnResponse.message.statusCode === 200) {
        core.info(`✅️ ${url}`)
        break
      }
    }
  }
}

// run the action
try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
