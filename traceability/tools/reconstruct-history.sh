#!/bin/bash
# RECORD ONLY. Do not rerun.
# This is the script that reconstructed commits 92e2aa1..c847198 on 2026-11-22,
# replaying the order in which the research files appeared. It was run once, against
# the folder as it was then (all exports already in snapshots/, notes in place),
# using a temporary index so the working tree was never touched.
# Usage at the time: bash reconstruct-history.sh <scratch-path>

set -euo pipefail
export GIT_INDEX_FILE="$1.idx"; rm -f "$GIT_INDEX_FILE"
b(){ git hash-object -w "$1"; }
V02=$(b snapshots/original-riemann-chat_0.02.html); V03=$(b snapshots/original-riemann-chat_0.03.html)
V04=$(b snapshots/original-riemann-chat_0.04.html); V05=$(b snapshots/original-riemann-chat_0.05.html)
V06=$(b original-riemann-chat_0.06.html); N1=$(b "Onderzoeksnotitie 1"); N2=$(b "history/Onderzoeksnotitie 2")
N21=$(b "Onderzoeksnotitie 2.1"); PDF=$(b Onderzoeksnotitie-2.1-paper.pdf)
PARENT=""
add(){ git update-index --add --cacheinfo 100644,"$1","$2"; }
rmp(){ git update-index --force-remove "$1"; }
commit(){ local T C; T=$(git write-tree)
  if [ -n "$PARENT" ]; then C=$(printf '%s\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n' "$1" | git commit-tree "$T" -p "$PARENT")
  else C=$(printf '%s\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n' "$1" | git commit-tree "$T"); fi
  PARENT=$C; }
add $V02 original-riemann-chat_0.02.html; commit "Add chat export 0.02"
rmp original-riemann-chat_0.02.html; add $V02 snapshots/original-riemann-chat_0.02.html; add $V03 original-riemann-chat_0.03.html
commit "Add chat export 0.03; snapshot 0.02"
rmp original-riemann-chat_0.03.html; add $V03 snapshots/original-riemann-chat_0.03.html; add $V04 original-riemann-chat_0.04.html
commit "Add chat export 0.04; snapshot 0.03"
add $N1 "Onderzoeksnotitie 1"; commit "Add Onderzoeksnotitie 1 (from chat 0.04)"
rmp original-riemann-chat_0.04.html; add $V04 snapshots/original-riemann-chat_0.04.html; add $V05 original-riemann-chat_0.05.html
commit "Add chat export 0.05; snapshot 0.04"
add $N2 "Onderzoeksnotitie 2"; commit "Add Onderzoeksnotitie 2 (from chat 0.05)"
rmp original-riemann-chat_0.05.html; add $V05 snapshots/original-riemann-chat_0.05.html; add $V06 original-riemann-chat_0.06.html
commit "Add chat export 0.06; snapshot 0.05"
rmp "Onderzoeksnotitie 2"; add $N2 "history/Onderzoeksnotitie 2"; add $N21 "Onderzoeksnotitie 2.1"
commit "Move Onderzoeksnotitie 2 to history; add Onderzoeksnotitie 2.1 (from chat 0.06)"
add $PDF Onderzoeksnotitie-2.1-paper.pdf; commit "Add Onderzoeksnotitie 2.1 paper (PDF)"
git update-ref refs/heads/main "$PARENT"; rm -f "$GIT_INDEX_FILE"
