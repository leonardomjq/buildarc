# VHS tape file for recording buildarc demo GIF
# Install vhs: brew install vhs
# Run from repo root: vhs .github/demo.tape

Output .github/assets/demo.gif

Set Shell "bash"
Set FontSize 15
Set Width 720
Set Height 460
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 40ms
Set CursorBlink false

# Set up a fake npx that runs our simulation, then clear the screen
Hide
Type "npx() { bash .github/demo-sim.sh; }"
Enter
Sleep 200ms
Type "clear"
Enter
Sleep 300ms
Show

Sleep 500ms

Type "npx buildarc"
Sleep 300ms
Enter

Sleep 18s
