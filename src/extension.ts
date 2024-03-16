import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as childProcess from "node:child_process";

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"code-to-clipboard.copyCode",
		async () => {
			const tabGroups = vscode.window.tabGroups;
			let content = "";

			for (const tabGroup of tabGroups.all) {
				for (const tab of tabGroup.tabs) {
					if (tab.input instanceof vscode.TabInputText) {
						const filePath = tab.input.uri.fsPath;
						if (isTextFile(filePath)) {
							const fileContent = fs.readFileSync(filePath, "utf8");
							content += `## ${path.basename(filePath)}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
						}
					}
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

function isTextFile(filePath: string): boolean {
	try {
		const buffer = fs.readFileSync(filePath);
		const size = buffer.length;

		if (size === 0) {
			return true;
		}

		const chunk = buffer.slice(0, size);

		// Check for BOM
		if (size >= 3 && chunk[0] === 0xEF && chunk[1] === 0xBB && chunk[2] === 0xBF) {
			return true;
		}

		// Check for text characters
		for (let i = 0; i < chunk.length; i++) {
			const charCode = chunk[i];
			if (charCode === 0) {
				return false;
			}
			if (charCode < 7 || (charCode >= 14 && charCode < 32 && charCode !== 27)) {
				return false;
			}
		}

		return true;
	} catch (error) {
		return false;
	}
}

export function deactivate() { }
