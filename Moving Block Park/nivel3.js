const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const laberinto = [
  "VVVVVVVVVVVVVVVVVVVV",
  "V     V     V      V",
  "V VVV V VVV V V V  V",
  "V V     V   V V VVVV",
  "V V VVVVV VVV V    V",
  "V V     V     V VV V",
  "V VVV VVV VVVVVVVV V",
  "V   V     V      V V",
  "VVV V VVV V VVV  V V",
  "V     V     V   VV V",
  "VVVVVVVVVVVVVVVVV  V"
];

const filas = laberinto.length;
const columnas = laberinto[0].length;
const celdaW = canvas.width / columnas;
const celdaH = canvas.height / filas;

setTimeout(() => {
  const nivelInfo = document.getElementById("nivel-info");
  if (nivelInfo) {
    nivelInfo.style.opacity = "0";
    setTimeout(() => {
      nivelInfo.style.display = "none";
    }, 1000); // Espera a que termine la transición
  }
}, 2000);

const jugador = { x: celdaW * 1.5, y: celdaH * 1.5, size: 44, vidas: 3, monedas: 0 };
const velocidad = 5;
const meta = {
  x: (columnas - 2 + 0.5) * celdaW,
  y: (filas - 2 + 0.5) * celdaH,
  size: Math.min(celdaW, celdaH) * 0.9
}; let tiempo = 60;

const sonidoDead = new Audio('./resources/sounds/dead.mp3');
sonidoDead.volume = 0.5;

const sonidoMeta = new Audio('./resources/sounds/meta.mp3');
sonidoMeta.volume = 0.5;

const sonidoCharco = new Audio('./resources/sounds/squishy.mp3');
sonidoCharco.volume = 0.5;
sonidoCharco.playbackRate = 1.5;

const sonidoMoneda = new Audio('./resources/sounds/moneda.mp3');
sonidoMoneda.volume = 0.2;
sonidoMoneda.playbackRate = 1.5;

const sonidoVida = new Audio('./resources/sounds/vida.mp3');
sonidoVida.volume = 0.5;
sonidoMoneda.playbackRate = 2.0;

const musicaFondo = new Audio('./resources/sounds/music3.mp3');
musicaFondo.loop = true;
musicaFondo.volume = 0.2;
musicaFondo.play().catch(error => {
  console.log('Reproducción bloqueada por el navegador. Requiere interacción del usuario.');
});


document.addEventListener('click', () => {
  musicaFondo.play();
}, { once: true });

const monedas = [
  { x: celdaW * 3.5, y: celdaH * 1.5, visible: true },
  { x: celdaW * 7.5, y: celdaH * 5.5, visible: true },
  { x: celdaW * 13.5, y: celdaH * 3.5, visible: true },
  { x: celdaW * 16.5, y: celdaH * 8.5, visible: true },
  { x: celdaW * 10.5, y: celdaH * 9.5, visible: true }
];

const vidaExtra = [
  { x: celdaW * 5.5, y: celdaH * 8.5, visible: true },
  { x: celdaW * 15.5, y: celdaH * 2.5, visible: true }
];

const caminoPuntos = [
  { x: 60, y: 100 },
  { x: 320, y: 100 },
  { x: 320, y: 200 },
  { x: 450, y: 200 },
  { x: 450, y: 100 },
  { x: 680, y: 100 },
  { x: 680, y: 220 },
  { x: 550, y: 220 },
  { x: 550, y: 350 },
  { x: 800, y: 350 },
  { x: 800, y: 100 },
  { x: 930, y: 100 },
  { x: 930, y: 280 },
  { x: 1100, y: 280 },
  { x: 1100, y: 980 }

];

const ardillas = [
  { x: celdaW * 5.5, y: celdaH * 3.5, size: 44, dir: 1, eje: "x", velocidad: 2, visible: true },
  { x: celdaW * 9.5, y: celdaH * 7.5, size: 44, dir: -1, eje: "y", velocidad: 2.2, visible: true },
  { x: celdaW * 3.5, y: celdaH * 9.5, size: 44, dir: 1, eje: "x", velocidad: 1.8, visible: true },
  { x: celdaW * 15.5, y: celdaH * 1.5, size: 44, dir: -1, eje: "x", velocidad: 2.5, visible: true }
];

const ardillaImg = new Image();
ardillaImg.src = './resources/img/ardilla.png'; // Usa la imagen que subiste
// Puedes agregar más ardillas cambiando posiciones y dirección

let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function limpiarTeclas() {
  keys = {};
}

