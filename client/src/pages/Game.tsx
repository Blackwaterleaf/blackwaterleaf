import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Gamepad2, Home, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Link } from "wouter";
import "../styles/game.css";

type GameState = "ready" | "playing" | "won" | "lost";
type Item = { x: number; y: number; collected: boolean; phase: number };
type Platform = { x: number; y: number; w: number; h: number; moving?: boolean; dx?: number };
type Hazard = { x: number; y: number; w: number; h: number };

const WORLD_WIDTH = 5200;
const FLOOR = 460;
const START_X = 110;

const platforms: Platform[] = [
  { x: 0, y: FLOOR, w: 760, h: 46 }, { x: 865, y: 410, w: 250, h: 28 },
  { x: 1210, y: 350, w: 220, h: 28 }, { x: 1510, y: 420, w: 350, h: 46 },
  { x: 1940, y: 365, w: 210, h: 28, moving: true, dx: 0.7 }, { x: 2250, y: FLOOR, w: 590, h: 46 },
  { x: 2960, y: 405, w: 280, h: 28 }, { x: 3380, y: 330, w: 230, h: 28 },
  { x: 3690, y: FLOOR, w: 650, h: 46 }, { x: 4470, y: 390, w: 230, h: 28 },
  { x: 4760, y: FLOOR, w: 440, h: 46 },
];

const hazards: Hazard[] = [
  { x: 610, y: FLOOR - 22, w: 34, h: 22 }, { x: 1690, y: FLOOR - 22, w: 38, h: 22 },
  { x: 2470, y: FLOOR - 22, w: 42, h: 22 }, { x: 2730, y: FLOOR - 22, w: 34, h: 22 },
  { x: 3900, y: FLOOR - 22, w: 40, h: 22 }, { x: 4160, y: FLOOR - 22, w: 34, h: 22 },
  { x: 4950, y: FLOOR - 22, w: 42, h: 22 },
];

