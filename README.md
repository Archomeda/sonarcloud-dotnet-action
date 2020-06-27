# GitHub Action: SonarCloud for .NET

This action allows scanning your .NET project(s) with SonarCloud.

## Usage
You can use this action on pushed commits, pull requests and pushed tags.  
Whenever a commit on the default branch is pushed, this action will use the name of that branch as a version tag on SonarCloud to prevent a previous version tag from moving to the most recent analysis.

```yaml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0 # This is necessary to get blame information in SonarCloud
  - uses: actions/setup-java@v1
    with:
      java-version: '>=11' # SonarCloud has deprecated usage of Java 8,
                           # and GitHub actions includes Java 8 by default
  - uses: Archomeda/sonarcloud-dotnet-action@v1
    with:
      sonarToken: ${{ secrets.SONAR_TOKEN }} # (Required) Your SonarCloud token
      sonarOrganization: 'organizationKey' # (Required) SonarCloud organization key
      sonarProject: 'projectKey' # (Required) SonarCloud project key
      sonarUrl: 'https://sonarcloud.io' # (Optional) SonarCloud host URL
      sonarProjectBaseDir: 'some-dir' # (Optional) SonarCloud project base directory
  - run: dotnet build
``` 

If you want to include code coverage, the following example works with coverlet:
```yaml
- uses: Archomeda/sonarcloud-dotnet-action@v1
  with:
    sonarToken: ${{ secrets.SONAR_TOKEN }}
    sonarOrganization: 'organizationKey'
    sonarProject: 'projectKey'
    sonarAdditionalArgs: /d:sonar.cs.opencover.reportsPaths=**/coverage.opencover.xml
- run: dotnet test --collect:"XPlat Code Coverage" -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover
```
