import * as core from '@actions/core'
import {Scanner} from './Scanner'
import TaskReport from "./TaskReport";

async function run(): Promise<void> {
  try {
    core.debug('[CS] Run CodeScan Analysis')
    const args = core
      .getInput('args')
      .split('\n')
      .filter(x => x !== '')
      .reduce(function (obj: {[index: string]: string}, str) {
        const strParts = str.split('=')
        if (strParts[0] && strParts[1]) {
          obj[strParts[0].replace(/\s+/g, '')] = strParts[1].trim()
        }
        return obj
      }, {})

    const options = {
      ...args,
      'sonar.organization': core.getInput('organization'),
      'sonar.projectKey': core.getInput('projectKey')
    }

    await new Scanner().runAnalysis(
        core.getInput('codeScanUrl'),
        core.getInput('login'),
        options)

    core.debug('[CS] CodeScan Analysis completed.')

    const taskReports = await TaskReport.createTaskReportsFromFiles()
    console.log('taskReports', taskReports)

    // await new Scanner().runAnalysis(
    //     core.getInput('codeScanUrl'),
    //     core.getInput('login'),
    //     options,
    //     () => {
    //       core.debug('[CS] CodeScan Analysis completed.')
    //
    //       const taskReports = TaskReport.createTaskReportsFromFiles().then(result => {
    //         console.log('result', result);
    //
    //       });
    //       core.debug(JSON.stringify(taskReports));
    //       // const analyses = Promise.all(
    //       //taskReports.map(taskReport => getReportForTask(taskReport, metrics, endpoint, timeoutSec))
    //       // );
    //
    //       const sarifUrl = 'http://localhost/_codescan/reports/sarif/AXRq7kfV7ezGAhxNpad-';
    //
    //     }
    // )

    // await new Scanner().runAnalysis(
    //   core.getInput('codeScanUrl'),
    //   core.getInput('login'),
    //   options,
    //   () => {
    //     core.debug('[CS] CodeScan Analysis completed.')
    //
    //     const taskReports = TaskReport.createTaskReportsFromFiles().then(result => {
    //       console.log('result', result);
    //
    //     });
    //     core.debug(JSON.stringify(taskReports));
    //     // const analyses = Promise.all(
    //         //taskReports.map(taskReport => getReportForTask(taskReport, metrics, endpoint, timeoutSec))
    //     // );
    //
    //     const sarifUrl = 'http://localhost/_codescan/reports/sarif/AXRq7kfV7ezGAhxNpad-';
    //
    //   }
    // )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
