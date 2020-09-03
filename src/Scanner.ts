import scanner from 'sonarqube-scanner'

export class Scanner {
  runAnalysis(serverUrl: string, token: string, callback: Function): void {
    scanner(
      {
        serverUrl,
        token
      },
      callback
    )
  }
}
