#!/bin/bash

# Auto-apply patch on plugin installation
echo "🔧 Auto-applying hide-hooks patch..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the patch script
node "${SCRIPT_DIR}/hide-hooks.js"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✓ Hide-hooks patch applied successfully!"
    echo "  Hook messages are now hidden by default."
    echo "  Use SHOW_CLAUDE_HOOKS=true to show them when needed."
else
    echo ""
    echo "✗ Failed to apply patch. You can try running /hide-hooks manually."
    exit $exit_code
fi
