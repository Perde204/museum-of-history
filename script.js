const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const themeColors = () =>
  document.documentElement.dataset.skin == "mono" ? ["#fff", "#888"] : ["#00f6ff", "#ff2bd6"];
let ac,
  master,
  an,
  vol = 0.6,
  muted = false;
function getAudio() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    an = ac.createAnalyser();
    an.fftSize = 128;
    master.connect(an);
    an.connect(ac.destination);
  }
  master.gain.value = muted ? 0 : vol;
  if (ac.state == "suspended") {
    ac.resume();
  }
  return ac;
}
function tone(f, t, d, ty = "sine", v = 0.25, f2) {
  const c = getAudio(),
    o = c.createOscillator(),
    g = c.createGain(),
    s = c.currentTime + t;
  o.type = ty;
  o.frequency.setValueAtTime(f, s);
  if (f2) {
    o.frequency.exponentialRampToValueAtTime(f2, s + d);
  }
  g.gain.setValueAtTime(0, s);
  g.gain.linearRampToValueAtTime(v, s + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(g);
  g.connect(master);
  o.start(s);
  o.stop(s + d + 0.05);
}
function noise(t, d, v = 0.2, fr = 2000) {
  const c = getAudio(),
    n = (c.sampleRate * d) | 0,
    b = c.createBuffer(1, n, c.sampleRate),
    a = b.getChannelData(0);
  for (let i = 0; i < n; i++) {
    a[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(),
    g = c.createGain(),
    f = c.createBiquadFilter(),
    s0 = c.currentTime + t;
  s.buffer = b;
  f.type = "bandpass";
  f.frequency.value = fr;
  g.gain.setValueAtTime(v, s0);
  g.gain.exponentialRampToValueAtTime(0.0001, s0 + d);
  s.connect(f);
  f.connect(g);
  g.connect(master);
  s.start(s0);
}
const SOUNDS = {
  boot: {
    n: "Boot Chime",
    y: "1995–98",
    d: "Rising arpeggio and a warm pad",
    p() {
      [293.7, 370, 440, 587.3].forEach((f, i) => tone(f, i * 0.18, 1.6, "triangle", 0.18));
      tone(146.8, 0, 2.4, "sine", 0.2);
      tone(440, 0.7, 2.4, "sine", 0.1);
    },
  },
  chord: {
    n: "Startup Chord",
    y: "1998–2012",
    d: "One enormous major chord",
    p() {
      [130.8, 196, 261.6, 329.6, 392, 523.3].forEach((f) => tone(f, 0, 3, "sine", 0.12));
    },
  },
  err: {
    n: "Critical Error",
    y: "1995–2008",
    d: "The sound of a lost document",
    p() {
      tone(880, 0, 0.25, "square", 0.1);
      tone(880, 0.3, 0.45, "square", 0.1);
      noise(0, 0.06, 0.15, 300);
    },
  },
  tada: {
    n: "Ta-Da!",
    y: "1992–2000",
    d: "Four triumphant notes",
    p() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.9, "triangle", 0.2));
    },
  },
  modem: {
    n: "Dial-Up Handshake",
    y: "1993–2005",
    d: "Screech, hiss, you are online",
    p() {
      for (let i = 1; i < 9; i++) {
        tone(350 + i * 90, i * 0.07, 0.07, "square", 0.06);
      }
      tone(2100, 0.7, 0.5, "sine", 0.1);
      tone(1200, 1.2, 0.4, "sine", 0.1);
      for (let i = 0; i < 12; i++) {
        noise(1.7 + i * 0.12, 0.1, 0.14, 1000 + Math.random() * 3000);
      }
      tone(980, 1.7, 1.4, "sawtooth", 0.04, 1800);
    },
  },
  uh: {
    n: "Uh-Oh Messenger",
    y: "1996–2004",
    d: "Someone is online. Or offline.",
    p() {
      tone(740, 0, 0.18, "sine", 0.3);
      tone(520, 0.2, 0.3, "sine", 0.3);
    },
  },
  ping: {
    n: "Ping",
    y: "2000s",
    d: "A tiny notification",
    p() {
      tone(1320, 0, 0.4, "sine", 0.2);
      tone(1760, 0.08, 0.5, "sine", 0.12);
    },
  },
  click: {
    p() {
      noise(0, 0.03, 0.12, 3000);
    },
  },
};
const playClick = () => {
  if (ac) {
    SOUNDS.click.p();
  }
};
function setMuted(m) {
  muted = m;
  if (master) {
    master.gain.value = m ? 0 : vol;
  }
  $("#snd").textContent = "SND: " + (m ? "OFF" : "ON");
  $("#sw").classList.toggle("on", !m);
}
$("#snd").onclick = () => setMuted(!muted);
$("#skin").onclick = (e) => {
  const d = document.documentElement,
    m = d.dataset.skin != "mono";
  d.dataset.skin = m ? "mono" : "neon";
  e.target.textContent = "SKIN: " + (m ? "MONO" : "NEON");
  playClick();
};
/* ---------- BOOT ---------- */
const BOOT_LOG = [
  "BIOS-e820: 0000000000000000 - 000000000009fc00 (usable)",
  "ACPI: RSDP 00000000000f6a10 00024 (v02 DMFW )",
  "CPU0: Pentium III 733MHz stepping 06",
  "PCI: Using configuration type 1 for base access",
  "SCSI subsystem initialized",
  "usb 1-1: new full-speed USB device using uhci_hcd",
  "ata1.00: ATA-6: MAXTOR 6L040J2, max UDMA/133",
  "snd_sb16: Sound Blaster 16 detected at 0x220",
  "eth0: link up, 10 Mbps, half-duplex",
  "mounting /dev/geocities ... ok",
  "loading flash_player.ko (11 vulnerabilities ignored)",
  "loading winamp.skin",
  "dialing 555-0199 ... CONNECT 56000",
  "hitcounter: initialized",
  "nostalgia.dll: loaded at 0x",
  "vga16fb: mapped to 0x",
  "agpgart: AGP aperture is 64M @ 0x",
  "systemd[1]: Reached target Museum Services.",
  "DMFW: skeuomorph.ko ... ok",
  "DMFW: gif_archive.ko ... ok",
  "DMFW: soundhall.ko ... ok",
];
const randomHex = () =>
  Math.floor(Math.random() * 4294967295)
    .toString(16)
    .padStart(8, "0");
