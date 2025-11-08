#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Function to resolve the actual file path of a command
function resolveCommandPath(command) {
    try {
        let commandPath = execSync(`which ${command}`, { encoding: 'utf-8' }).trim();

        // Resolve symlinks by following them to the actual file
        let resolvedPath = commandPath;
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops

        while (iterations < maxIterations) {
            try {
                const stats = fs.lstatSync(resolvedPath);
                if (stats.isSymbolicLink()) {
                    const linkTarget = fs.readlinkSync(resolvedPath);

                    // Handle relative symlinks
                    if (path.isAbsolute(linkTarget)) {
                        resolvedPath = linkTarget;
                    } else {
                        resolvedPath = path.resolve(path.dirname(resolvedPath), linkTarget);
                    }
                } else {
                    // Not a symlink, we've found the actual file
                    break;
                }
            } catch (err) {
                console.error(`Error resolving symlink: ${err.message}`);
                break;
            }
            iterations++;
        }

        return resolvedPath;
    } catch (err) {
        console.error(`Error finding ${command}: ${err.message}`);
        process.exit(1);
    }
}

// Get the file path - either from argument or by resolving 'claude' command
const filePath = process.argv[2] ? process.argv[2] : resolveCommandPath('claude');
const searchString = ' hook succeeded: ';

console.log(`\nPatching Claude binary...`);
let content;
try {
    content = fs.readFileSync(filePath, 'utf-8');
} catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
}

// Find the position of the search string
const pos = content.indexOf(searchString);
if (pos === -1) {
    console.error('Error: Could not find hook message in Claude binary.');
    console.error('This may indicate a Claude CLI update changed the code structure.');
    console.error('Please report this issue on GitHub.');
    process.exit(1);
}

// Find the start of the createElement call by searching backward
// Look for "createElement(" pattern
let createElementStart = -1;
for (let i = pos; i >= 0; i--) {
    if (content.substring(i, i + 14) === 'createElement(') {
        createElementStart = i;
        break;
    }
}

if (createElementStart === -1) {
    console.error('Error: Could not find createElement call.');
    console.error('Please report this issue on GitHub.');
    process.exit(1);
}

// Now find the matching closing parenthesis
// We need to track nested parentheses
let depth = 0;
let createElementEnd = -1;
for (let i = createElementStart + 14; i < content.length; i++) {
    if (content[i] === '(') {
        depth++;
    } else if (content[i] === ')') {
        if (depth === 0) {
            createElementEnd = i + 1; // Include the closing paren
            break;
        }
        depth--;
    }
}

if (createElementEnd === -1) {
    console.error('Error: Could not find end of createElement call.');
    console.error('Please report this issue on GitHub.');
    process.exit(1);
}

// Now search backward from createElementStart to find "return"
// Look for the pattern "return " (with space after)
let returnStart = -1;
for (let i = createElementStart - 1; i >= Math.max(0, createElementStart - 100); i--) {
    // Check for "return " followed by non-letter character or the createElement
    if (content.substring(i, i + 7) === 'return ' ||
        content.substring(i, i + 6) === 'return' && /[^a-zA-Z0-9_$]/.test(content[i - 1] || ' ')) {
        returnStart = i;
        break;
    }
}

// Context for debugging (not shown to user)
const contextStart = Math.max(0, returnStart !== -1 ? returnStart : createElementStart - 50);
const contextEnd = Math.min(content.length, createElementEnd + 50);

// Perform the replacement - just return nothing
let newContent;
if (returnStart !== -1) {
    // Replace from "return" to end of createElement with just "return;"
    const beforeReturn = content.substring(0, returnStart);
    const afterCreateElement = content.substring(createElementEnd);

    // Check if there's already a semicolon right after createElement
    const hasSemicolon = afterCreateElement[0] === ';';

    if (hasSemicolon) {
        // Replace "return ...createElement(...);" with "return;"
        newContent = beforeReturn + 'return' + afterCreateElement;
    } else {
        // Replace "return ...createElement(...)" with "return;"
        newContent = beforeReturn + 'return;' + afterCreateElement;
    }
} else {
    // If we couldn't find return, just replace the createElement call with null
    const beforeCreateElement = content.substring(0, createElementStart);
    const afterCreateElement = content.substring(createElementEnd);
    newContent = beforeCreateElement + 'null' + afterCreateElement;
}

// Context for verification (not shown to user)

// Create backup with format: <filename>.bak.<ext>
// e.g., claude.js -> claude.bak.js
const parsedPath = path.parse(filePath);
const backupPath = path.join(
    parsedPath.dir,
    `${parsedPath.name}.bak${parsedPath.ext}`
);

try {
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(filePath, backupPath);
    }
} catch (err) {
    console.error(`Error: Could not create backup: ${err.message}`);
    console.error('Aborting to avoid data loss.');
    process.exit(1);
}

// Write the modified content back to the original file
try {
    fs.writeFileSync(filePath, newContent);
} catch (err) {
    console.error(`\nError: Could not write patched file: ${err.message}`);
    console.error('You may need to run this command with elevated permissions.');
    process.exit(1);
}

// Verify the change
if (newContent.indexOf(searchString) === -1) {
    console.log('\n✓ Patch applied successfully!');
    console.log('\nHook messages are now hidden.\n');
    console.log('To revert: /hide-hooks:revert');
    console.log('After updating Claude CLI: re-run /hide-hooks:patch\n');
} else {
    console.error('\n✗ Warning: Hook message still exists in patched file.');
    console.error('Please report this issue on GitHub.\n');
}
