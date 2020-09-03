import * as core from '@actions/core'
import {Scanner} from './Scanner'

const analysisCompleted = (): void => {
  core.debug('Analysis completed')
}

async function run(): Promise<void> {
  try {
    core.debug('Run CodeScan analysis')
    core.debug(core.getInput('args'))
    new Scanner().runAnalysis(
      core.getInput('codeScanUrl'),
      core.getInput('login'),
      {
        'sonar.organization': core.getInput('organization'),
        'sonar.projectKey': core.getInput('projectKey')
      },
      analysisCompleted
    )

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