let bn = 0,
  bt = 0,
  bl = $("#bl");
bl.textContent =
  "Welcome to MBGRTUS UI - Booting up...\n\nDMFW kernel 5.0.2000-retro #1 SMP (built Jun 18 2001)\n";
const bi = setInterval(() => {
  for (let k = 0; k < 1 + Math.random() * 3; k++) {
    bt += Math.random() * 0.08;
    const s = BOOT_LOG[(Math.random() * BOOT_LOG.length) | 0];
    bl.textContent +=
      "[ " + bt.toFixed(6).padStart(10) + "] " + s + (s.endsWith("0x") ? randomHex() : "") + "\n";
    bn++;
  }
  bl.scrollTop = 1e9;
  if (bn > 130) {
    clearInterval(bi);
    bl.textContent += "\nBoot complete.";
    setTimeout(() => {
      bl.style.display = "none";
      $("#lg").style.display = "flex";
      setTimeout(() => {
        $("#go").hidden = $("#hint").hidden = false;
      }, 1300);
    }, 500);
  }
}, 35);
$("#go").onclick = () => {
  getAudio();
  SOUNDS.boot.p();
  $("#boot").classList.add("off");
  setTimeout(() => ($("#boot").style.display = "none"), 1000);
};
/* ---------- ROUTER ---------- */
let cur = "lobby";
const halls = $$(".hall").map((h) => h.id);
function showHall(h) {
  if (!halls.includes(h)) {
    h = "lobby";
  }
  cur = h;
  $$(".hall").forEach((x) => x.classList.toggle("on", x.id == h));
  $$("nav .btn").forEach((b) => b.classList.toggle("act", b.dataset.h == h));
  scrollTo(0, 0);
  playClick();
}
addEventListener("hashchange", () => showHall(location.hash.slice(1)));
showHall(location.hash.slice(1));
/* ---------- COUNTER ---------- */
let vis = 1337;
try {
  vis = (+localStorage.dmfw || 1337) + 1;
  localStorage.dmfw = vis;
} catch (e) {}
const lcd = String(vis).padStart(6, "0");
$("#cnt").textContent = lcd;
/* ---------- SKEUOMORPHISM ---------- */
$("#aq").onclick = () => {
  getAudio();
  SOUNDS.ping.p();
};
$("#flat").onclick = (e) => {
  const f = $("#sk").classList.toggle("flat");
  e.target.textContent = f ? "◀ BRING BACK THE LEATHER (2007)" : "▶ FLATTEN TO iOS 7 (2013)";
  getAudio();
  SOUNDS.chord.p();
};
$("#sw").onclick = () => {
  getAudio();
  setMuted(!muted);
  playClick();
};
const kn = $("#knob");
let drag = false;
function turnKnob(e) {
  const r = kn.getBoundingClientRect();
  let a =
    (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180) /
      Math.PI +
    90;
  if (a > 180) {
    a -= 360;
  }
  a = Math.max(-135, Math.min(135, a));
  kn.style.transform = "rotate(" + a + "deg)";
  vol = (a + 135) / 270;
  $("#kv").textContent = Math.round(vol * 100);
  if (master && !muted) {
    master.gain.value = vol;
  }
}
kn.onpointerdown = (e) => {
  drag = true;
  kn.setPointerCapture(e.pointerId);
  kn.style.cursor = "grabbing";
  turnKnob(e);
};
kn.onpointermove = (e) => drag && turnKnob(e);
kn.onpointerup = () => {
  drag = false;
  kn.style.cursor = "grab";
  getAudio();
  SOUNDS.click.p();
};
/* ---------- FLASH ---------- */
const cv = $("#cv"),
  x = cv.getContext("2d");
