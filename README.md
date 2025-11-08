# Claude Hide Hooks

A Claude Code plugin that patches the Claude binary to conditionally hide successful hook execution messages.

## What It Does

This plugin addresses [Issue #9603](https://github.com/anthropics/claude-code/issues/9603) - hiding the "hook succeeded" messages that can clutter your terminal when hooks are working properly.

**What gets hidden:**
- ✅ Successful hook execution messages (e.g., "hook succeeded: Success")
- ❌ Error messages and failures remain visible
- ❌ Does NOT affect Claude's ability to receive hook feedback

## Installation

### Via Plugin Marketplace

```bash
claude plugin install claude-hide-hooks
```

**The patch is applied automatically on installation!** No need to run any additional commands.

### Manual Installation

1. Clone this repository into your Claude plugins directory:
```bash
cd ~/.claude/plugins/marketplaces/
git clone https://github.com/towc/claude-hide-hooks.git
```

2. Restart Claude Code to load the plugin
3. The patch will be applied automatically on first load

### Uninstallation

```bash
claude plugin uninstall claude-hide-hooks
```

**The patch is automatically reverted on uninstallation**, restoring the original Claude behavior

## Usage

### Automatic Patch (Recommended)

The patch is applied automatically when you install the plugin - no manual steps needed!

### Manual Patch (Optional)

If you need to re-apply the patch or want to run it manually:

```bash
/hide-hooks
```

This will:
1. Find your Claude executable (resolving any symlinks)
2. Create a backup file (e.g., `claude.bak.js`)
3. Patch the code to conditionally hide successful hook messages
4. Show you how to revert if needed

### Control Visibility

**Default behavior (hooks hidden):**
```bash
claude
```

**Show hooks when debugging:**
```bash
SHOW_CLAUDE_HOOKS=true claude
```

**Permanent visibility (add to your shell profile):**
```bash
export SHOW_CLAUDE_HOOKS=true
```

### Reverting the Patch

The script creates a backup when you first run it. To restore:

```bash
# If sudo was required:
sudo cp ~/.local/bin/claude.bak.js ~/.local/bin/claude.js

# Otherwise:
cp ~/.local/bin/claude.bak.js ~/.local/bin/claude.js
```

## How It Works

The plugin patches the Claude binary by wrapping the hook success message rendering in a conditional check:

```javascript
// Before patch:
return createElement(/* hook success message */);

// After patch:
return process.env.SHOW_CLAUDE_HOOKS === 'true' ? createElement(/* hook success message */) : null;
```

This allows you to toggle visibility with an environment variable without needing to re-patch.

## Important Notes

⚠️ **Warning:** This modifies the Claude binary and is **unsupported by Anthropic**. Use at your own risk.

- Future Claude updates will overwrite this patch
- You'll need to re-run `/hide-hooks` after updating Claude
- The patch only affects UI rendering, not functionality
- Hook errors and important messages remain visible

## Related

- [Issue #9603](https://github.com/anthropics/claude-code/issues/9603) - Turn off hook succeeded messages
- [Issue #3060](https://github.com/anthropics/claude-code/issues/3060) - Fix unnecessary printing after successful hook execution
- [Claude Boops](https://github.com/towc/claude-boops) - Add sound feedback to Claude Code (auto-installs this plugin)

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Created by [@towc](https://github.com/towc)
