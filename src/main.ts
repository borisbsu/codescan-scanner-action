import * as core from '@actions/core'
import { Scanner } from './Scanner'
import TaskReport from "./TaskReport";
import Request from "./Request";
import * as fs from "fs";

async function run(): Promise<void> {
  try {
    core.debug('[CS] Run CodeScan Analysis');
    const args = core
      .getInput('args')
      .split('\n')
      .filter(x => x !== '')
      .reduce(function (obj: {[index: string]: string}, str) {
        const strParts = str.split('=');
        if (strParts[0] && strParts[1]) {
          obj[strParts[0].replace(/\s+/g, '')] = strParts[1].trim()
        }
        return obj
      }, {});

    const options = {
      ...args,
      'sonar.organization': core.getInput('organization'),
      'sonar.projectKey': core.getInput('projectKey')
    };

    const codeScanUrl = core.getInput('codeScanUrl');
    const authToken = core.getInput('login');
    const timeoutSec = Number.parseInt(core.getInput('pollingTimeoutSec'), 10);

    await new Scanner().runAnalysis(codeScanUrl, authToken, options);
    core.debug('[CS] CodeScan Analysis completed.');

    const reportFiles = await TaskReport.findTaskFileReport();
    console.log('reportFiles', reportFiles);
    const taskReports = await TaskReport.createTaskReportsFromFiles(reportFiles);
    console.log('taskReports', taskReports);
    const tasks = await Promise.all(
        taskReports.map(taskReport => TaskReport.getReportForTask(taskReport, codeScanUrl, authToken, timeoutSec))
    );
    console.log('tasks', tasks);
    await Promise.all(
        taskReports.map(taskReport => {
          core.debug('[CS] Downloading SARIF report for ' + taskReport.ceTaskId);
          Request.get(codeScanUrl, authToken, '/_codescan/reports/sarif/' + taskReport.ceTaskId, false).then(data => {
            fs.writeFile('codescan.sarif', data, () => {
              core.debug('[CS] The codescan.sarif file saved')
            });
          });
        })
    );
  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
