const scanner = require('sonarqube-scanner')

export class Scanner {
  public async runAnalysis(
    serverUrl: string,
    token: string,
    callback: Function
  ) {
    scanner(
      {
        serverUrl,
        token
      },
      callback
    )
  }
}
