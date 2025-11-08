#!/bin/bash

# Revert the hide-hooks patch

echo "Reverting hide-hooks patch..."
echo ""

# Function to resolve the actual file path of a command
resolve_command_path() {
    local command=$1
    local command_path=$(which "$command" 2>/dev/null)

    if [ -z "$command_path" ]; then
        echo "Error: Could not find $command" >&2
        return 1
    fi

    # Follow symlinks
    while [ -L "$command_path" ]; do
        command_path=$(readlink -f "$command_path")
    done

    echo "$command_path"
}

# Find the Claude executable
CLAUDE_PATH=$(resolve_command_path claude)

if [ -z "$CLAUDE_PATH" ]; then
    echo "✗ Could not find Claude executable"
    exit 1
fi

echo "Claude binary: $CLAUDE_PATH"

# Determine backup path
CLAUDE_DIR=$(dirname "$CLAUDE_PATH")
CLAUDE_NAME=$(basename "$CLAUDE_PATH")
BACKUP_PATH="${CLAUDE_DIR}/${CLAUDE_NAME%.js}.bak.js"

echo "Backup path: $BACKUP_PATH"
echo ""

# Check if backup exists
if [ ! -f "$BACKUP_PATH" ]; then
    echo "ℹ️  No backup found at $BACKUP_PATH"
    echo "   Patch may not have been applied or was already reverted."
    exit 0
fi

# Try to restore the backup
echo "Restoring from backup..."

# Check if we need sudo
if [ -w "$CLAUDE_PATH" ]; then
    cp "$BACKUP_PATH" "$CLAUDE_PATH"
    cp_exit=$?
else
    echo "Elevated permissions required..."
    sudo cp "$BACKUP_PATH" "$CLAUDE_PATH"
    cp_exit=$?
fi

if [ $cp_exit -eq 0 ]; then
    echo ""
    echo "✓ Hide-hooks patch reverted successfully!"
    echo "  Hook messages will now be visible again."
    echo ""
    echo "Removing backup file..."

    if [ -w "$BACKUP_PATH" ]; then
        rm "$BACKUP_PATH"
        echo "✓ Backup removed"
    else
        sudo rm "$BACKUP_PATH"
        echo "✓ Backup removed (with sudo)"
    fi
else
    echo ""
    echo "✗ Failed to restore backup"
    exit $cp_exit
fi
