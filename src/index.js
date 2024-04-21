const core = require('@actions/core')
const github = require('@actions/github')
const httpClient = require('@actions/http-client') // https://github.com/actions/http-client

// read action inputs
const actionInput = {
  token: core.getInput('token'),
  path: core
    .getInput('path')
    .split('\n')
    .map(path => path.trim()),
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
  // Check if retry is a number and greater than 0, else set it to 10
  if (Number.isNaN(actionInput.retry) || actionInput.retry <= 0) {
    result.retry = 10
  } else {
    result.retry = actionInput.retry
  }
  // Set branchName to master_branch if it's empty, else set it to retry
  if (actionInput.branchName === '') {
    result.branchName = github.context.payload.repository.master_branch
  } else {
    result.branchName = actionInput.retry
  }
  // Initialize cdnList as an empty array
  const cdnList = []
  // Get the Octokit instance
  const octokit = github.getOctokit(result.token)
  // Loop through each path in result.path
  for (const path of result.path) {
    // Make a request to the GitHub API
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
    // Get the data from the response
    const infoList = response.data
    // Loop through each element in infoList
    for (const infoListElement of infoList) {
      // Skip if the element is a directory
      if (infoListElement.type === 'dir') {
        continue
      }
      // Construct the URL and add it to cdnList
      const url = `https://purge.jsdelivr.net/gh/${github.context.payload.repository.full_name}@${result.branchName}/${infoListElement.path}`
      cdnList.push(url)
    }
  }
  // Create a new HttpClient instance
  const http = new httpClient.HttpClient()
  // Loop through each URL in cdnList
  for (const url of cdnList) {
    // Try to refresh the URL result.retry times
    for (let i = 0; i < result.retry + 1; i++) {
      // If all retries failed, log an error
      if (i === result.retry) {
        core.error(`⛔️refresh failed: ${url}`)
        break
      }
      // Make a GET request to the URL
      const cdnResponse = await http.get(url)
      // If the response status code is 200, log a success message and break the loop
      if (cdnResponse.message.statusCode === 200) {
        core.info(`✅️ ${url}`)
        break
      }
    }
  }
  // This is the end of the run function
  core.info('end action')
}

// run the action
try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
