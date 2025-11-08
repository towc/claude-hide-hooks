#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Function to resolve the actual file path of a command
function resolveCommandPath(command) {
    try {
        // First, find where the command is located
        console.log(`Finding ${command} executable...`);
        let commandPath = execSync(`which ${command}`, { encoding: 'utf-8' }).trim();
        console.log(`Found at: ${commandPath}`);

        // Resolve symlinks by following them to the actual file
        let resolvedPath = commandPath;
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops

        while (iterations < maxIterations) {
            try {
                const stats = fs.lstatSync(resolvedPath);
                if (stats.isSymbolicLink()) {
                    const linkTarget = fs.readlinkSync(resolvedPath);
                    console.log(`  -> Symlink points to: ${linkTarget}`);

                    // Handle relative symlinks
                    if (path.isAbsolute(linkTarget)) {
                        resolvedPath = linkTarget;
                    } else {
                        resolvedPath = path.resolve(path.dirname(resolvedPath), linkTarget);
                    }
                    console.log(`  -> Resolved to: ${resolvedPath}`);
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

        if (iterations >= maxIterations) {
            console.warn('Warning: Maximum symlink resolution depth reached');
        }

        console.log(`Final resolved path: ${resolvedPath}`);
        return resolvedPath;
    } catch (err) {
        console.error(`Error finding ${command}: ${err.message}`);
        process.exit(1);
    }
}

// Get the file path - either from argument or by resolving 'claude' command
const filePath = process.argv[2] ? process.argv[2] : resolveCommandPath('claude');
const searchString = ' hook succeeded: ';

console.log(`\nReading file: ${filePath}`);
let content;
try {
    content = fs.readFileSync(filePath, 'utf-8');
} catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
}

console.log(`File size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);

// Find the position of the search string
const pos = content.indexOf(searchString);
if (pos === -1) {
    console.error('Search string not found!');
    process.exit(1);
}

console.log(`Found "${searchString}" at position ${pos}`);

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
    console.error('Could not find createElement call!');
    process.exit(1);
}

console.log(`Found createElement at position ${createElementStart}`);

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
    console.error('Could not find end of createElement call!');
    process.exit(1);
}

console.log(`createElement call ends at position ${createElementEnd}`);

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

// Show context before replacement
const contextStart = Math.max(0, returnStart !== -1 ? returnStart : createElementStart - 50);
const contextEnd = Math.min(content.length, createElementEnd + 50);
console.log('\nContext before replacement:');
console.log(content.substring(contextStart, contextEnd));

// Perform the replacement
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
    console.warn('Warning: Could not find return statement, replacing createElement with null');
    const beforeCreateElement = content.substring(0, createElementStart);
    const afterCreateElement = content.substring(createElementEnd);
    newContent = beforeCreateElement + 'null' + afterCreateElement;
}

// Show context after replacement
console.log('\nContext after replacement:');
console.log(newContent.substring(contextStart, contextStart + (contextEnd - contextStart)));

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
        console.log(`\nBackup created: ${backupPath}`);
    } else {
        console.log(`\nBackup already exists: ${backupPath}`);
    }
} catch (err) {
    console.error(`Warning: Could not create backup: ${err.message}`);
    console.error('Aborting to avoid data loss...');
    process.exit(1);
}

// Write the modified content back to the original file
try {
    fs.writeFileSync(filePath, newContent);
    console.log(`\n✓ Patched file written to: ${filePath}`);
} catch (err) {
    console.error(`Error writing file: ${err.message}`);

    // Try to write to a .patched file instead
    const patchedPath = filePath + '.patched';
    try {
        fs.writeFileSync(patchedPath, newContent);
        console.log(`\nWrote to ${patchedPath} instead (you may need to copy it manually with sudo)`);
    } catch (err2) {
        console.error(`Error writing patched file: ${err2.message}`);
        process.exit(1);
    }
}

// Verify the change
if (newContent.indexOf(searchString) === -1) {
    console.log('✓ Success: Search string removed from file');
} else {
    console.error('✗ Warning: Search string still exists in file');
}

console.log('\nDone!');
console.log('\n' + '='.repeat(70));
console.log('HOW TO REVERT THIS CHANGE:');
console.log('='.repeat(70));

// Check if we need sudo based on file permissions
let needsSudo = false;
try {
    // Try to check if file is writable
    fs.accessSync(filePath, fs.constants.W_OK);
} catch (err) {
    needsSudo = true;
}

if (needsSudo) {
    console.log(`\nRun this command to restore the original file:\n`);
    console.log(`  sudo cp "${backupPath}" "${filePath}"`);
    console.log(`\nOr to permanently remove the backup:\n`);
    console.log(`  sudo rm "${backupPath}"`);
} else {
    console.log(`\nRun this command to restore the original file:\n`);
    console.log(`  cp "${backupPath}" "${filePath}"`);
    console.log(`\nOr to permanently remove the backup:\n`);
    console.log(`  rm "${backupPath}"`);
}
console.log('\n' + '='.repeat(70));