let ph = 0,
  p = 0,
  t = 0,
  hold = 0,
  tr = [];
cv.onpointermove = (e) => {
  if (!ph) {
    return;
  }
  const r = cv.getBoundingClientRect(),
    c = themeColors();
  tr.push({
    x: ((e.clientX - r.left) * 640) / r.width,
    y: ((e.clientY - r.top) * 360) / r.height,
    l: 1,
    c: c[(Math.random() < 0.5) | 0],
    v: 0,
  });
};
cv.onclick = (e) => {
  if (!ph) {
    return;
  }
  const r = cv.getBoundingClientRect(),
    c = themeColors(),
    px = ((e.clientX - r.left) * 640) / r.width,
    py = ((e.clientY - r.top) * 360) / r.height;
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * 6.28,
      s = 1 + Math.random() * 3;
    tr.push({ x: px, y: py, dx: Math.cos(a) * s, dy: Math.sin(a) * s, l: 1.2, c: c[i % 2], v: 1 });
  }
  getAudio();
  SOUNDS.ping.p();
};
$("#skip").onclick = () => {
  ph = 1;
  playClick();
};
$("#rep").onclick = () => {
  ph = 0;
  p = 0;
  hold = 0;
  tr = [];
  playClick();
};
function drawFlash() {
  const [A, B] = themeColors();
  x.fillStyle = "#000";
  x.fillRect(0, 0, 640, 360);
  t++;
  x.textAlign = "center";
  if (!ph) {
    p = Math.min(99, p + (p < 70 ? 0.9 : p < 95 ? 0.25 : 0.05) * Math.random() * 2);
    x.fillStyle = A;
    x.font = "30px VT323,monospace";
    x.fillText("LOADING... " + (p | 0) + "%", 320, 150);
    x.strokeStyle = A;
    x.strokeRect(170, 170, 300, 24);
    x.fillStyle = B;
    for (let i = 0; i < p * 0.28; i++) {
      x.fillRect(174 + i * 10.5, 174, 8, 16);
    }
    x.fillStyle = "#888";
    x.font = "20px VT323,monospace";
    x.fillText("Please wait. Flash Player is loading the experience.", 320, 230);
    if (p >= 99 && ++hold > 90) {
      ph = 1;
    }
    return;
  }
  x.save();
  x.translate(320, 180);
  for (let i = 0; i < 16; i++) {
    const z = (i / 16 + t * 0.004) % 1,
      s = z * z * 760;
    x.save();
    x.rotate(t * 0.01 * (i % 2 ? 1 : -1) + z * 2);
    x.strokeStyle = i % 2 ? A : B;
    x.globalAlpha = Math.min(1, z * 2);
    x.lineWidth = 2;
    x.strokeRect(-s / 2, -s / 2, s, s);
    x.restore();
  }
  x.restore();
  x.shadowColor = A;
  x.shadowBlur = 16;
  x.fillStyle = "#fff";
  x.font = "900 46px Orbitron,monospace";
  x.fillText("WELCOME", 320, 178 + Math.sin(t * 0.08) * 10);
  x.shadowBlur = 0;
  x.font = "22px VT323,monospace";
  x.fillText("✦ you are visitor #" + lcd + " ✦", 320, 215);
  tr.forEach((s) => {
    s.l -= 0.03;
    if (s.v) {
      s.x += s.dx;
      s.y += s.dy;
      s.dy += 0.06;
    } else {
      s.y += 0.4;
    }
    x.globalAlpha = Math.max(0, s.l);
    x.fillStyle = s.c;
    x.font = "20px monospace";
    x.fillText("✦", s.x, s.y);
  });
  tr = tr.filter((s) => s.l > 0);
  x.globalAlpha = 1;
}
/* ---------- GIF ARCHIVE ---------- */
const EXHIBITS = [
  [
    "1996",
    "Under Construction",
    '<span class="bob">🚧</span><span class="bob" style="animation-delay:.2s">👷</span><span class="bob" style="animation-delay:.4s">🚧</span>',
    "Every homepage was “coming soon”. Most still are.",
  ],
  [
    "1997",
    "Spinning @",
    '<span class="spin">@</span>',
    "The email symbol, rotating for no reason. Peak 90s.",
  ],
  [
    "1998",
    "Hot Flames",
    '<b class="fire">HOT!!</b>',
    "Flame-text via WordArt, applied to anything vaguely exciting.",
  ],
  [
    "1999",
    "New!",
    '<b class="blink">NEW!</b>',
    "Blinking red proof that something had changed since last month.",
  ],
  [
    "1998",
    "Visitor Counter",
    '<span class="lcd">' + lcd + "</span>",
    "Hit counters were the original analytics. This one is real: you are the latest hit.",
  ],
  [
    "1999",
    "Spinning Globe",
    '<span class="spin" style="font-size:64px">🌐</span>',
    "The world wide web, visualized as a globe that never stops turning.",
  ],
  [
    "2000",
    "Guestbook",
    '<span class="mq">✉ Sign my guestbook ✉ Sign my guestbook ✉</span>',
    "Strangers wrote “nice site!!” and left. It was glorious.",
  ],
  [
    "1998",
    "Rainbow Rule",
    '<hr class="rb">',
    "Horizontal rules were a chance to show off. Plain lines were for cowards.",
  ],
  [
    "1999",
    "Best Viewed In",
    '<span class="badge">Best viewed in<br>800×600</span>',
    "The browser wars gave us 88×31 buttons and eternal grudges.",
  ],
];
$("#cards").innerHTML = EXHIBITS.map(
  (g, i) =>
    '<div class="card" data-i="' +
    i +
    '"><div class="art">' +
    g[2] +
    "</div><small><b>" +
    g[1] +
    "</b> · " +
    g[0] +
    "</small></div>",
).join("");
$("#cards").onclick = (e) => {
  const c = e.target.closest(".card");
  if (!c) {
    return;
  }
  const g = EXHIBITS[c.dataset.i];
  $("#info").textContent = "▶ " + g[1] + " (" + g[0] + "): " + g[3];
  getAudio();
  SOUNDS.ping.p();
};
/* ---------- SOUND HALL ---------- */
$("#pads").innerHTML = Object.keys(SOUNDS)
  .filter((k) => SOUNDS[k].n)
  .map(
    (k) =>
      '<button data-k="' +
      k +
      '"><b>▶ ' +
      SOUNDS[k].n +
      "</b>" +
      SOUNDS[k].y +
      " · " +
      SOUNDS[k].d +
      "</button>",
  )
  .join("");
