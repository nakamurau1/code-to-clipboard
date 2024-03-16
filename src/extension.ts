import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as childProcess from "node:child_process";

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"code-to-clipboard.copyCode",
		async (resource: vscode.Uri) => {
			let content = "";
			if (resource) {
				content = generateFileTree(resource.fsPath);
			} else {
				const editor = vscode.window.activeTextEditor;
				if (editor) {
					content = generateFileTree(editor.document.uri.fsPath);
				}
			}
			vscode.env.clipboard.writeText(content);
			vscode.window.showInformationMessage("Code copied to clipboard!");
		},
	);

	const disposableDirectory = vscode.commands.registerCommand(
		"code-to-clipboard.copyDirectoryCode",
		async (resource: vscode.Uri) => {
			let content = "";
			if (resource && fs.lstatSync(resource.fsPath).isDirectory()) {
				content = generateDirectoryTree(resource.fsPath, "");
			}
			vscode.env.clipboard.writeText(content);
			vscode.window.showInformationMessage(
				"Directory code copied to clipboard!",
			);
		},
	);

	context.subscriptions.push(disposable, disposableDirectory);
}

function generateDirectoryTree(dir: string, indent: string): string {
	const files = childProcess
		.execSync(`git -C "${dir}" ls-files`)
		.toString()
		.trim()
		.split("\n");
	let tree = "# Directory Structure\n\n";
	let fileContents = "# File Contents\n\n";
	for (const file of files) {
		const filePath = path.join(dir, file);
		tree += `${indent}- ${file}\n`;
		if (fs.lstatSync(filePath).isDirectory()) {
			tree += generateDirectoryTree(filePath, `${indent}  `);
		} else if (isTextFile(filePath)) {
			const fileContent = fs.readFileSync(filePath, "utf8");
			fileContents += `## ${file}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
		}
	}
	return `${tree}\n${fileContents}`;
}

function generateFileTree(filePath: string): string {
	let content = "";
	if (isTextFile(filePath)) {
		const fileContent = fs.readFileSync(filePath, "utf8");
		content += `## ${path.basename(
			filePath,
		)}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
	}
	return content;
}

export function isTextFile(filePath: string): boolean {
	const buffer = Buffer.alloc(1024);
	let fd: number;
	try {
		fd = fs.openSync(filePath, "r");
		fs.readSync(fd, buffer, 0, 1024, 0);
		fs.closeSync(fd);
	} catch (err) {
		return false;
	}

	// Check if the file contains null bytes
	if (buffer.includes(0)) {
		return false;
	}

	// Check if the file contains control characters
	for (let i = 0; i < buffer.length; i++) {
		if (
			buffer[i] < 32 &&
			buffer[i] !== 9 &&
			buffer[i] !== 10 &&
			buffer[i] !== 13
		) {
			return false;
		}
	}

	return true;
}

export function deactivate() {}
