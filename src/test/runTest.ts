import * as path from 'node:path';
import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// 拡張機能の開発パスを設定
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// テストスクリプトのパスを設定
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// テスト用のワークスペースフォルダを指定
		const testWorkspace = path.resolve(__dirname, '../..');

		// テストを実行
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace], // ここでワークスペースを指定
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