$("#pads").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) {
    getAudio();
    SOUNDS[b.dataset.k].p();
  }
};
const vc = $("#viz"),
  vx = vc.getContext("2d");
function drawVisualizer() {
  const [A, B] = themeColors();
  vx.fillStyle = "#000";
  vx.fillRect(0, 0, 900, 120);
  if (!an) {
    return;
  }
  const d = new Uint8Array(an.frequencyBinCount);
  an.getByteFrequencyData(d);
  const w = 900 / d.length;
  d.forEach((v, i) => {
    const h = (v / 255) * 116;
    vx.fillStyle = i % 2 ? A : B;
    vx.fillRect(i * w + 1, 120 - h, w - 2, h);
  });
}
/* ---------- CRT / BSOD ---------- */
$("#crt2").onclick = (e) => {
  const o = document.documentElement.classList.toggle("crt");
  e.target.textContent = "CRT: " + (o ? "ON" : "OFF");
  playClick();
};
function showBsod() {
  $("#bsod").style.display = "block";
  getAudio();
  SOUNDS.err.p();
}
$("#bsod").onclick = () => ($("#bsod").style.display = "none");
/* ---------- ARCADE ---------- */
const kc = $("#sn"),
  kx = kc.getContext("2d");
let sk, sd, fd, sp;
function snakeReset() {
  sk = [
    [8, 8],
    [7, 8],
    [6, 8],
  ];
  sd = [1, 0];
  fd = [12, 8];
  sp = 0;
  $("#sco").textContent = 0;
}
snakeReset();
function snakeTurn(d) {
  if (d[0] + sd[0] || d[1] + sd[1]) {
    sd = d;
  }
}
function snakeStep() {
  if (cur != "arcade") {
    return;
  }
  const [A, B] = themeColors(),
    h = [sk[0][0] + sd[0], sk[0][1] + sd[1]];
  if (
    h[0] < 0 ||
    h[1] < 0 ||
    h[0] > 17 ||
    h[1] > 17 ||
    sk.some((s) => s[0] == h[0] && s[1] == h[1])
  ) {
    getAudio();
    SOUNDS.err.p();
    snakeReset();
    return;
  }
  sk.unshift(h);
  if (h[0] == fd[0] && h[1] == fd[1]) {
    sp++;
    $("#sco").textContent = sp;
    getAudio();
    SOUNDS.ping.p();
    fd = [(Math.random() * 18) | 0, (Math.random() * 18) | 0];
  } else {
    sk.pop();
  }
  kx.fillStyle = "#000";
  kx.fillRect(0, 0, 360, 360);
  kx.fillStyle = B;
  kx.fillRect(fd[0] * 20 + 3, fd[1] * 20 + 3, 14, 14);
  kx.fillStyle = A;
  sk.forEach((s) => kx.fillRect(s[0] * 20 + 1, s[1] * 20 + 1, 18, 18));
}
setInterval(snakeStep, 115);
kc.onpointerdown = (e) => {
  const r = kc.getBoundingClientRect(),
    dx = ((e.clientX - r.left) / r.width) * 18 - sk[0][0] - 0.5,
    dy = ((e.clientY - r.top) / r.height) * 18 - sk[0][1] - 0.5;
  snakeTurn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
};
const dc = $("#dv"),
  dg = dc.getContext("2d");
