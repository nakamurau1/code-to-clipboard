import * as assert from "node:assert";
import * as path from "node:path";
import { isTextFile } from "../../extension";

// TODO: 🔥 テストを動かせるようにする
suite("isTextFile", () => {
	test("should return true for text files", () => {
		const textFiles = [
			"sample.txt",
			// 'sample.js',
			// 'sample.ts',
			// 'sample.json',
			// 'sample.md',
		];

		for (const file of textFiles) {
			const filePath = path.join(__dirname, "fixtures", file);

			assert.strictEqual(
				isTextFile(filePath),
				true,
				`${file} should be recognized as a text file`,
			);
		}
	});

	test("should return false for binary files", () => {
		const binaryFiles = [
			"sample.png",
			// 'sample.jpg',
			// 'sample.pdf',
			// 'sample.exe',
		];

		for (const file of binaryFiles) {
			const filePath = path.join(__dirname, "fixtures", file);
			assert.strictEqual(
				isTextFile(filePath),
				false,
				`${file} should be recognized as a binary file`,
			);
		}
	});
});