const monedasOriginal = JSON.parse(JSON.stringify(monedas));
const vidaExtraOriginal = JSON.parse(JSON.stringify(vidaExtra));
const ardillasOriginal = JSON.parse(JSON.stringify(ardillas));

function drawArdilla(ctx, ardilla) {
  if (!ardilla.visible) return;
  ctx.save();
  ctx.drawImage(ardillaImg, ardilla.x - ardilla.size / 2, ardilla.y - ardilla.size / 2, ardilla.size, ardilla.size);
  ctx.restore();
}

function mostrarMensaje(texto, color = "#f43f5e") {
  // Elimina mensaje anterior si existe
  let anterior = document.getElementById("mensaje-flotante");
  if (anterior) anterior.remove();

  let msg = document.createElement("div");
  msg.id = "mensaje-flotante";
  msg.textContent = texto;
  msg.style.position = "fixed";
  msg.style.top = "90px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.background = "rgba(30,41,59,0.95)";
  msg.style.color = color;
  msg.style.padding = "16px 32px";
  msg.style.borderRadius = "16px";
  msg.style.fontSize = "1.3rem";
  msg.style.fontWeight = "bold";
  msg.style.zIndex = 9999;
  msg.style.boxShadow = "0 4px 24px #0008";
  msg.style.opacity = "1";
  msg.style.transition = "opacity 0.5s";
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
  }, 1800);
}

function mostrarVictoria(monedas) {
  let anterior = document.getElementById("victoria-msg");
  if (anterior) anterior.remove();

  let msg = document.createElement("div");
  msg.id = "victoria-msg";
  msg.innerHTML = `🏅 ¡Nivel superado! 🏅<br>
        <span style="font-size:1.1rem;color:#fff;">Monedas obtenidas: <b>${monedas}</b></span>`;
  msg.style.position = "fixed";
  msg.style.top = "90px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.background = "rgba(34,197,94,0.97)"; // verde
  msg.style.color = "#fff";
  msg.style.padding = "18px 36px";
  msg.style.borderRadius = "16px";
  msg.style.fontSize = "1.4rem";
  msg.style.fontWeight = "bold";
  msg.style.zIndex = 9999;
  msg.style.boxShadow = "0 4px 24px #0008";
  msg.style.opacity = "1";
  msg.style.transition = "opacity 0.5s";
  msg.style.textAlign = "center";
  document.body.appendChild(msg);
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
    window.location.href = "menu.html";
  }, 1400); // Más rápido y discreto
}

function cerrarCeldaTemporal(x, y) {
  // Cambia el carácter a "V" (pared vegetal)
  laberinto[y] = laberinto[y].substring(0, x) + "V" + laberinto[y].substring(x + 1);

  // Después de 2 segundos, vuelve a abrir el camino
  setTimeout(() => {
    laberinto[y] = laberinto[y].substring(0, x) + " " + laberinto[y].substring(x + 1);
  }, 1000); // 2000 ms = 2 segundos, ajusta si quieres
}


function colision(a, b, size = 20, circular = false) {
  if (circular) {
    const dx = (a.x + a.size / 2) - (b.x + size / 2);
    const dy = (a.y + a.size / 2) - (b.y + size / 2);
    const distancia = Math.sqrt(dx * dx + dy * dy);
    return distancia < (a.size / 2 + size / 2);
  } else {
    return a.x < b.x + size && a.x + a.size > b.x && a.y < b.y + size && a.y + a.size > b.y;
  }
}

let invulnerable = false;
let nivelCompletado = false;
let celdaAnterior = null;