let dX = 40,
  dY = 40,
  dvx = 1.6,
  dvy = 1.2,
  dh = 0;
function drawDvd() {
  dg.fillStyle = "#000";
  dg.fillRect(0, 0, 360, 240);
  dX += dvx;
  dY += dvy;
  const a = dX <= 0 || dX >= 290,
    b = dY <= 0 || dY >= 200;
  if (a) {
    dvx *= -1;
  }
  if (b) {
    dvy *= -1;
  }
  if (a || b) {
    dh = (dh + 70) % 360;
  }
  if (a && b) {
    getAudio();
    SOUNDS.tada.p();
  }
  dX = Math.max(0, Math.min(290, dX));
  dY = Math.max(0, Math.min(200, dY));
  dg.fillStyle =
    document.documentElement.dataset.skin == "mono" ? "#fff" : "hsl(" + dh + ",100%,60%)";
  dg.fillRect(dX, dY, 70, 40);
  dg.fillStyle = "#000";
  dg.font = "900 20px Orbitron,monospace";
  dg.textAlign = "center";
  dg.fillText("DMFW", dX + 35, dY + 27);
}
/* ---------- TERMINAL ---------- */
const to = $("#to"),
  ti = $("#ti"),
  currentSkin = () => document.documentElement.dataset.skin || "neon",
  soundNames = () => Object.keys(SOUNDS).filter((k) => SOUNDS[k].n);
