---
description: Patch Claude binary to conditionally hide successful hook messages
---

Patching Claude to hide successful hook execution messages...

This will:
1. Find the Claude executable (resolving any symlinks)
2. Create a backup file (e.g., claude.bak.js)
3. Patch the code to conditionally hide "hook succeeded" messages
4. Show you how to revert the change if needed

**What this hides:**
- Only hides successful hook execution messages (e.g., "hook succeeded: Success")
- Error messages and other hook output remain visible
- Does NOT affect Claude's ability to see hook feedback

**Control hook message visibility:**
- Default: Successful hook messages are hidden
- Set `SHOW_CLAUDE_HOOKS=true` to show hook messages when debugging

Example: `SHOW_CLAUDE_HOOKS=true claude` to run with hooks visible

**⚠️ Warning:** This modifies the Claude binary and is unsupported by Anthropic. Use at your own risk. Future Claude updates will overwrite this patch.

The script will automatically detect if sudo is required.

```bash
${CLAUDE_PLUGIN_ROOT}/hide-hooks.js
```
