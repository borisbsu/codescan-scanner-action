import scanner from 'sonarqube-scanner'
import * as core from '@actions/core'

export class Scanner {

  runAnalysis(
    serverUrl: string,
    token: string,
    options: object,
    callback: Function
  ): void {
    core.debug(`[CS] Scanner options: ${JSON.stringify(options)}`)
    scanner(
      {
        serverUrl,
        token,
        options
      },
      callback
    )
  }

  waitForTaskCompletion(

  ): void {

  }
}