const printLine = (t) => {
  const p = document.createElement("p");
  p.textContent = t;
  to.insertBefore(p, to.lastElementChild);
  to.scrollTop = 1e9;
};
const COMMANDS = {
  help: () =>
    printLine(
      "help · ls · goto <hall> · play <sound> · skin <neon|mono> · crt · neofetch · whoami · bsod · clear",
    ),
  ls: () => printLine(halls.join("   ")),
  goto: (a) => (halls.includes(a) ? (location.hash = a) : printLine("no such hall: " + a)),
  play: (a) =>
    SOUNDS[a] && SOUNDS[a].n
      ? (getAudio(), SOUNDS[a].p())
      : printLine("sounds: " + soundNames().join(" ")),
  skin: (a) => {
    if (a != "neon" && a != "mono") {
      return printLine("usage: skin neon|mono");
    }
    if ((a == "mono") != (currentSkin() == "mono")) {
      $("#skin").click();
    }
  },
  crt: () => $("#crt2").click(),
  whoami: () => printLine("visitor #" + lcd),
  bsod: () => showBsod(),
  neofetch: () =>
    printLine(
      "MBGRTUS UI 1.0\nOS: Forgotten Web 2000\nHalls: " +
        halls.length +
        "\nSounds: " +
        soundNames().length +
        "\nSkin: " +
        currentSkin() +
        "\nVisitor: #" +
        lcd,
    ),
  clear: () => $$("p", to).forEach((p) => p.remove()),
};
ti.onkeydown = (e) => {
  if (e.key != "Enter") {
    return;
  }
  const v = ti.value.trim(),
    [c, a] = v.split(/\s+/);
  printLine("visitor@mbgrtus:~$ " + v);
  ti.value = "";
  if (c) {
    (COMMANDS.hasOwnProperty(c) ? COMMANDS[c] : () => printLine("command not found: " + c))(a);
  }
};
to.onclick = () => ti.focus();
addEventListener("hashchange", () => cur == "terminal" && setTimeout(() => ti.focus(), 50));
/* ---------- GUESTBOOK ---------- */
let gb = [];
try {
  gb = JSON.parse(localStorage.gb || "[]");
} catch (e) {}
const GUESTBOOK_SEED = [
  ["xX_Dark_Angel_Xx", "nice site!!! cool flash intro"],
  ["Mr.Webmaster", "added you to my webring ★"],
  ["anon", "1998 called, it wants its gifs back"],
];
function renderGuestbook() {
  const l = $("#gbl");
  l.textContent = "";
  [...gb]
    .reverse()
    .concat(GUESTBOOK_SEED)
    .forEach((g) => {
      const e = document.createElement("div"),
        b = document.createElement("b");
      e.className = "card gbe";
      b.textContent = g[0] + ": ";
      e.append(b, g[1]);
      l.append(e);
    });
}
renderGuestbook();
$("#gs").onclick = () => {
  const n = ($("#gn").value.trim() || "anon").slice(0, 24),
    m = $("#gm").value.trim().slice(0, 140);
  if (!m) {
    return;
  }
  gb.push([n, m]);
  try {
    localStorage.gb = JSON.stringify(gb.slice(-50));
  } catch (e) {}
  $("#gm").value = "";
  renderGuestbook();
  getAudio();
  SOUNDS.ping.p();
};
/* ---------- DESKTOP 98 ---------- */
const dk = $("#dk"),
  sm = $("#sm");