const seedItems = (): Item[] => [
  [320, 398], [520, 350], [930, 354], [1280, 294], [1580, 364], [1800, 364],
  [2020, 309], [2380, 398], [2600, 398], [3030, 349], [3450, 274], [3790, 398],
  [4080, 338], [4540, 334], [4860, 398], [5120, 398],
].map(([x, y], index) => ({ x, y, collected: false, phase: index * 0.7 }));

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const inputRef = useRef({ left: false, right: false, jump: false });
  const gameRef = useRef({ state: "ready" as GameState, x: START_X, y: 390, vy: 0, camera: 0, score: 0, lives: 3, time: 0, items: seedItems(), lastTime: 0 });
  const [state, setState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const input = inputRef.current; const game = gameRef.current;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);

    const start = () => { if (game.state !== "playing") { game.state = "playing"; setState("playing"); } };
    const jump = () => { if (game.state === "ready" || game.state === "won" || game.state === "lost") { reset(); start(); return; } input.jump = true; };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "a", "d", "w"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") input.left = event.type === "keydown";
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") input.right = event.type === "keydown";
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w" || event.key === " ") { if (event.type === "keydown" && !event.repeat) jump(); }
      if (event.key === "Enter" && event.type === "keydown") { if (game.state !== "playing") { reset(); start(); } }
    };
    window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);

    const draw = (time: number) => {
      const dt = Math.min((time - game.lastTime) / 16.667 || 1, 2); game.lastTime = time; game.time += dt;
      const W = canvas.clientWidth, H = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);
      const scale = Math.max(0.72, Math.min(1.15, W / 920)); const ground = H - 68; const viewW = W / scale;
      const worldToScreen = (x: number) => (x - game.camera) * scale;
      // sky and layered forest
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#071a22"); sky.addColorStop(.55, "#113f40"); sky.addColorStop(1, "#082119"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(154,255,143,.12)"; ctx.beginPath(); ctx.arc(W * .77, 75, 46, 0, Math.PI * 2); ctx.fill();
      for (let layer = 0; layer < 3; layer++) { ctx.fillStyle = ["#0b302d", "#0a2826", "#09211e"][layer]; ctx.beginPath(); ctx.moveTo(0, H); for (let x = -80; x <= W + 80; x += 80) { const peak = 130 + layer * 30 + Math.sin(x * .02 + layer) * 28; ctx.lineTo(x, peak); ctx.lineTo(x + 40, peak - 18); ctx.lineTo(x + 80, peak); } ctx.lineTo(W, H); ctx.fill(); }
      // stars / fireflies
      for (let i = 0; i < 18; i++) { const fx = (i * 137 - game.camera * .18) % (W + 40); const fy = 100 + (i * 43) % 210; ctx.fillStyle = `rgba(190,255,148,${.25 + Math.sin(game.time * .04 + i) * .14})`; ctx.fillRect(fx < -10 ? fx + W + 40 : fx, fy, 3, 3); }

      if (game.state === "playing") {
        const speed = input.right ? 4.8 : input.left ? -2.8 : 3.4; game.x += speed * dt;
        if (game.x < 40) game.x = 40; if (game.x > WORLD_WIDTH - 60) game.x = WORLD_WIDTH - 60;
        if (input.jump && Math.abs(game.vy) < .3) game.vy = -11; input.jump = false; game.vy += .52 * dt; game.y += game.vy * dt;
        const currentPlatform = platforms.find(p => game.x + 25 > p.x && game.x < p.x + p.w && game.y + 34 >= p.y && game.y + 34 <= p.y + 22 && game.vy >= 0);
        if (currentPlatform) { game.y = currentPlatform.y - 34; game.vy = 0; }
        if (game.y > H + 100 || hazards.some(h => game.x + 30 > h.x && game.x < h.x + h.w && game.y + 32 > h.y && game.y + 8 < h.y + h.h)) { game.lives--; setLives(game.lives); if (game.lives <= 0) { game.state = "lost"; setState("lost"); } else { game.x = Math.max(START_X, game.x - 240); game.y = 350; game.vy = -5; } }
        game.items.forEach(item => { if (!item.collected && Math.abs(game.x + 18 - item.x) < 30 && Math.abs(game.y + 17 - item.y) < 32) { item.collected = true; game.score += 10; setScore(game.score); } });
        if (game.x > WORLD_WIDTH - 120) { game.state = "won"; setState("won"); }
        const target = Math.max(0, Math.min(WORLD_WIDTH - viewW, game.x - viewW * .33)); game.camera += (target - game.camera) * .12 * dt;
      }

      ctx.save(); // world coordinates are projected from the fixed game floor into the responsive canvas
      // platforms
      platforms.forEach((p, index) => { const sx = worldToScreen(p.x), sy = ground + (p.y - FLOOR) * scale; ctx.fillStyle = index % 2 ? "#255d48" : "#2e7551"; roundedRect(ctx, sx, sy, p.w * scale, p.h * scale, 8 * scale); ctx.fillStyle = "#96e66d"; roundedRect(ctx, sx, sy, p.w * scale, 7 * scale, 4 * scale); ctx.fillStyle = "rgba(4,24,21,.28)"; for (let x = sx + 12; x < sx + p.w * scale; x += 34) ctx.fillRect(x, sy + 13, 2, p.h * scale - 15); });
      hazards.forEach(h => { const sx = worldToScreen(h.x), sy = ground + (h.y - FLOOR) * scale; ctx.fillStyle = "#e86e75"; ctx.beginPath(); ctx.moveTo(sx, sy + h.h * scale); ctx.lineTo(sx + h.w * scale * .5, sy - 3); ctx.lineTo(sx + h.w * scale, sy + h.h * scale); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#ffd184"; ctx.fillRect(sx + h.w * scale * .42, sy + 5, 3, h.h * scale - 6); });
      game.items.forEach(item => { if (item.collected) return; const sx = worldToScreen(item.x), sy = ground + (item.y - FLOOR) * scale + Math.sin(game.time * .06 + item.phase) * 5; ctx.fillStyle = "#ffd86b"; ctx.shadowColor = "#ffd86b"; ctx.shadowBlur = 13; ctx.beginPath(); ctx.arc(sx, sy, 8 * scale, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#fff4bd"; ctx.beginPath(); ctx.arc(sx - 2, sy - 2, 2.5 * scale, 0, Math.PI * 2); ctx.fill(); });
      // finish flag
      const flagX = worldToScreen(WORLD_WIDTH - 100); ctx.fillStyle = "#d8f69a"; ctx.fillRect(flagX, ground + (FLOOR - 92) * scale, 4, 92 * scale); ctx.fillStyle = "#ffcf72"; ctx.beginPath(); ctx.moveTo(flagX + 4, ground + (FLOOR - 92) * scale); ctx.lineTo(flagX + 56 * scale, ground + (FLOOR - 74) * scale); ctx.lineTo(flagX + 4, ground + (FLOOR - 57) * scale); ctx.closePath(); ctx.fill();
      // player: leaf-like runner
      const px = worldToScreen(game.x), py = ground + (game.y - FLOOR) * scale; ctx.save(); ctx.translate(px + 20 * scale, py + 18 * scale); ctx.rotate(Math.sin(game.time * .2) * .04); ctx.fillStyle = "#b4f77b"; ctx.shadowColor = "rgba(165,255,103,.65)"; ctx.shadowBlur = 16; ctx.beginPath(); ctx.ellipse(0, 0, 20 * scale, 17 * scale, -.32, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = "#286a4b"; ctx.beginPath(); ctx.ellipse(-4 * scale, -2 * scale, 9 * scale, 4 * scale, -.32, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#09221b"; ctx.beginPath(); ctx.arc(9 * scale, -4 * scale, 2.4 * scale, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#d9ffb4"; ctx.lineWidth = 3 * scale; ctx.beginPath(); ctx.moveTo(-5 * scale, 13 * scale); ctx.lineTo(-9 * scale, 23 * scale); ctx.moveTo(8 * scale, 12 * scale); ctx.lineTo(13 * scale, 22 * scale); ctx.stroke(); ctx.restore(); ctx.restore();
      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frameRef.current!); window.removeEventListener("resize", resize); window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); };
  }, []);

  const reset = () => { const g = gameRef.current; g.state = "ready"; g.x = START_X; g.y = 390; g.vy = 0; g.camera = 0; g.score = 0; g.lives = 3; g.items = seedItems(); setScore(0); setLives(3); setState("ready"); };
  const hold = (key: "left" | "right" | "jump") => (event: React.PointerEvent) => { event.preventDefault(); inputRef.current[key] = true; if (key === "jump" && gameRef.current.state === "ready") { gameRef.current.state = "playing"; setState("playing"); } };
  const release = (key: "left" | "right" | "jump") => () => { inputRef.current[key] = false; };

  return <main className="game-page">
    <header className="game-header"><Link className="game-back" href="/"><ArrowLeft size={16} /> Zurück zu BlackWaterLeaf</Link><div className="game-brand"><Gamepad2 size={18} /><span>BLÄTTERTAL RUN</span></div><button className="game-icon" aria-label={muted ? "Ton einschalten" : "Ton ausschalten"} onClick={() => setMuted(v => !v)}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button></header>
    <section className="game-shell">
      <div className="game-topline"><div><span className="game-eyebrow">BLACKWATERLEAF · MINI-ABENTEUER</span><h1>Blättertal Run</h1></div><div className="game-stats"><span><b>{score}</b><small>BLÄTTER</small></span><span><b>{"●".repeat(lives)}{"○".repeat(Math.max(0, 3 - lives))}</b><small>LEBEN</small></span></div></div>
      <div className="game-stage"><canvas ref={canvasRef} aria-label="Blättertal Run Spielfeld" /><div className="game-overlay game-overlay--top"><span>← → / A D <i>LAUFEN</i></span><span>SPACE / W <i>SPRINGEN</i></span></div>{state !== "playing" && <div className="game-card"><span className="game-card-kicker">{state === "won" ? "TAL DURCHQUERT" : state === "lost" ? "NOCH EIN VERSUCH" : "BEREIT?"}</span><h2>{state === "won" ? "Du hast das Blättertal gerettet." : state === "lost" ? "Die Nacht war schneller." : "Sammle Licht. Lauf los."}</h2><p>{state === "won" ? `Starker Lauf mit ${score} Blättern.` : "Ein kleines Abenteuer für zwischendurch – mit Tastatur oder Fingern."}</p><button className="game-start" onClick={() => { reset(); gameRef.current.state = "playing"; setState("playing"); }}>{state === "ready" ? "SPIEL STARTEN" : "NOCHMAL SPIELEN"}<ChevronRight size={16} /></button></div>}</div>
      <div className="game-controls"><div className="control-cluster"><button aria-label="Nach links" onPointerDown={hold("left")} onPointerUp={release("left")} onPointerLeave={release("left")}><ChevronLeft /></button><button aria-label="Nach rechts" onPointerDown={hold("right")} onPointerUp={release("right")} onPointerLeave={release("right")}><ChevronRight /></button></div><button className="jump-button" aria-label="Springen" onPointerDown={hold("jump")} onPointerUp={release("jump")} onPointerLeave={release("jump")}><span>SPRUNG</span><b>↑</b></button><button className="reset-button" aria-label="Zurücksetzen" onClick={reset}><RotateCcw size={16} /></button></div>
      <div className="game-footer"><span><Home size={14} /> Ein kurzer Lauf, der gute Laune macht.</span><span>PC: Pfeile / WASD · Handy: Buttons halten</span></div>
    </section>
  </main>;
}
