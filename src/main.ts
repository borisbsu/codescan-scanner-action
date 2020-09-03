import * as core from '@actions/core'
import {Scanner} from './Scanner'

const analysisCompleted = () => {
  core.debug('Analysis completed')
}

async function run(): Promise<void> {
  try {
    core.debug('Run CodeScan analysis')
    new Scanner().runAnalysis(
      core.getInput('codeScanUrl'),
      core.getInput('login'),
      analysisCompleted
    )

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