let zi = 10,
  wn = 0,
  dop = 0;
const APPS = {
  pc: {
    t: "My Computer",
    i: "💻",
    w: 250,
    h: () => halls.map((h) => '<div class="fl" data-g="' + h + '">📁 ' + h + "</div>").join(""),
  },
  np: {
    t: "Notepad",
    i: "📝",
    w: 300,
    h: () =>
      '<textarea style="width:100%;height:150px;border:0;outline:0;resize:none;font:15px monospace">Dear diary,\nWindows 98 is the best OS ever made.\nThe internet is only 56k away.</textarea>',
  },
  ie: {
    t: "Internet Explorer",
    i: "🌐",
    w: 320,
    h: () =>
      '<b>The page cannot be displayed</b><p>Please try the following:<br>• Check your modem cable.<br>• Wait for the handshake to finish.</p><button class="sb" data-m="1">Dial again</button>',
  },
  rb: {
    t: "Recycle Bin",
    i: "🗑️",
    w: 240,
    h: () => "Your 14 toolbars are in here.<br>0 objects restored.",
  },
};
function focusWindow(w) {
  $$(".w9", dk).forEach((x) => x.classList.add("bk"));
  w.classList.remove("bk");
  w.style.zIndex = ++zi;
  $$("#tk .sb").forEach((b) => b.classList.toggle("on", b.dataset.k == w.dataset.k));
}
function openWindow(k) {
  const a = APPS[k],
    ex = $('.w9[data-k="' + k + '"]', dk);
  if (ex) {
    ex.style.display = "block";
    focusWindow(ex);
    return;
  }
  const w = document.createElement("div"),
    n = wn++;
  w.className = "w9";
  w.dataset.k = k;
  w.style.cssText =
    "left:" + (100 + (n % 5) * 28) + "px;top:" + (16 + (n % 5) * 28) + "px;width:" + a.w + "px";
  w.innerHTML =
    '<div class="t"><span>' +
    a.i +
    " " +
    a.t +
    '</span><span><button data-a="min">_</button> <button data-a="x">✕</button></span></div><div class="c">' +
    a.h() +
    "</div>";
  dk.append(w);
  const b = document.createElement("button");
  b.className = "sb";
  b.textContent = a.i + " " + a.t;
  b.dataset.k = k;
  $("#tk").append(b);
  focusWindow(w);
  getAudio();
  SOUNDS.click.p();
}
Object.keys(APPS).forEach((k, i) => {
  const d = document.createElement("div");
  d.className = "di";
  d.dataset.k = k;
  d.style.cssText = "left:12px;top:" + (10 + i * 86) + "px";
  d.innerHTML = "<i>" + APPS[k].i + "</i><span>" + APPS[k].t + "</span>";
  dk.append(d);
});
sm.innerHTML =
  Object.keys(APPS)
    .map((k) => '<div data-s="' + k + '">' + APPS[k].i + " " + APPS[k].t + "</div>")
    .join("") + '<div data-s="sd">⏻ Shut Down...</div>';
