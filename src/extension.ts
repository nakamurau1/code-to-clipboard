import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as childProcess from "node:child_process";
import { minimatch } from 'minimatch';

interface OpenAIChatCompletionMessage {
	role: string;
	content: string;
}

interface OpenAIChatCompletionChoice {
	message?: OpenAIChatCompletionMessage;
}

interface OpenAIChatCompletionResponse {
	choices?: OpenAIChatCompletionChoice[];
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"code-to-clipboard.copyCode",
		async () => {
			const tabGroups = vscode.window.tabGroups;
			let content = "";
			const copiedFiles: string[] = [];

			for (const tabGroup of tabGroups.all) {
				for (const tab of tabGroup.tabs) {
					if (tab.input instanceof vscode.TabInputText) {
						const filePath = tab.input.uri.fsPath;
						if (isTextFile(filePath)) {
							const fileContent = fs.readFileSync(filePath, "utf8");
							const relativeFilePath = vscode.workspace.asRelativePath(filePath);
							content += `### ${relativeFilePath}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
							copiedFiles.push(relativeFilePath);
						}
					}
				}
			}

			const projectName = vscode.workspace.name || "Untitled";
			const copiedFilesContent = copiedFiles
				.map((relativeFilePath) => `  - ${relativeFilePath}`)
				.join("\n");

			const outputContent = `# ${projectName}\n\n## Copied Files\n\n${copiedFilesContent}\n\n## File Contents\n\n${content}`;

			vscode.env.clipboard.writeText(outputContent);
			vscode.window.showInformationMessage("Code copied to clipboard!");
		},
	);

	const disposableCurrentTab = vscode.commands.registerCommand(
		"code-to-clipboard.copyCurrentTabCode",
		async () => {
			const activeTextEditor = vscode.window.activeTextEditor;
			if (activeTextEditor) {
				const document = activeTextEditor.document;
				const filePath = document.uri.fsPath;
				if (isTextFile(filePath)) {
					const fileContent = document.getText();
					const relativeFilePath = vscode.workspace.asRelativePath(filePath);
					const content = `### ${relativeFilePath}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
					const projectName = vscode.workspace.name || "Untitled";
					const outputContent = `# ${projectName}\n\n## Copied Files\n\n  - ${relativeFilePath}\n\n## File Contents\n\n${content}`;
					vscode.env.clipboard.writeText(outputContent);
					vscode.window.showInformationMessage("Code copied to clipboard!");
				}
			}
		},
	);

	const disposableDirectory = vscode.commands.registerCommand(
		"code-to-clipboard.copyDirectoryCode",
		async (resource: vscode.Uri) => {
			let content = "";
			if (resource && fs.lstatSync(resource.fsPath).isDirectory()) {
				content = generateDirectoryTree(resource.fsPath, "", true);
			}
			vscode.env.clipboard.writeText(content);
			vscode.window.showInformationMessage(
				"Directory code copied to clipboard!",
			);
		},
	);

	const disposableDirectoryTree = vscode.commands.registerCommand(
		"code-to-clipboard.copyDirectoryTree",
		async (resource: vscode.Uri) => {
			if (resource && fs.lstatSync(resource.fsPath).isDirectory()) {
				const tree = generateDirectoryTree(resource.fsPath, "", false);
				vscode.env.clipboard.writeText(tree);
				vscode.window.showInformationMessage("Directory tree copied to clipboard!");
			}
		},
	);

	const disposableOpenRelatedFilesDepth1 = vscode.commands.registerCommand(
		"code-to-clipboard.openRelatedFilesDepth1",
		async (resource: vscode.Uri) => {
			try {
				const startFile = resource.fsPath;

				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (!workspaceFolders) {
					vscode.window.showErrorMessage("No workspace folder open.");
					return;
				}
				const rootPath = workspaceFolders[0].uri.fsPath;

				const allFiles = childProcess
					.execSync(`git -C "${rootPath}" ls-files`)
					.toString()
					.trim()
					.split("\n");

				const apiKey = process.env.OPENAI_API_KEY;
				if (!apiKey) {
					vscode.window.showErrorMessage("OpenAI API key not set. Set OPENAI_API_KEY env.");
					return;
				}

				const fileListText = allFiles.map(f => `- ${f}`).join("\n");
				const relativeStartFile = path.relative(rootPath, startFile);

				const prompt = `
You are given a project file list and a starting file.
The project files are:
${fileListText}

The starting file is: ${relativeStartFile}

Identify all files that are directly referenced or related to the starting file (depth=1).
Return only their relative paths, one per line, without explanations.
`;

				const response = await fetch("https://api.openai.com/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`
					},
					body: JSON.stringify({
						model: "gpt-4o",
						messages: [
							{ role: "system", content: "You are a helpful assistant." },
							{ role: "user", content: prompt }
						],
						temperature: 0
					})
				});

				if (!response.ok) {
					const errorText = await response.text();
					vscode.window.showErrorMessage(`OpenAI API error: ${errorText}`);
					return;
				}

				const data = (await response.json()) as OpenAIChatCompletionResponse;
				const content: string = data.choices?.[0]?.message?.content || "";

				const relatedFiles = content
					.split("\n")
					.map(line => line.trim())
					.filter(line => line && !line.startsWith("#") && !line.startsWith("-"));

				const existingFiles = relatedFiles
					.map(f => path.join(rootPath, f))
					.filter(f => fs.existsSync(f));

				if (existingFiles.length === 0) {
					vscode.window.showInformationMessage("No related files found.");
					return;
				}

				for (const filePath of existingFiles) {
					const doc = await vscode.workspace.openTextDocument(filePath);
					await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true });
				}

				vscode.window.showInformationMessage(`${existingFiles.length} related files opened.`);
			} catch (error: unknown) {
				if (error instanceof Error) {
					vscode.window.showErrorMessage(`Error occurred: ${error.message}`);
				} else {
					vscode.window.showErrorMessage("Error occurred.");
				}
			}
		}
	);

	context.subscriptions.push(disposable, disposableCurrentTab, disposableDirectory, disposableDirectoryTree, disposableOpenRelatedFilesDepth1);
}