function actualizar() {
  if (nivelCompletado) return;

  let prevCeldaX = Math.floor(jugador.x / celdaW);
  let prevCeldaY = Math.floor(jugador.y / celdaH);

  let prevX = jugador.x, prevY = jugador.y;
  if (keys["ArrowUp"] || keys["w"]) jugador.y -= velocidad;
  if (keys["ArrowDown"] || keys["s"]) jugador.y += velocidad;
  if (keys["ArrowLeft"] || keys["a"]) jugador.x -= velocidad;
  if (keys["ArrowRight"] || keys["d"]) jugador.x += velocidad;

  let currCeldaX = Math.floor(jugador.x / celdaW);
  let currCeldaY = Math.floor(jugador.y / celdaH);

  jugador.x = Math.max(0, Math.min(canvas.width - jugador.size, jugador.x));
  jugador.y = Math.max(0, Math.min(canvas.height - jugador.size, jugador.y));

  if (colisionVegetal(jugador)) {
    jugador.x = prevX;
    jugador.y = prevY;
  }

  if ((currCeldaX !== prevCeldaX || currCeldaY !== prevCeldaY) &&
      laberinto[prevCeldaY][prevCeldaX] === " ") {
    cerrarCeldaTemporal(prevCeldaX, prevCeldaY);
  }

  for (let i = 0; i < monedas.length; i++) {
    if (colision(jugador, monedas[i], 32)) {
      if (monedas[i].trampa) {
        sonidoDead.play();
        setTimeout(() => { }, 1000);
        jugador.vidas--;
        limpiarTeclas();
        mostrarMensaje("¡Era una moneda trampa! Perdiste una vida. Vidas restantes: " + jugador.vidas);
        if (jugador.vidas <= 0) {
          sonidoDead.play();
          reiniciar();
        }
      } else {
        jugador.monedas++;
        sonidoMoneda.play();
      }
      monedas.splice(i, 1);
      break;

    }
  }

  for (let ardilla of ardillas) {
    if (!ardilla.visible) continue;
    let prevX = ardilla.x, prevY = ardilla.y;
    if (ardilla.eje === "x") ardilla.x += ardilla.dir * ardilla.velocidad;
    else ardilla.y += ardilla.dir * ardilla.velocidad;

    // Si choca con pared vegetal, cambia de dirección
    const temp = { x: ardilla.x, y: ardilla.y, size: ardilla.size };
    if (colisionVegetal(temp)) {
      ardilla.x = prevX;
      ardilla.y = prevY;
      ardilla.dir *= -1;
    }

    // Colisión con jugador (ahora con invulnerabilidad)
    if (
      Math.hypot(jugador.x - ardilla.x, jugador.y - ardilla.y) < (jugador.size / 2 + ardilla.size / 2)
      && ardilla.visible && !nivelCompletado && !invulnerable
    ) {
      jugador.vidas--;
      sonidoDead.play();
      mostrarMensaje("¡Una ardilla te quitó una vida! Vidas: " + jugador.vidas, "#f43f5e");
      invulnerable = true;
      setTimeout(() => invulnerable = false, 1500); // 1.5 segundos de invulnerabilidad
      if (jugador.vidas <= 0) {
        setTimeout(reiniciar, 1000);
      }
    }
  }

  for (let vida of vidaExtra) {
    if (
      vida.visible &&
      Math.hypot(jugador.x - vida.x, jugador.y - vida.y) < (jugador.size / 2 + 18)
    ) {
      jugador.vidas++;
      sonidoVida.play();
      vida.visible = false;
      limpiarTeclas();
      mostrarMensaje("¡Encontraste una vida extra! ❤️ Vidas: " + jugador.vidas, "#22c55e");
    }
  }

  if (
    Math.hypot(jugador.x - meta.x, jugador.y - meta.y) < (jugador.size / 2 + meta.size / 2)
    && !nivelCompletado
  ) {
    nivelCompletado = true;
    mostrarVictoria(jugador.monedas);
    sonidoMeta.play();
    musicaFondo.pause();
    clearInterval(intervaloTemporizador);
  }

  document.getElementById("vidas").textContent = jugador.vidas;
  document.getElementById("monedas").textContent = jugador.monedas;
}

