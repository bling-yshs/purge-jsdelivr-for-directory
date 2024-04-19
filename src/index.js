const core = require('@actions/core')
const github = require('@actions/github')

// read action inputs
const actionInput = {
  path: core
    .getInput('path', { required: true })
    .split('\n')
    .map(url => url.trim()),
  retry: parseInt(core.getInput('retry'), 10)
}

async function run() {
  // processInput
  if (Number.isNaN(actionInput.retry) || actionInput.retry <= 0) {
    actionInput.retry = 3
  }
  core.info(`值为${actionInput.retry}，路径为${actionInput.path}`)
  const info = JSON.stringify(github.context)
  core.info(`信息：${info}`)
  core.info('apple end')
}

// run the action
try {
  run()
} catch (error) {
  core.setFailed(error.message)
}
