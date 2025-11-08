# Claude Hide Hooks

A Claude Code plugin that patches the Claude binary to hide successful hook execution messages.

## What It Does

This plugin addresses [Issue #9603](https://github.com/anthropics/claude-code/issues/9603) - hiding the "hook succeeded: Success" messages that clutter your terminal when hooks are working properly.

**Originally created to support [Claude Boops](https://github.com/towc/claude-boops)** - a plugin that adds delightful sound feedback to Claude Code using hooks. While boops provides great audio feedback, it generates verbose hook messages. This plugin removes those messages for a cleaner experience.

**What gets hidden:**
- ✅ Successful hook execution messages (e.g., "hook succeeded: Success")
- ❌ Error messages and failures remain visible
- ❌ Does NOT affect Claude's ability to receive hook feedback

**Works with any plugin that uses hooks** - not just boops!

## ⚠️ Important Disclaimer

**This plugin was created by Claude (AI) with human guidance:**
- A human laid out the plans and guided the implementation
- **All code is AI-generated ("vibed") and not thoroughly checked**
- No formal testing or QA process
- May contain bugs, security issues, or unexpected behavior
- Modifies the Claude binary itself (unsupported by Anthropic)

**If you encounter issues:** Open an issue on GitHub.

## Installation

### Recommended: Full Setup with Boops

For the best experience, install both `hide-hooks` (clean terminal) and `boops` (sound feedback):

```bash
# Add the marketplace
claude plugin marketplace add towc/claude-marketplace

# Install boops for sound feedback
claude plugin install boops

# Install hide-hooks to clean up "hook succeeded" messages
claude plugin install hide-hooks

# After Claude restarts, apply the hide-hooks patch
/hide-hooks:patch

# Restart Claude one more time to see the changes
```

**Why boops?** While hide-hooks cleans up your terminal, [Claude Boops](https://github.com/towc/claude-boops) adds delightful sound feedback so you know when Claude is thinking, waiting for input, or has finished. They work perfectly together!

### Just Hide-Hooks

If you only want to hide hook messages without sound feedback:

```bash
# Add the marketplace
claude plugin marketplace add towc/claude-marketplace

# Install hide-hooks
claude plugin install hide-hooks

# After Claude restarts, apply the patch
/hide-hooks:patch

# Restart Claude to see the changes
```


### Uninstallation

**IMPORTANT:** Uninstalling the plugin does NOT automatically revert the patch. You must revert it manually first.

Run the revert command:

```bash
/hide-hooks:revert
```

Then uninstall the plugin:

```bash
claude plugin uninstall hide-hooks
```

## Usage

### Apply the Patch

After installing the plugin, run:

```bash
/hide-hooks:patch
```

This will:
1. Find your Claude executable (resolving any symlinks)
2. Create a backup file (e.g., `claude.bak.js`)
3. Patch the code to hide successful hook messages
4. Show you how to revert if needed

**⚠️ IMPORTANT:** Restart Claude after patching to see the changes.

### After Claude Updates

When you update Claude Code, the patch will be overwritten. Simply re-apply it:

```bash
/hide-hooks:patch
```

**Note:** You don't need to uninstall and reinstall the plugin, just run the command!

### Revert the Patch

To restore the original behavior and show hook messages again:

```bash
/hide-hooks:revert
```

This will restore the Claude binary from backup.


## How It Works

The plugin patches the Claude binary by replacing the hook success message rendering with an early return:

```javascript
// Before patch:
return createElement(/* hook success message */);

// After patch:
return;
```

This completely removes the hook success messages from the UI.

## Important Notes

⚠️ **Warning:** This modifies the Claude binary and is **unsupported by Anthropic**. Use at your own risk.

- Future Claude updates will overwrite this patch
- You'll need to re-run `/hide-hooks` after updating Claude
- The patch only affects UI rendering, not functionality
- Hook errors and important messages remain visible

## Companion Plugins

### Claude Boops (Recommended)

Since you're cleaning up hook messages, you might want actual feedback when Claude is working. **[Claude Boops](https://github.com/towc/claude-boops)** adds delightful sound feedback to Claude Code - different sounds for different events (submit, question, success, error).

See the [Installation](#installation) section above for the complete setup with both plugins.

## Related Issues

- [Issue #9603](https://github.com/anthropics/claude-code/issues/9603) - Turn off hook succeeded messages
- [Issue #3060](https://github.com/anthropics/claude-code/issues/3060) - Fix unnecessary printing after successful hook execution

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Created by [@towc](https://github.com/towc)
