const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

async function begin() {
    try {
        const sonarToken = core.getInput('sonarToken');
        const sonarOrganization = core.getInput('sonarOrganization');
        const sonarProject = core.getInput('sonarProject');
        const sonarUrl = core.getInput('sonarUrl');
        const sonarProjectBaseDir = core.getInput('sonarProjectBaseDir');
        const sonarAdditionalArgs = core.getInput('sonarAdditionalArgs');

        const context = github.context;
        const ref = context.ref;
        
        await core.group('Install SonarScanner', async () => {
            await exec.exec('dotnet tool install --global dotnet-sonarscanner');
        });


        const defaultBranch = context.payload.repository.default_branch;
        const refMatch = ref.match(/refs\/([^/]*)\/(.*)/);

        let sharedArgs = `dotnet sonarscanner begin /d:sonar.host.url="${sonarUrl}" /d:sonar.login="${sonarToken}" /o:"${sonarOrganization}" /k:"${sonarProject}"`;
        if (sonarProjectBaseDir) {
            sharedArgs += ` /d:sonar.projectBaseDir="${sonarProjectBaseDir}"`;
        }
        if (sonarAdditionalArgs) {
            sharedArgs += ` ${sonarAdditionalArgs}`;
        }

        if (refMatch[1] === 'heads') {
            // Commit
            const branch = refMatch[2];

            if (branch === defaultBranch) {
                core.info(`Using default branch ${branch}`);
                await exec.exec(`${sharedArgs} /d:sonar.branch.name="${branch}" /v:"${defaultBranch}"`);
            } else {
                core.info(`Using branch ${branch}`);
                await exec.exec(`${sharedArgs} /d:sonar.branch.name="${branch}"`);
            }
        } else if (refMatch[1] === 'pull') {
            // Pull request
            const prId = refMatch[2].split('/')[0];

            core.info(`Using PR ${prId}`);
            await exec.exec(`${sharedArgs} /d:sonar.pullrequest.provider=github /d:sonar.pullrequest.key="${prId}"`);
        } else if (refMatch[1] === 'tags') {
            // Tag
            const tag = refMatch[2];

            core.info(`Using tag ${tag}`);
            await exec.exec(`${sharedArgs} /d:sonar.branch.name="${defaultBranch}" /v:"${tag}"`);
        } else {
            core.setFailed(`No valid ref found (${ref})`);
        }
    } catch (err) {
        core.setFailed(err);
    }
}

async function end() {
    try {
        const sonarToken = core.getInput('sonarToken');
        
        await exec.exec(`dotnet sonarscanner end /d:sonar.login="${sonarToken}"`);
    } catch (err) {
        core.setFailed(err);
    }
}

(async () => {
    const isPost = core.getState('isPost');
    if (!isPost) {
        await begin();
        core.saveState('isPost', true);
    } else {
        await end();
    }
})();
