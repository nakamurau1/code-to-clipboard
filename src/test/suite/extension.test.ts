import * as assert from 'node:assert';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { generateDirectoryTree, isTextFile } from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	const rootPath = path.join(__dirname, '../../..');
	const fixturesPath = path.join(rootPath, 'src', 'test', 'fixtures');

	const textFile = path.join(fixturesPath, 'sample.txt');
	const pngFile = path.join(fixturesPath, 'sample.png');
	const rsFile = path.join(fixturesPath, 'sample.rs');
	const jsonFile = path.join(fixturesPath, 'sample.json');
	const svgFile = path.join(fixturesPath, 'sample.svg');

	test('isTextFile should correctly identify text files', () => {
		assert.strictEqual(isTextFile(textFile), true);
		assert.strictEqual(isTextFile(pngFile), false);
		assert.strictEqual(isTextFile(rsFile), true);
		assert.strictEqual(isTextFile(jsonFile), true);
		assert.strictEqual(isTextFile(svgFile), false);
	});

	test('generateDirectoryTree should generate correct directory tree', () => {
		const actualOutput = generateDirectoryTree(rootPath, "");
		assert.ok(actualOutput.includes('# code-to-clipboard'), 'The output does not contain the expected project name header.');
		assert.ok(actualOutput.includes('## Directory Structure'), 'The output does not contain the expected directory structure header.');
		assert.ok(actualOutput.includes('## File Contents'), 'The output does not contain the expected file contents header.');
	});

	test('code-to-clipboard.copyCode should copy file paths and contents to clipboard', async () => {
		const rootFolderUrl = vscode.Uri.file(rootPath);
		await vscode.commands.executeCommand('vscode.openFolder', rootFolderUrl);

		const textFile1Url = vscode.Uri.file(path.join(fixturesPath, 'sample.txt'));
		const textFile2Url = vscode.Uri.file(path.join(fixturesPath, 'sample.rs'));

		const textFile1 = await vscode.workspace.openTextDocument(textFile1Url);
		await vscode.window.showTextDocument(textFile1, vscode.ViewColumn.One);

		const textFile2 = await vscode.workspace.openTextDocument(textFile2Url);
		await vscode.window.showTextDocument(textFile2, vscode.ViewColumn.Two);

		await vscode.commands.executeCommand('code-to-clipboard.copyCode');

		const clipboardContent = await vscode.env.clipboard.readText();

		const relativeFile1 = vscode.workspace.asRelativePath(textFile1Url);
		const relativeFile2 = vscode.workspace.asRelativePath(textFile2Url);

		assert.ok(clipboardContent.includes('# code-to-clipboard'), 'The clipboard content does not contain the expected project name header.');
		assert.ok(clipboardContent.includes('## Copied Files'), 'The clipboard content does not contain the expected copied files header.');
		assert.ok(clipboardContent.includes(`  - ${relativeFile1}`), `The clipboard content does not include the relative path for ${relativeFile1}.`);
		assert.ok(clipboardContent.includes(`  - ${relativeFile2}`), `The clipboard content does not include the relative path for ${relativeFile2}.`);
		assert.ok(clipboardContent.includes('## File Contents'), 'The clipboard content does not contain the expected file contents header.');
		assert.ok(clipboardContent.includes('こんにちは世界😇'), 'The clipboard content does not include the expected content for sample.txt.');
		assert.ok(clipboardContent.includes('struct User'), 'The clipboard content does not include the expected content for sample.rs.');
	});

	test('code-to-clipboard.copyDirectoryCode should copy directory structure and file contents to clipboard', async () => {
		const fixturesFolderUrl = vscode.Uri.file(fixturesPath);

		await vscode.commands.executeCommand('code-to-clipboard.copyDirectoryCode', fixturesFolderUrl);

		const clipboardContent = await vscode.env.clipboard.readText();

		assert.ok(clipboardContent.includes('# fixtures'), 'The clipboard content does not contain the expected project name header.');
		assert.ok(clipboardContent.includes('## Directory Structure'), 'The clipboard content does not contain the expected directory structure header.');
		assert.ok(clipboardContent.includes('  - sample.txt'), 'The clipboard content does not include the expected file entry for sample.txt.');
		assert.ok(clipboardContent.includes('  - sample.rs'), 'The clipboard content does not include the expected file entry for sample.rs.');
		assert.ok(clipboardContent.includes('## File Contents'), 'The clipboard content does not contain the expected file contents header.');
		assert.ok(clipboardContent.includes('こんにちは世界😇'), 'The clipboard content does not include the expected content for sample.txt.');
		assert.ok(clipboardContent.includes('struct User'), 'The clipboard content does not include the expected content for sample.rs.');
	});

	test('code-to-clipboard.copyDirectoryCode should exclude files matching the specified exclude patterns', async () => {
		const fixturesFolderUrl = vscode.Uri.file(fixturesPath);

		// 除外パターンを設定
		await vscode.workspace.getConfiguration('codeToClipboard').update('excludePatterns', ['*.json', '*.txt'], vscode.ConfigurationTarget.Global);

		await vscode.commands.executeCommand('code-to-clipboard.copyDirectoryCode', fixturesFolderUrl);

		const clipboardContent = await vscode.env.clipboard.readText();

		assert.ok(clipboardContent.includes('# fixtures'), 'The clipboard content does not contain the expected project name header.');
		assert.ok(clipboardContent.includes('## Directory Structure'), 'The clipboard content does not contain the expected directory structure header.');
		assert.ok(!clipboardContent.includes('  - sample.txt'), 'The clipboard content includes the excluded file sample.txt.');
		assert.ok(!clipboardContent.includes('  - sample.json'), 'The clipboard content includes the excluded file sample.json.');
		assert.ok(clipboardContent.includes('  - sample.rs'), 'The clipboard content does not include the expected file entry for sample.rs.');
		assert.ok(clipboardContent.includes('## File Contents'), 'The clipboard content does not contain the expected file contents header.');
		assert.ok(!clipboardContent.includes('こんにちは世界😇'), 'The clipboard content includes the content of the excluded file sample.txt.');
		assert.ok(clipboardContent.includes('struct User'), 'The clipboard content does not include the expected content for sample.rs.');

		// テスト後に除外パターンをクリア
		await vscode.workspace.getConfiguration('codeToClipboard').update('excludePatterns', undefined, vscode.ConfigurationTarget.Global);
	});
});