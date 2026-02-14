"use client";

import { useCallback, useEffect, useRef } from "react";

const SQUARE_SIZE = 4;
const BORDER_RADIUS = 1;
const GAP = 10;
const STEP = SQUARE_SIZE + GAP;

const ACTIVE_FRACTION = 0.1;
const FADE_IN_DURATION = 0.3;
const FADE_OUT_DURATION = 0.9;
const SPAWN_INTERVAL = 20;

const FLASH_COLOR = [0, 148, 255] as const; // #0094FF
const REST_COLOR = [160, 160, 160] as const;
const REST_ALPHA = 0.07;
const FLASH_ALPHA = 0.18;
const GLOW_RADIUS = 8;

interface Cell {
  progress: number;
  /** 1 = fading in, -1 = fading out, 0 = idle */
  direction: number;
  speed: number;
  peakAlpha: number;
}

function activateCell(cell: Cell) {
  cell.direction = 1;
  cell.speed = 0.4 + Math.random() * 1.0;
  cell.peakAlpha = FLASH_ALPHA * (0.4 + Math.random() * 0.6);
}

/** Pre-render a glow sprite once — avoids per-frame shadowBlur cost. */
function createGlowSprite(dpr: number): HTMLCanvasElement {
  const [r, g, b] = FLASH_COLOR;
  const pad = GLOW_RADIUS * 2 * dpr;
  const size = SQUARE_SIZE * dpr + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 1)`;
  ctx.shadowBlur = GLOW_RADIUS * dpr;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
  ctx.beginPath();
  ctx.roundRect(
    pad,
    pad,
    SQUARE_SIZE * dpr,
    SQUARE_SIZE * dpr,
    BORDER_RADIUS * dpr,
  );
  ctx.fill();

  return canvas;
}

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<Cell[]>([]);
  const dimsRef = useRef({ cols: 0, rows: 0 });
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const lastTimeRef = useRef(0);
  const glowSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef(1);

  const initGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const cols = Math.ceil(rect.width / STEP) + 1;
    const rows = Math.ceil(rect.height / STEP) + 1;
    dimsRef.current = { cols, rows };

    const total = cols * rows;
    cellsRef.current = Array.from({ length: total }, () => ({
      progress: 0,
      direction: 0,
      speed: 1,
      peakAlpha: FLASH_ALPHA,
    }));

    // Recreate glow sprite at current DPR
    glowSpriteRef.current = createGlowSprite(dpr);
  }, []);

  useEffect(() => {
    initGrid();

    const observer = new ResizeObserver(() => initGrid());
    if (canvasRef.current) observer.observe(canvasRef.current);

    const animate = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = dprRef.current;
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      const { cols, rows } = dimsRef.current;
      const cells = cellsRef.current;
      const total = cells.length;

      // Spawn new flashes
      if (time - lastSpawnRef.current > SPAWN_INTERVAL && total > 0) {
        lastSpawnRef.current = time;
        const maxActive = Math.max(1, Math.floor(total * ACTIVE_FRACTION));
        let activeCount = 0;
        for (let i = 0; i < total; i++) {
          if (cells[i].direction !== 0) activeCount++;
        }

        if (activeCount < maxActive) {
          const batch = 1 + Math.floor(Math.random() * 3);

          for (let b = 0; b < batch && activeCount < maxActive; b++) {
            const startIdx = Math.floor(Math.random() * total);
            for (let j = 0; j < total; j++) {
              const idx = (startIdx + j) % total;
              if (cells[idx].direction === 0 && cells[idx].progress === 0) {
                activateCell(cells[idx]);
                activeCount++;

                // Cluster effect
                if (Math.random() < 0.35) {
                  const col = idx % cols;
                  const row = Math.floor(idx / cols);
                  const neighborOffsets = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1],
                    [-1, -1],
                    [1, -1],
                    [-1, 1],
                    [1, 1],
                  ];
                  const [dx, dy] =
                    neighborOffsets[
                      Math.floor(Math.random() * neighborOffsets.length)
                    ];
                  const nc = col + dx;
                  const nr = row + dy;
                  if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
                    const ni = nr * cols + nc;
                    if (cells[ni].direction === 0 && cells[ni].progress === 0) {
                      activateCell(cells[ni]);
                      cells[ni].progress = -(0.1 + Math.random() * 0.2);
                      activeCount++;
                    }
                  }
                }

                break;
              }
            }
          }
        }
      }

      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const [r, g, b] = FLASH_COLOR;
      const scaledSize = SQUARE_SIZE * dpr;
      const scaledRadius = BORDER_RADIUS * dpr;
      const glowSprite = glowSpriteRef.current;
      const glowPad = GLOW_RADIUS * 2 * dpr;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const cell = cells[i];

          // Update progress
          if (cell.direction !== 0) {
            const fadeDuration =
              cell.direction > 0 ? FADE_IN_DURATION : FADE_OUT_DURATION;
            cell.progress += cell.direction * (dt / fadeDuration) * cell.speed;

            if (cell.progress >= 1) {
              cell.progress = 1;
              cell.direction = -1;
            } else if (cell.progress <= 0) {
              cell.progress = 0;
              cell.direction = 0;
            }
          }

          const t = Math.max(0, cell.progress);
          const x = col * STEP * dpr;
          const y = row * STEP * dpr;

          // Asymmetric easing
          const eased = cell.direction >= 0 ? t * t : 1 - (1 - t) * (1 - t);

          // Stamp cached glow sprite for active cells
          if (eased > 0.05 && glowSprite) {
            ctx.globalAlpha = eased * (cell.peakAlpha / FLASH_ALPHA);
            ctx.drawImage(glowSprite, x - glowPad, y - glowPad);
          }

          // Draw the square
          ctx.globalAlpha = 1;
          const cr = REST_COLOR[0] + eased * (r - REST_COLOR[0]);
          const cg = REST_COLOR[1] + eased * (g - REST_COLOR[1]);
          const cb = REST_COLOR[2] + eased * (b - REST_COLOR[2]);
          const alpha = REST_ALPHA + eased * (cell.peakAlpha - REST_ALPHA);

          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.beginPath();
          ctx.roundRect(x, y, scaledSize, scaledSize, scaledRadius);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [initGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
