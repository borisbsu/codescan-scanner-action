import * as core from '@actions/core'
import {Scanner} from './Scanner'

const analysisCompleted = (): void => {
  core.debug('Analysis completed')
}

async function run(): Promise<void> {
  try {
    core.debug('Run CodeScan analysis')
    const args = core
      .getInput('args')
      .split('\n')
      .filter(x => x !== '')
      .reduce(function (obj: {[index: string]: string}, str) {
        core.debug(str)
        const strParts = str.split('=')
        core.debug(strParts[0])
        core.debug(strParts[1])
        if (strParts[0] && strParts[1]) {
          obj[strParts[0].replace(/\s+/g, '')] = strParts[1].trim()
        }
        core.debug(JSON.stringify(obj))
        return obj
      }, {})

    core.debug(
      JSON.stringify({
        ...args,
        'sonar.organization': core.getInput('organization'),
        'sonar.projectKey': core.getInput('projectKey')
      })
    )

    new Scanner().runAnalysis(
      core.getInput('codeScanUrl'),
      core.getInput('login'),
      {
        ...args,
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
