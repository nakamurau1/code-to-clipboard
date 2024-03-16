import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('code-to-clipboard.copyCode', async (resource: vscode.Uri) => {
		const ig = ignore();
		let gitignorePath = path.join(vscode.workspace.rootPath || '', '.gitignore');
		if (fs.existsSync(gitignorePath)) {
			ig.add(fs.readFileSync(gitignorePath).toString());
		}

		let content = '';
		let basePath = '';

		if (resource) {
			// Selected a file from the explorer
			content = generateFileTree(resource.fsPath, ig, path.dirname(resource.fsPath));
			basePath = path.dirname(resource.fsPath);
		} else {
			// Get active text editor
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				content = generateFileTree(editor.document.uri.fsPath, ig, path.dirname(editor.document.uri.fsPath));
				basePath = path.dirname(editor.document.uri.fsPath);
			}
		}

		vscode.env.clipboard.writeText(content);
		vscode.window.showInformationMessage('Code copied to clipboard!');
	});

	let disposableDirectory = vscode.commands.registerCommand('code-to-clipboard.copyDirectoryCode', async (resource: vscode.Uri) => {
		const ig = ignore();
		let gitignorePath = path.join(vscode.workspace.rootPath || '', '.gitignore');
		if (fs.existsSync(gitignorePath)) {
			ig.add(fs.readFileSync(gitignorePath).toString());
		}

		let content = '';
		if (resource && fs.lstatSync(resource.fsPath).isDirectory()) {
			// Selected a directory from the explorer
			content = generateDirectoryTree(resource.fsPath, ig, resource.fsPath);
		}

		vscode.env.clipboard.writeText(content);
		vscode.window.showInformationMessage('Directory code copied to clipboard!');
	});

	context.subscriptions.push(disposable, disposableDirectory);
}

function generateDirectoryTree(dir: string, ig: any, basePath: string, indent: string = ''): string {
	let tree = '';
	const files = fs.readdirSync(dir);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const filePath = path.join(dir, file);
		const relPath = path.relative(basePath, filePath);
		if (!ig.ignores(relPath)) {
			tree += indent + file + '\n';
			if (fs.lstatSync(filePath).isDirectory()) {
				tree += generateDirectoryTree(filePath, ig, basePath, indent + '  ');
			}
		}
	}
	return tree;
}

function generateFileTree(filePath: string, ig: any, basePath: string): string {
	let tree = '';
	const relPath = path.relative(basePath, filePath);

	if (!ig.ignores(relPath) && isTextFile(filePath)) {
		const fileContent = fs.readFileSync(filePath, 'utf8');
		tree += '```' + path.basename(filePath) + '\n';
		tree += fileContent + '\n';
		tree += '```\n\n';
	}

	return tree;
}

function isTextFile(filePath: string): boolean {
	const extname = path.extname(filePath).toLowerCase();
	const textExtensions = ['.txt', '.js', '.ts', '.json', '.css', '.html', '.md'];
	return textExtensions.includes(extname);
}

export function deactivate() { }