import * as path from "node:path";

import { runTests } from "@vscode/test-electron";
import { tmpdir } from "node:os";

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, "../../");
		const extensionTestsPath = path.resolve(__dirname, "./suite/index");

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			// NOTE: テスト二回目にENOENTエラーが出るのを回避するため https://nikkie-ftnext.hatenablog.com/entry/vscode-extension-codelens-e2e-beginner
			launchArgs: ["--user-data-dir", `${tmpdir()}`],
		});
	} catch (err) {
		console.error("Failed to run tests");
		process.exit(1);
	}
}

main();
