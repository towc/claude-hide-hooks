#!/bin/bash

# Auto-revert patch on plugin uninstallation
echo "🔄 Reverting hide-hooks patch..."
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

# Determine backup path
CLAUDE_DIR=$(dirname "$CLAUDE_PATH")
CLAUDE_NAME=$(basename "$CLAUDE_PATH")
CLAUDE_EXT="${CLAUDE_NAME##*.}"
CLAUDE_BASE="${CLAUDE_NAME%.*}"

if [ "$CLAUDE_EXT" = "$CLAUDE_NAME" ]; then
    # No extension
    BACKUP_PATH="${CLAUDE_DIR}/${CLAUDE_NAME}.bak"
else
    # Has extension
    BACKUP_PATH="${CLAUDE_DIR}/${CLAUDE_BASE}.bak.${CLAUDE_EXT}"
fi

# Check if backup exists
if [ ! -f "$BACKUP_PATH" ]; then
    echo "ℹ️  No backup found at $BACKUP_PATH"
    echo "   Patch may not have been applied or was already reverted."
    exit 0
fi

# Try to restore the backup
echo "Restoring from: $BACKUP_PATH"
echo "          to: $CLAUDE_PATH"

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

    # Ask if they want to remove the backup
    echo ""
    echo "Keep backup file? (It's safe to remove)"
    echo "  $BACKUP_PATH"
else
    echo ""
    echo "✗ Failed to restore backup"
    exit $cp_exit
fi
