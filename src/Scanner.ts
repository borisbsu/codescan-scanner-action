import scanner from 'sonarqube-scanner'

export class Scanner {
  runAnalysis(
    serverUrl: string,
    token: string,
    options: object,
    callback: Function
  ): void {
    scanner(
      {
        serverUrl,
        token,
        options
      },
      callback
    )
  }
}
