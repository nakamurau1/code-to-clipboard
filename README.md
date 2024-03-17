<img src="https://raw.githubusercontent.com/nakamurau1/code-to-clipboard/main/images/icon.webp" width=200>

# Code to Clipboard

Code to Clipboard is a Visual Studio Code extension that allows you to easily copy code from your workspace to the clipboard for sharing with others or for use in other applications.

## Features

- Copy code from a single file to the clipboard
- Copy code from all open text file tabs to the clipboard
- Copy code from a selected directory to the clipboard, including the directory structure
- Respects `.gitignore` files and excludes ignored files from the copied code

## Usage

### Copy Code from a Single File

1. Right-click on a file in the explorer
2. Select "Copy Code to Clipboard" from the context menu
3. The code from the selected file will be copied to the clipboard

### Copy Code from All Open Tabs

1. Right-click on any text file tab or in the editor
2. Select "Copy Code from All Open Tabs to Clipboard" from the context menu
3. The code from all open text file tabs will be copied to the clipboard

### Copy Code from a Directory

1. Right-click on a directory in the explorer
2. Select "Copy Directory Code to Clipboard" from the context menu
3. The code from all text files in the selected directory and its subdirectories will be copied to the clipboard, along with the directory structure
4. Files specified in `.gitignore` files will be excluded from the copied code

## Clipboard Format

The code is copied to the clipboard in the following format:

````
# Directory Structure

- file1.js
- file2.ts
- dir1/
  - file3.js
  - file4.ts

# File Contents

## file1.js

```
// file1.js content
```

## file2.ts

```
// file2.ts content
```

## dir1/file3.js

```
// dir1/file3.js content
```

## dir1/file4.ts

```
// dir1/file4.ts content
```
````

This format makes it easy to share the code with others while preserving the directory structure and file names.

## Requirements

- Visual Studio Code 1.60.0 or higher

## Extension Settings

This extension does not contribute any settings.

## Known Issues

None

## Release Notes

### 1.0.0

Initial release of Code to Clipboard

---

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue on the [GitHub repository](https://github.com/nakamurau1/code-to-clipboard).

## License

This extension is licensed under the [MIT License](LICENSE).