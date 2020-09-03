import * as core from '@actions/core'
import {wait} from './wait'
import { Scanner } from "./Scanner";

const analysisCompleted = () => {
  core.debug('Analysis completed');
}

async function run(): Promise<void> {
  try {
    core.debug('Run CodeScan analysis');
    new Scanner().runAnalysis(core.getInput('codeScanUrl'), core.getInput('login'), analysisCompleted);

    const ms: string = '500';
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
