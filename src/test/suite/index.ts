import * as path from "node:path";
import Mocha from "mocha";
import * as fs from "node:fs";

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: "tdd",
		color: true,
	});

	const testsRoot = path.resolve(__dirname, "..");

	return new Promise((c, e) => {
		fs.readdir(testsRoot, (err, files) => {
			if (err) {
				return e(err);
			}

			for (const file of files) {
				if (file.endsWith(".test.js")) {
					mocha.addFile(path.resolve(testsRoot, file));
				}
			}

			try {
				mocha.run((failures) => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	});
}
