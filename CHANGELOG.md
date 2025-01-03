# Change Log

All notable changes to the "code-to-clipboard" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-12-20

### Added
- Added a new command "Open Related Files".
  This command uses the OpenAI API to identify files related to the currently opened file and automatically open them in the editor.

## [0.3.3] - 2024-11-10

### Fixed
- Resolved an issue where headers were duplicated in the "Copy Directory Tree to Clipboard" feature. The project name and directory structure headers now appear only once at the top of the output.

## [0.3.2] - 2024-11-09

### Added
- New command "Copy Directory Tree to Clipboard" to copy only the directory structure without file contents

## [0.3.0] - 2024-04-06

### Added
- New command "Copy Code from Current Tab to Clipboard" to copy code from the currently active text file tab

## [0.2.0] - 2024-03-31

### Added
- Output the copied code in a well-structured format with headers for easy readability
- Add a new setting `codeToClipboard.excludePatterns` to allow users to specify glob patterns for files to exclude when copying directory code

## [0.1.0] - 2024-03-30

### Added
- Initial release of Code to Clipboard extension
- Copy code from a single file to the clipboard
- Copy code from all open text file tabs to the clipboard
- Copy code from a selected directory to the clipboard, including the directory structure
- Respect `.gitignore` files and exclude ignored files from the copied code
