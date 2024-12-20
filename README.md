<img src="https://raw.githubusercontent.com/nakamurau1/code-to-clipboard/main/images/icon.webp" width=200>

# Code to Clipboard

Code to Clipboard is a Visual Studio Code extension designed to make it easy to share code with AI systems like ChatGPT and Claude3. It allows you to quickly copy code from your workspace to the clipboard in a format that provides context and clarity to the AI models.

## Features

- Copy code from a single file to the clipboard
- Copy code from the current text file tab to the clipboard
- Copy code from all open text file tabs to the clipboard
- Copy code from a selected directory to the clipboard, including the directory structure
- Copy only the directory structure of a selected directory without file contents
- Respects `.gitignore` files and excludes ignored files from the copied code
- Outputs the copied code in a well-structured format with headers for easy readability
- **Open related files (depth=1) using the `openRelatedFilesDepth1` command (NEW)**:
  Automatically open files that are directly related to the current file, allowing for quicker navigation between dependent or referenced code files. This utilizes the OpenAI API to determine related files.

## Usage

### Copy Code from Current Tab

1. Open a text file in the editor.
2. Right-click on the editor or the tab title.
3. Select "Copy Code from Current Tab to Clipboard" from the context menu.
4. The code from the current text file tab will be copied to the clipboard.

### Copy Code from All Open Tabs

1. Right-click on any text file tab or in the editor.
2. Select "Copy Code from All Open Tabs to Clipboard" from the context menu.
3. The code from all open text file tabs will be copied to the clipboard.

### Copy Code from a Directory

1. Right-click on a directory in the explorer.
2. Select "Copy Directory Code to Clipboard" from the context menu.
3. The code from all text files in the selected directory and its subdirectories will be copied to the clipboard, along with the directory structure.
4. Files specified in `.gitignore` files will be excluded from the copied code.
5. Files matching the user-specified exclude patterns will be excluded from the copied code.

### Copy Directory Tree

1. Right-click on a directory in the explorer.
2. Select "Copy Directory Tree to Clipboard" from the context menu.
3. The directory structure of the selected directory will be copied to the clipboard without file contents.

### Open Related Files

1. Right-click on a file in the explorer or have the file open in the editor.
2. Select "Open Related Files" from the context menu.
3. The extension will use the OpenAI API to identify files that are directly related to the current file (depth=1).
4. All related files that exist in your project will be automatically opened in new editor tabs, allowing you to quickly explore code dependencies and references.

## Clipboard Format

### For Code and Directory Structure:

The code is copied to the clipboard in the following format:

````
# Project Name

## Copied Files

  - file1.js
  - file2.ts
  - dir1/file3.js
  - dir1/file4.ts

## File Contents

### file1.js

```
// file1.js content
```

### file2.ts

```
// file2.ts content
```

### dir1/file3.js

```
// dir1/file3.js content
```

### dir1/file4.ts

```
// dir1/file4.ts content
```
````

### For Directory Tree Only:

When copying a directory tree, the format is:

```
# Directory Name

## Directory Structure

- Directory Name/
  - subdirectory1/
    - file1.js
  - subdirectory2/
    - file2.ts
  - file3.md
```

This format provides a clear and readable structure for the copied code, with the project or directory name at the top, followed by the list of copied files or directory structure, and then the contents of each file.

## Extension Settings

This extension contributes the following settings:

* `codeToClipboard.excludePatterns`: Glob patterns for files to exclude when copying directory code. Default is `["*.lock", "yarn.lock", "package-lock.json", "pnpm-lock.yaml", "composer.lock"]`.

To specify exclude patterns, add them to your VS Code settings:

```json
{
    "codeToClipboard.excludePatterns": ["*.lock", "*.log", "node_modules/"]
}
```

## Requirements

- Visual Studio Code 1.60.0 or higher

## Extension Settings

This extension does not contribute any settings.

## Known Issues

None

---

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue on the [GitHub repository](https://github.com/nakamurau1/code-to-clipboard).

## License

This extension is licensed under the [MIT License](LICENSE).
