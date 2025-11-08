# Claude Hide Hooks

A Claude Code plugin that patches the Claude binary to conditionally hide successful hook execution messages.

## What It Does

This plugin addresses [Issue #9603](https://github.com/anthropics/claude-code/issues/9603) - hiding the "hook succeeded" messages that can clutter your terminal when hooks are working properly.

**What gets hidden:**
- ✅ Successful hook execution messages (e.g., "hook succeeded: Success")
- ❌ Error messages and failures remain visible
- ❌ Does NOT affect Claude's ability to receive hook feedback

## ⚠️ Important Disclaimer

**This plugin was created by Claude (AI) with human guidance:**
- A human laid out the plans and guided the implementation
- **All code is AI-generated ("vibed") and not thoroughly checked**
- No formal testing or QA process
- May contain bugs, security issues, or unexpected behavior
- Modifies the Claude binary itself (unsupported by Anthropic)

**If you encounter issues:** Open an issue on GitHub.

## Installation

### Via Marketplace (Recommended)

First, add the marketplace:

```bash
claude plugin marketplace add towc/claude-marketplace
```

Then install the plugin:

```bash
claude plugin install hide-hooks
```

After installation, **apply the patch by running:**

```bash
/hide-hooks:patch
```

### Direct Installation

```bash
cd ~/.claude/plugins/marketplaces/
git clone https://github.com/towc/claude-hide-hooks.git
```

Restart Claude Code to load the plugin, then run `/hide-hooks:patch` to apply the patch.

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
3. Patch the code to conditionally hide successful hook messages
4. Show you how to revert if needed

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
