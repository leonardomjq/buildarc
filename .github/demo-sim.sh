#!/bin/bash
# Simulated buildarc output for demo recording
# This script mimics the full CLI experience (v0.2.x)

printf "\n"
printf "  \033[36m◆\033[0m \033[1mBUILDARC\033[0m  \033[2mv0.2.1\033[0m\n"
printf "    \033[2mYour build story, recovered.\033[0m\n"
printf "  \033[2m────────────────\033[0m\n"
printf "\n"
sleep 0.4
printf "  \033[2mReading your Claude Code sessions...\033[0m\n"
printf "\n"
sleep 1.2
printf "  \033[1m47\033[0m sessions  \033[1m183\033[0m moments  \033[32m12\033[0m decisions  \033[33m3\033[0m pivots                  \033[2m1.2s\033[0m\n"
sleep 0.3
printf "  Saved to \033[2m.buildarc/BUILDARC.md\033[0m\n"
sleep 0.5
printf "\n"
printf "  \033[2m────────────────\033[0m\n"

# Arrow menu
printf "\n"
printf "  \033[1mWhat do you want to share?\033[0m\n"
printf "\n"
printf "  \033[36m❯\033[0m \033[1mX thread\033[0m\n"
printf "    LinkedIn post\n"
printf "    Build journal\n"
printf "    All of the above\n"
printf "    Just the summary\n"
sleep 1.5

# Expectation-setter + spinner
printf "\n"
printf "  \033[2mThis usually takes 60–90 seconds — Claude is writing, not fetching.\033[0m\n"
printf "\n"
sleep 0.4
frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
messages=(
  "Reading your moments..."
  "Finding the story..."
  "Crafting your thread..."
  "Finding the hook..."
  "Compressing weeks into tweets..."
)

elapsed=0
msg_idx=0
for i in $(seq 1 50); do
  frame=${frames[$((i % 10))]}
  # Advance message every ~10 frames (≈1s)
  msg_idx=$(( i / 10 ))
  if [ $msg_idx -ge ${#messages[@]} ]; then
    msg_idx=$(( ${#messages[@]} - 1 ))
  fi
  elapsed=$(( i / 10 ))
  if [ $elapsed -gt 0 ]; then
    timer="${elapsed}s"
  else
    timer=""
  fi
  printf "\r\033[K  \033[36m%s\033[0m \033[2m%s\033[0m%*s\033[2m%s\033[0m" "$frame" "${messages[$msg_idx]}" $((40 - ${#messages[$msg_idx]})) "" "$timer"
  sleep 0.1
done
printf "\r\033[K"

# Result
printf "  \033[32m✓\033[0m \033[1mX thread\033[0m                                                           \033[2m5.2s\033[0m\n"
sleep 0.3

# Preview box
printf "\n"
printf "  \033[2m┌───────────────────────────────────────────────────────────────────┐\033[0m\n"
printf "  \033[2m│\033[0m 1/ Built a SaaS with Claude Code over 6 weeks. 45 sessions.     \033[2m│\033[0m\n"
printf "  \033[2m│\033[0m Here's how it actually went — the mass-deleted landing page,    \033[2m│\033[0m\n"
printf "  \033[2m│\033[0m the API pivot that saved \$200/mo, and the moment that became    \033[2m│\033[0m\n"
printf "  \033[2m│\033[0m a new tool.                                                     \033[2m│\033[0m\n"
printf "  \033[2m│\033[0m                                                                 \033[2m│\033[0m\n"
printf "  \033[2m│\033[0m 2/ Week 1–2: Setup flew. Cookie-based auth, Postgres, Tailwind… \033[2m│\033[0m\n"
printf "  \033[2m│\033[0m …                                                               \033[2m│\033[0m\n"
printf "  \033[2m└───────────────────────────────────────────────────────────────────┘\033[0m\n"
sleep 0.3
printf "  \033[2m→\033[0m .buildarc/tweet.md — paste into X\n"
printf "\n"
sleep 3
