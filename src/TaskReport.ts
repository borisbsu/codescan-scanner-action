import * as path from "path";
import * as fs from 'fs-extra';
import * as core from '@actions/core'
const glob = require('@actions/glob');

export const REPORT_TASK_NAME = 'report-task.txt';

interface ITaskReport {
  ceTaskId: string;
  ceTaskUrl?: string;
  dashboardUrl?: string;
  projectKey: string;
  serverUrl: string;
}

export default class TaskReport {

  private readonly report: ITaskReport;

  constructor(report: Partial<ITaskReport>) {
    for (const field of ['projectKey', 'ceTaskId', 'serverUrl']) {
      if (!report[field as keyof ITaskReport]) {
        throw TaskReport.throwMissingField(field);
      }
    }
    this.report = report as ITaskReport;
  }

  public static createTaskReportsFromFiles(
      filePaths = TaskReport.findTaskFileReport()
  ): Promise<TaskReport[]> {
    return Promise.all(
        filePaths.map(filePath => {
          if (!filePath) {
            return Promise.reject(
                TaskReport.throwInvalidReport(
                    `[CS] Could not find '${REPORT_TASK_NAME}'.` +
                    ` Possible cause: the analysis did not complete successfully.`
                )
            );
          }
          core.debug(`[CS] Read Task report file: ${filePath}`);
          return fs.access(filePath, fs.constants.R_OK).then(
              () => this.parseReportFile(filePath),
              () => {
                return Promise.reject(
                    TaskReport.throwInvalidReport(`[CS] Task report not found at: ${filePath}`)
                );
              }
          );
        })
    );
  }

  private static findTaskFileReport(): string[] {
    const taskReportGlob = path.join('**', REPORT_TASK_NAME);
    // const taskReportGlobResult = tl.findMatch(
    //     tl.getVariable('Agent.BuildDirectory'),
    //     taskReportGlob
    // );
    core.debug("1!!");
    const globber = glob.create('**', {followSymbolicLinks: false})
    core.debug("2!!");
    const files = globber.glob()
    core.debug("3!!");
    console.log(files)

    const globber2 = glob.create('**/' + REPORT_TASK_NAME, {followSymbolicLinks: false})
    const files2 = globber2.glob()
    console.log(files2)

    // glob(__dirname + '/**/' + REPORT_TASK_NAME, {}, (err, files)=>{
    //   console.log(11, files)
    // });
    // core.debug("2");
    // glob(taskReportGlob, {}, (err, files)=>{
    //   console.log(22, files)
    // });
    // glob(__dirname, {}, (err, files)=>{
    //   console.log(33, files)
    // });
    // glob(__dirname + '/*', {}, (err, files)=>{
    //   console.log(44, files)
    // });
    core.debug("3");
    // core.debug(`[CS] Searching for ${taskReportGlob} - found ${taskReportGlobResult.length} file(s)`);
    //return taskReportGlobResult;
    return [];
  }

  private static parseReportFile(filePath: string): Promise<TaskReport> {
    return fs.readFile(filePath, 'utf-8').then(
        fileContent => {
          core.debug(`[CS] Parse Task report file: ${fileContent}`);
          if (!fileContent || fileContent.length <= 0) {
            return Promise.reject(
                TaskReport.throwInvalidReport(`[CS] Error reading file: ${fileContent}`)
            );
          }
          try {
            const settings = TaskReport.createTaskReportFromString(fileContent);
            const taskReport = new TaskReport({
              ceTaskId: settings.get('ceTaskId'),
              ceTaskUrl: settings.get('ceTaskUrl'),
              dashboardUrl: settings.get('dashboardUrl'),
              projectKey: settings.get('projectKey'),
              serverUrl: settings.get('serverUrl')
            });
            return Promise.resolve(taskReport);
          } catch (err) {
            if (err && err.message) {
              core.error(`[CS] Parse Task report error: ${err.message}`);
            } else if (err) {
              core.error(`[CS] Parse Task report error: ${JSON.stringify(err)}`);
            }
            return Promise.reject(err);
          }
        },
        err =>
            Promise.reject(
                TaskReport.throwInvalidReport(
                    `[CS] Error reading file: ${err.message || JSON.stringify(err)}`
                )
            )
    );
  }

  private static createTaskReportFromString(fileContent: string): Map<string, string> {
    const lines: string[] = fileContent.replace(/\r\n/g, '\n').split('\n'); // proofs against xplat line-ending issues
    const settings = new Map<string, string>();
    lines.forEach((line: string) => {
      const splitLine = line.split('=');
      if (splitLine.length > 1) {
        settings.set(splitLine[0], splitLine.slice(1, splitLine.length).join('='));
      }
    });
    return settings;
  }

  private static throwMissingField(field: string): Error {
    return new Error(`Failed to create TaskReport object. Missing field: ${field}`);
  }

  private static throwInvalidReport(debugMsg: string): Error {
    core.error(debugMsg);
    return new Error(
        'Invalid or missing task report. Check that the analysis finished successfully.'
    );
  }
}