function dibujarCamino(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(caminoPuntos[0].x, caminoPuntos[0].y);
  for (let i = 1; i < caminoPuntos.length; i++) {
    ctx.lineTo(caminoPuntos[i].x, caminoPuntos[i].y);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 12;
  ctx.setLineDash([24, 18]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawLaberinto(ctx) {
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < columnas; x++) {
      const tipo = laberinto[y][x];
      const cx = x * celdaW;
      const cy = y * celdaH;
      if (tipo === "V") {
        // Arbusto base
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx + celdaW / 2, cy + celdaH / 2, Math.min(celdaW, celdaH) * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#22c55e";
        ctx.shadowColor = "#166534";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hojas (círculos más pequeños)
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(
            cx + celdaW / 2 + Math.cos(angle) * celdaW * 0.22,
            cy + celdaH / 2 + Math.sin(angle) * celdaH * 0.22,
            Math.min(celdaW, celdaH) * 0.18,
            0, Math.PI * 2
          );
          ctx.fillStyle = "#16a34a";
          ctx.fill();
        }

        // Flores rosas
        for (let i = 0; i < 3; i++) {
          const angle = Math.PI * 2 * (i / 3) + (x + y) % 2;
          ctx.beginPath();
          ctx.arc(
            cx + celdaW / 2 + Math.cos(angle) * celdaW * 0.18,
            cy + celdaH / 2 + Math.sin(angle) * celdaH * 0.18,
            Math.min(celdaW, celdaH) * 0.09,
            0, Math.PI * 2
          );
          ctx.fillStyle = "#f472b6";
          ctx.shadowColor = "#fff";
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Centro de flor
        for (let i = 0; i < 3; i++) {
          const angle = Math.PI * 2 * (i / 3) + (x + y) % 2;
          ctx.beginPath();
          ctx.arc(
            cx + celdaW / 2 + Math.cos(angle) * celdaW * 0.18,
            cy + celdaH / 2 + Math.sin(angle) * celdaH * 0.18,
            Math.min(celdaW, celdaH) * 0.03,
            0, Math.PI * 2
          );
          ctx.fillStyle = "#fde047";
          ctx.fill();
        }

        ctx.restore();
      } else if (tipo === "R") {
        // Rosas grandes decorativas
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx + celdaW / 2, cy + celdaH / 2, Math.min(celdaW, celdaH) * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "#f43f5e";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + celdaW / 2, cy + celdaH / 2, Math.min(celdaW, celdaH) * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = "#fde047";
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

function drawMoneda(ctx, moneda) {
  if (!moneda.visible) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(moneda.x, moneda.y, 16, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", moneda.x, moneda.y + 1);
  ctx.restore();
}

function drawVida(ctx, vida) {
  if (!vida.visible) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(vida.x, vida.y, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#f43f5e";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("❤️", vida.x, vida.y + 1);
  ctx.restore();
}

const pinkyImg = new Image();
pinkyImg.src = './resources/img/dan.png';

function drawJugador(ctx, x, y, size) {
  ctx.save();
  ctx.drawImage(pinkyImg, x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

function colisionVegetal(jugador) {
  const x = Math.floor(jugador.x / celdaW);
  const y = Math.floor(jugador.y / celdaH);
  return laberinto[y] && laberinto[y][x] === "V";
}

function drawMeta(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.scale(size / 48, size / 48);

  // Base del poste
  ctx.save();
  ctx.fillStyle = "#b0b0b0";
  ctx.beginPath();
  ctx.ellipse(-10, 24, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Poste
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.lineTo(-10, -20);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#8b5c2a";
  ctx.shadowColor = "#d1a36a";
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.restore();

  // Bandera (con ondas)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-10, -20);
  ctx.bezierCurveTo(10, -25, 20, -10, 10, -5);
  ctx.bezierCurveTo(20, 0, 10, 10, -10, 0);
  ctx.closePath();
  ctx.fillStyle = "#f43f5e"; // Rosa fuerte
  ctx.shadowColor = "#fda4af";
  ctx.shadowBlur = 8;
  ctx.fill();

  // Detalle blanco en la bandera
  ctx.beginPath();
  ctx.moveTo(-8, -17);
  ctx.bezierCurveTo(6, -20, 14, -8, 7, -4);
  ctx.bezierCurveTo(14, 0, 6, 7, -8, 2);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // Bola en la punta del poste
  ctx.save();
  ctx.beginPath();
  ctx.arc(-10, -20, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fde047";
  ctx.shadowColor = "#facc15";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLaberinto(ctx);
  dibujarCamino(ctx);
  drawJugador(ctx, jugador.x, jugador.y, jugador.size);
  for (let moneda of monedas) drawMoneda(ctx, moneda);
  for (let vida of vidaExtra) drawVida(ctx, vida);
  for (let ardilla of ardillas) drawArdilla(ctx, ardilla);
  drawMeta(ctx, meta.x, meta.y, meta.size);
}

function bucle() {
  actualizar();
  dibujar();
  requestAnimationFrame(bucle);
}

function reiniciar() {
  jugador.x = celdaW * 1.5;
  jugador.y = celdaH * 1.5;
  jugador.vidas = 3;
  jugador.monedas = 0;
  tiempo = 60;
  monedas.length = 0;
  vidaExtra.length = 0;
  ardillas.length = 0;
  for (const m of monedasOriginal) monedas.push({ ...m });
  for (const v of vidaExtraOriginal) vidaExtra.push({ ...v });
  for (const a of ardillasOriginal) ardillas.push({ ...a });
  limpiarTeclas();
  iniciarTemporizador();
}

let intervaloTemporizador = null;

function iniciarTemporizador() {
  clearInterval(intervaloTemporizador);
  intervaloTemporizador = setInterval(() => {
    tiempo--;
    document.getElementById("tiempo").textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(intervaloTemporizador);
      mostrarMensaje("⏰ ¡Tiempo agotado!");
      sonidoDead.play();
      reiniciar();
    }
  }, 1000);
}



iniciarTemporizador();
bucle();