dk.addEventListener("pointerdown", (e) => {
  const w = e.target.closest(".w9");
  if (w) {
    focusWindow(w);
  }
  if (!w || !e.target.closest(".t") || e.target.closest("button")) {
    return;
  }
  const r = dk.getBoundingClientRect(),
    ox = e.clientX - w.offsetLeft,
    oy = e.clientY - w.offsetTop;
  const mv = (v) => {
      w.style.left = Math.max(0, Math.min(r.width - 60, v.clientX - ox)) + "px";
      w.style.top = Math.max(0, Math.min(r.height - 80, v.clientY - oy)) + "px";
    },
    up = () => {
      removeEventListener("pointermove", mv);
      removeEventListener("pointerup", up);
    };
  addEventListener("pointermove", mv);
  addEventListener("pointerup", up);
});
dk.addEventListener("click", (e) => {
  const t = e.target,
    ic = t.closest(".di"),
    a = t.closest("[data-a]"),
    g = t.closest("[data-g]"),
    k = t.closest("#tk [data-k]"),
    s = t.closest("[data-s]");
  if (ic) {
    openWindow(ic.dataset.k);
  } else if (a) {
    const w = a.closest(".w9");
    w.style.display = "none";
    if (a.dataset.a == "x") {
      const q = w.dataset.k;
      w.remove();
      $('#tk [data-k="' + q + '"]').remove();
    }
  } else if (g) {
    location.hash = g.dataset.g;
  } else if (t.dataset.m) {
    getAudio();
    SOUNDS.modem.p();
  } else if (k) {
    const w = $('.w9[data-k="' + k.dataset.k + '"]', dk);
    if (w.style.display == "none" || w.classList.contains("bk")) {
      w.style.display = "block";
      focusWindow(w);
    } else {
      w.style.display = "none";
    }
  } else if (s) {
    s.dataset.s == "sd" ? showBsod() : openWindow(s.dataset.s);
  } else if (t.id == "st") {
    sm.classList.toggle("on");
    getAudio();
    SOUNDS.click.p();
    return;
  }
  sm.classList.remove("on");
});
const ck = () =>
  ($("#clk").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }));
ck();
setInterval(ck, 1000);
addEventListener("hashchange", () => {
  if (cur == "desk" && !dop) {
    dop = 1;
    openWindow("pc");
    getAudio();
    SOUNDS.tada.p();
  }
});
if (cur == "desk") {
  dop = 1;
  openWindow("pc");
}
/* ---------- KEYS (arcade + konami) ---------- */
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let ki = 0;
addEventListener("keydown", (e) => {
  const k = e.key,
    m = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    };
  if (cur == "arcade" && m[k]) {
    e.preventDefault();
    snakeTurn(m[k]);
  }
  ki = k == KONAMI[ki] ? ki + 1 : k == KONAMI[0] ? 1 : 0;
  if (ki == KONAMI.length) {
    ki = 0;
    showBsod();
  }
});
(function tick() {
  requestAnimationFrame(tick);
  if (cur == "flash") {
    drawFlash();
  } else if (cur == "sounds") {
    drawVisualizer();
  } else if (cur == "arcade") {
    drawDvd();
  }
})();