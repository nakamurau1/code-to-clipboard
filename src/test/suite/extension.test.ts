import * as assert from 'node:assert';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { generateDirectoryTree, generateFileTree, isTextFile } from '../../extension';

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
		assert.strictEqual(isTextFile(svgFile), false); // SVG is text file, but detected as binary
	});

	test('generateFileTree should generate correct file tree', () => {
		const expectedOutput = `## sample.txt

\`\`\`
こんにちは世界😇
\`\`\`

`;

		assert.strictEqual(generateFileTree(textFile), expectedOutput);
	});

	test('generateDirectoryTree should generate correct directory tree', () => {
		const expectedOutputStartWith = `# Directory Structure

- .eslintrc.json
- .gitignore
- .vscode-test.mjs
- .vscode/extensions.json
- .vscode/launch.json
- .vscode/settings.json
- .vscode/tasks.json
- .vscodeignore
- CHANGELOG.md
- README.md
- biome.json
- package-lock.json
- package.json
- src/extension.ts
- src/test/fixtures/sample.json
- src/test/fixtures/sample.png
- src/test/fixtures/sample.rs
- src/test/fixtures/sample.svg
- src/test/fixtures/sample.txt
- src/test/runTest.ts
- src/test/suite/extension.test.ts
- src/test/suite/index.ts
- tsconfig.json
- vsc-extension-quickstart.md
- webpack.config.js

# File Contents

## .eslintrc.json

\`\`\`
{
	"root": true,
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module"
	},
	"plugins": ["@typescript-eslint"],
	"rules": {
		"@typescript-eslint/naming-convention": [
			"warn",
			{
				"selector": "import",
				"format": ["camelCase", "PascalCase"]
			}
		],
		"@typescript-eslint/semi": "warn",
		"curly": "warn",
		"eqeqeq": "warn",
		"no-throw-literal": "warn",
		"semi": "off"
	},
	"ignorePatterns": ["out", "dist", "**/*.d.ts"]
}

\`\`\`
`;

		const actualOutput = generateDirectoryTree(rootPath, "");
		console.log("🔥", actualOutput)
		assert.ok(actualOutput.startsWith(expectedOutputStartWith), 'The output does not start with the expected directory structure.');
	});
});