export function generateDirectoryTree(dir: string, indent: string, includeFileContents: boolean): string {
	const excludePatterns = vscode.workspace.getConfiguration('codeToClipboard').get<string[]>('excludePatterns');

	const files = childProcess
		.execSync(`git -C "${dir}" ls-files`)
		.toString()
		.trim()
		.split("\n")
		.filter(file => !excludePatterns?.some(pattern => minimatch(file, pattern)));

	const projectName = path.basename(dir);
	let tree = `# ${projectName}\n\n## Directory Structure\n\n- ${projectName}/\n`;
	let fileContents = "## File Contents\n\n";

	interface FileTree {
		[key: string]: FileTree | boolean;
	}

	const fileTree: FileTree = {};

	for (const file of files) {
		const filePath = path.join(dir, file);
		const parts = file.split("/");
		let currentLevel = fileTree;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!currentLevel[part]) {
				currentLevel[part] = {};
			}
			currentLevel = currentLevel[part] as FileTree;
		}
		const fileName = parts[parts.length - 1];
		if (fs.lstatSync(filePath).isDirectory()) {
			currentLevel[fileName] = {};
			tree += generateDirectoryTree(filePath, `${indent}  `, true);
		} else if (isTextFile(filePath)) {
			currentLevel[fileName] = true;
			const fileContent = fs.readFileSync(filePath, "utf8");
			fileContents += `### ${file}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
		}
	}

	function printTree(obj: FileTree, level: string) {
		for (const key in obj) {
			tree += `${level}  - ${key}\n`;
			if (typeof obj[key] === "object") {
				printTree(obj[key] as FileTree, `${level}  `);
			}
		}
	}

	printTree(fileTree, indent);

	if (includeFileContents && indent === '') {
		return `${tree}\n${fileContents}`;
	}
	return tree;
}

export function isTextFile(filePath: string): boolean {
	try {
		if (path.extname(filePath) === ".svg") {
			return false;
		}

		const buffer = fs.readFileSync(filePath);
		const size = buffer.length;

		if (size === 0) {
			return true;
		}

		const chunk = buffer.subarray(0, size);

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
