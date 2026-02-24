# VHS tape file for recording buildarc demo GIF
# Install vhs: brew install charmbracelet/tap/vhs
# Run: vhs .github/demo.tape
#
# This produces .github/assets/demo.gif

Output .github/assets/demo.gif

Set Shell "bash"
Set FontSize 14
Set Width 800
Set Height 500
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 50ms

Sleep 500ms

Type "npx buildarc --tweet"
Sleep 500ms
Enter

Sleep 1500ms

# Simulate CLI output (vhs records whatever the terminal shows)
# For a real recording, run this against an actual project with transcripts.
# The output will look something like:
#
#   buildarc v0.1.0
#
#   Reading your Claude Code sessions...
#   Found 47 sessions | 183 moments | 12 decisions, 3 pivots
#
#   Build summary saved to .buildarc/BUILDARC.md
#
#   Generating tweet thread...
#   Done! Saved to .buildarc/tweet.md
#
#   ---
#   I mass-deleted the landing page three times before I realized
#   the problem wasn't the design...
#   ---

Sleep 8s

# Hold on the final output for readability
Sleep 3s
