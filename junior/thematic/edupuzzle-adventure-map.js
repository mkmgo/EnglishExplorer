/**
 * EduPuzzle: Adventure Treasure Map
 * Compliant with EduPuzzle Showroom Requirements (C1-C7)
 */
(function (global) {
  'use strict';

  // Sound on/off shared with the host page (sound button sync)
  let isMuted = localStorage && localStorage.getItem('elpz-sound-off') === '1';

  // Single Global Export
  global.EduPuzzleMap = {
    setMuted: function (muted) {
      isMuted = !!muted;
      if (localStorage) {
        if (isMuted) localStorage.setItem('elpz-sound-off', '1');
        else localStorage.removeItem('elpz-sound-off');
      }
      // Sync the in-bundle mute button if the activity is mounted
      const host = document.querySelector('.ep-host');
      if (host && host.shadowRoot) {
        const btn = host.shadowRoot.getElementById('elpz-mute-btn');
        if (btn) btn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
      }
    },
    mount: function (containerEl) {
      if (!containerEl) return;

      // Create Shadow Root if not already present
      const root = containerEl.shadowRoot || containerEl.attachShadow({ mode: 'open' });

      // Audio Controller (Web Audio API - No external assets)
      let audioCtx = null;

      function playSound(type) {
        if (isMuted) return;
        try {
          if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          if (audioCtx.state === 'suspended') audioCtx.resume();

          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);

          const now = audioCtx.currentTime;

          if (type === 'click') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
          } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
          } else if (type === 'reveal') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
          } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
          }
        } catch (e) {
          /* Audio fail-safe */
        }
      }

      // State Management
      let currentStage = 1;
      const totalStages = 5;

      // Injection HTML/CSS Template
      root.innerHTML = `
        <style>
          :host {
            --accent: var(--accent-color, #b8860b);
            --accent2: var(--accent2-color, #ffd54f);
            --text-color: #14213d;
            --card-bg: #ffffff;
            display: block;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--text-color);
            width: 100%;
            box-sizing: border-box;
          }

          * { box-sizing: border-box; }

          #elpz-wrapper {
            background-color: var(--accent2);
            border: 2px solid var(--accent);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 900px;
            margin: 0 auto;
          }

          /* Header */
          .elpz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.6);
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid rgba(0,0,0,0.1);
          }

          .elpz-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0;
            color: var(--text-color);
          }

          .elpz-controls {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .elpz-btn-icon {
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 0.9rem;
            min-height: 44px;
            min-width: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }

          .elpz-btn-icon:hover { background: #f0f0f0; }

          /* Layout split for Stage */
          .elpz-stage {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            align-items: start;
          }

          @media (max-width: 650px) {
            .elpz-stage {
              grid-template-columns: 1fr;
            }
          }

          /* Map Container */
          .elpz-map-card {
            background: #fdf6e3;
            border: 2px solid #d3b88c;
            border-radius: 8px;
            padding: 8px;
            position: relative;
            aspect-ratio: 4 / 3;
            width: 100%;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }

          .elpz-svg-map {
            width: 100%;
            height: 100%;
            display: block;
          }

          /* Puzzle Area */
          .elpz-puzzle-card {
            background: var(--card-bg);
            border: 1px solid rgba(0,0,0,0.15);
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 280px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }

          .elpz-puzzle-title {
            font-size: 1.05rem;
            font-weight: 700;
            margin: 0;
            color: var(--accent);
          }

          .elpz-puzzle-desc {
            font-size: 0.95rem;
            margin: 0;
            line-height: 1.4;
          }

          /* Interactive elements */
          .elpz-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
          }

          .elpz-chip {
            background: #f0f4f8;
            border: 1px solid #bcccdc;
            padding: 8px 14px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.95rem;
            user-select: none;
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }

          .elpz-chip:hover { background: #d9e2ec; }
          .elpz-chip.selected { background: var(--accent); color: white; border-color: var(--accent); }

          .elpz-btn-submit {
            background: var(--text-color);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            min-height: 44px;
            margin-top: auto;
          }

          .elpz-btn-submit:hover { opacity: 0.9; }

          .elpz-feedback {
            font-size: 0.9rem;
            font-weight: 600;
            min-height: 20px;
          }

          .elpz-feedback.error { color: #d32f2f; }
          .elpz-feedback.success { color: #2e7d32; }

          /* Fog of War animations */
          .elpz-fog {
            transition: opacity 0.8s ease-out;
            fill: #4a5568;
            opacity: 0.92;
          }

          .elpz-fog.revealed {
            opacity: 0 !important;
            pointer-events: none;
          }

          /* Sequence Slots */
          .elpz-drop-zone {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-height: 120px;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            padding: 8px;
            border-radius: 6px;
          }
        </style>

        <div id="elpz-wrapper">
          <div class="elpz-header">
            <h1 class="elpz-title">🏴‍☠️ Adventure Map Explorer</h1>
            <div class="elpz-controls">
              <span id="elpz-progress-text">Puzzle 1 / 5</span>
              <button id="elpz-mute-btn" class="elpz-btn-icon" aria-label="Toggle Sound">🔊 Sound</button>
            </div>
          </div>

          <div class="elpz-stage">
            <!-- Map View -->
            <div class="elpz-map-card">
              <svg class="elpz-svg-map" viewBox="0 0 400 300">
                <!-- Background Terrain -->
                <rect width="400" height="300" fill="#e6d5ac" />
                
                <!-- River -->
                <path d="M 0,150 Q 100,120 200,180 T 400,160" fill="none" stroke="#4a90e2" stroke-width="18" />
                <!-- Bridge -->
                <rect x="185" y="150" width="30" height="12" fill="#8b5a2b" rx="2" transform="rotate(25 200 156)" />

                <!-- Mountains (Zone 2) -->
                <polygon points="50,90 80,40 110,90" fill="#8c7a6b" />
                <polygon points="80,100 120,30 160,100" fill="#6e5d4f" />
                <polygon points="120,40 135,15 150,40" fill="#ffffff" /> <!-- Snow cap -->

                <!-- Forest (Zone 3) -->
                <g fill="#2d5a27">
                  <circle cx="280" cy="80" r="18" />
                  <circle cx="310" cy="70" r="22" />
                  <circle cx="340" cy="90" r="16" />
                  <circle cx="295" cy="100" r="20" />
                </g>

                <!-- Tent & Camp (Zone 4) -->
                <polygon points="60,240 80,200 100,240" fill="#e76f51" />
                <polygon points="80,200 100,240 90,240" fill="#f4a261" />

                <!-- Path Dot Lines -->
                <path d="M 80,240 Q 120,220 195,160 T 310,90 T 330,220" fill="none" stroke="#8b5a2b" stroke-width="3" stroke-dasharray="6,6" />

                <!-- Treasure X (Zone 5) -->
                <g id="elpz-treasure-mark" opacity="0.2">
                  <text x="330" y="235" font-size="28" font-weight="bold" fill="#d90429" text-anchor="middle">X</text>
                  <circle cx="330" cy="225" r="16" fill="none" stroke="#d90429" stroke-width="2" stroke-dasharray="3,3" />
                </g>

                <!-- Grid Labels -->
                <text x="10" y="20" font-size="10" fill="#8b5a2b" font-family="monospace">A1</text>
                <text x="370" y="20" font-size="10" fill="#8b5a2b" font-family="monospace">B1</text>
                <text x="10" y="290" font-size="10" fill="#8b5a2b" font-family="monospace">A2</text>
                <text x="370" y="290" font-size="10" fill="#8b5a2b" font-family="monospace">B2</text>

                <!-- Fog Overlays for Progressive Disclosing -->
                <!-- Zone 1: Starting Camp / Gear (Always visible) -->
                
                <!-- Zone 2: Mountain Pass -->
                <rect id="elpz-fog-2" class="elpz-fog" x="30" y="20" width="150" height="100" rx="8" />

                <!-- Zone 3: Deep Forest & River Bridge -->
                <rect id="elpz-fog-3" class="elpz-fog" x="170" y="20" width="210" height="150" rx="8" />

                <!-- Zone 4: The Waypoint -->
                <rect id="elpz-fog-4" class="elpz-fog" x="20" y="140" width="170" height="140" rx="8" />

                <!-- Zone 5: Treasure Vault -->
                <rect id="elpz-fog-5" class="elpz-fog" x="250" y="170" width="140" height="110" rx="8" />
              </svg>
            </div>

            <!-- Puzzle Control Panel -->
            <div class="elpz-puzzle-card" id="elpz-puzzle-box">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>
      `;

      // Event Listeners & Binding
      const muteBtn = root.getElementById('elpz-mute-btn');
      muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
        playSound('click');
      });

      // Puzzle Definitions & Logic
      const puzzles = [
        {
          id: 1,
          title: "Puzzle 1: Prepare Your Gear",
          desc: "Before stepping onto the path, select the 2 essentials you must carry in your hands:",
          options: ["backpack", "mountain", "map", "river"],
          correct: ["backpack", "map"],
          type: "multi-select",
          fogToClear: null, // Initial area clear
          successMsg: "Gear ready! The Mountain Fog clears."
        },
        {
          id: 2,
          title: "Puzzle 2: The Mountain Route",
          desc: "Complete the sentence to scout the area ahead: 'I can see a ________.'",
          options: ["forest", "mountain", "bridge"],
          correct: "mountain",
          type: "single-select",
          fogToClear: "elpz-fog-2",
          successMsg: "Mountain sighted! The River and Forest Fog clears."
        },
        {
          id: 3,
          title: "Puzzle 3: Action Order",
          desc: "Arrange the expedition commands in logical order to cross safely:",
          items: ["1. Where are we?", "2. Stop!", "3. Wait!", "4. Let's go!"],
          correctOrder: ["1. Where are we?", "2. Stop!", "3. Wait!", "4. Let's go!"],
          type: "sequence",
          fogToClear: "elpz-fog-3",
          successMsg: "You crossed the river! The Waypoint Camp is revealed."
        },
        {
          id: 4,
          title: "Puzzle 4: Terrain Check",
          desc: "Which sentence correctly describes the path across the river?",
          options: [
            "We cross the river using the bridge.",
            "There is a tree under the mountain river.",
            "The backpack walks on the path."
          ],
          correct: "We cross the river using the bridge.",
          type: "single-select",
          fogToClear: "elpz-fog-4",
          successMsg: "Waypoint clear! The Treasure Vault Fog lifts."
        },
        {
          id: 5,
          title: "Puzzle 5: Uncover the Treasure",
          desc: "Unscramble the final clue to mark the spot: 'The ________ is near the ________.'",
          options: ["treasure / tent", "tent / river", "bridge / tree"],
          correct: "treasure / tent",
          type: "single-select",
          fogToClear: "elpz-fog-5",
          successMsg: "TREASURE DISCOVERED! You completed the map!"
        }
      ];

      // Render Puzzle Function
      function renderStage(stageIdx) {
        const puzzle = puzzles[stageIdx - 1];
        const container = root.getElementById('elpz-puzzle-box');
        root.getElementById('elpz-progress-text').textContent = `Puzzle ${stageIdx} / ${totalStages}`;

        if (!puzzle) {
          // Final Victory Screen
          container.innerHTML = `
            <h2 class="elpz-puzzle-title">🎉 Expedition Complete!</h2>
            <p class="elpz-puzzle-desc">You solved all puzzles, navigated the terrain, and uncovered the hidden treasure map!</p>
            <button id="elpz-restart-btn" class="elpz-btn-submit">Restart Adventure</button>
          `;
          root.getElementById('elpz-restart-btn').addEventListener('click', () => {
            currentStage = 1;
            // Reset fog
            for (let i = 2; i <= 5; i++) {
              const fog = root.getElementById(`elpz-fog-${i}`);
              if (fog) fog.classList.remove('revealed');
            }
            const mark = root.getElementById('elpz-treasure-mark');
            if (mark) mark.setAttribute('opacity', '0.2');
            renderStage(1);
          });
          return;
        }

        let interactiveHTML = '';

        if (puzzle.type === 'multi-select' || puzzle.type === 'single-select') {
          interactiveHTML = `
            <div class="elpz-options" id="elpz-options-group">
              ${puzzle.options.map(opt => `<button class="elpz-chip" data-val="${opt}">${opt}</button>`).join('')}
            </div>
          `;
        } else if (puzzle.type === 'sequence') {
          // Shuffled sequence
          const shuffled = [...puzzle.items].sort(() => 0.5 - Math.random());
          interactiveHTML = `
            <div style="font-size: 0.85rem; color: #555;">Tap items to select order:</div>
            <div class="elpz-options" id="elpz-seq-pool">
              ${shuffled.map(item => `<button class="elpz-chip" data-val="${item}">${item}</button>`).join('')}
            </div>
            <div class="elpz-drop-zone" id="elpz-seq-target"></div>
          `;
        }

        container.innerHTML = `
          <h2 class="elpz-puzzle-title">${puzzle.title}</h2>
          <p class="elpz-puzzle-desc">${puzzle.desc}</p>
          ${interactiveHTML}
          <div class="elpz-feedback" id="elpz-feedback"></div>
          <button class="elpz-btn-submit" id="elpz-submit-btn">Check Answer</button>
        `;

        // State for choices
        let selectedChips = [];

        if (puzzle.type === 'multi-select' || puzzle.type === 'single-select') {
          const chips = container.querySelectorAll('.elpz-chip');
          chips.forEach(chip => {
            chip.addEventListener('click', () => {
              playSound('click');
              const val = chip.getAttribute('data-val');
              if (puzzle.type === 'single-select') {
                chips.forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                selectedChips = [val];
              } else {
                if (chip.classList.contains('selected')) {
                  chip.classList.remove('selected');
                  selectedChips = selectedChips.filter(v => v !== val);
                } else {
                  chip.classList.add('selected');
                  selectedChips.push(val);
                }
              }
            });
          });
        } else if (puzzle.type === 'sequence') {
          const pool = container.querySelector('#elpz-seq-pool');
          const target = container.querySelector('#elpz-seq-target');

          pool.addEventListener('click', (e) => {
            if (e.target.classList.contains('elpz-chip')) {
              playSound('click');
              target.appendChild(e.target);
            }
          });

          target.addEventListener('click', (e) => {
            if (e.target.classList.contains('elpz-chip')) {
              playSound('click');
              pool.appendChild(e.target);
            }
          });
        }

        // Submit Logic
        const submitBtn = container.querySelector('#elpz-submit-btn');
        const feedback = container.querySelector('#elpz-feedback');

        submitBtn.addEventListener('click', () => {
          let isCorrect = false;

          if (puzzle.type === 'single-select') {
            isCorrect = selectedChips.length === 1 && selectedChips[0] === puzzle.correct;
          } else if (puzzle.type === 'multi-select') {
            isCorrect = selectedChips.length === puzzle.correct.length &&
              puzzle.correct.every(v => selectedChips.includes(v));
          } else if (puzzle.type === 'sequence') {
            const currentOrder = Array.from(container.querySelectorAll('#elpz-seq-target .elpz-chip'))
              .map(c => c.getAttribute('data-val'));
            isCorrect = JSON.stringify(currentOrder) === JSON.stringify(puzzle.correctOrder);
          }

          if (isCorrect) {
            playSound('success');
            feedback.className = 'elpz-feedback success';
            feedback.textContent = puzzle.successMsg;

            // Disclose Map Part
            if (puzzle.fogToClear) {
              const fogEl = root.getElementById(puzzle.fogToClear);
              if (fogEl) {
                setTimeout(() => {
                  fogEl.classList.add('revealed');
                  playSound('reveal');
                }, 300);
              }
            }

            if (stageIdx === 5) {
              const mark = root.getElementById('elpz-treasure-mark');
              if (mark) mark.setAttribute('opacity', '1');
            }

            submitBtn.disabled = true;
            setTimeout(() => {
              currentStage++;
              renderStage(currentStage);
            }, 1500);
          } else {
            playSound('error');
            feedback.className = 'elpz-feedback error';
            feedback.textContent = "Not quite right. Try again!";
          }
        });
      }

      // Initial Render
      renderStage(currentStage);
    }
  };
})(window);