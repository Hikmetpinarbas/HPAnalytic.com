#!/data/data/com.termux/files/usr/bin/bash
cd ~/hpanalytic
termux-wake-lock 2>/dev/null
clear
echo "════════════════════════════════════════"
echo "  HP//Analytic v2.0"
echo "  http://localhost:5173"
echo "════════════════════════════════════════"
( sleep 2 && termux-open-url http://localhost:5173 ) &
npm run dev
