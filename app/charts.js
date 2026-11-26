import { money, moneyShort } from './format.js';

function setupCanvas(canvas, heightCss) {
  const ratio = window.devicePixelRatio || 1;
  const widthCss = canvas.clientWidth || 360;
  canvas.width = Math.round(widthCss * ratio);
  canvas.height = Math.round(heightCss * ratio);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, widthCss, heightCss);
  return { ctx, width: widthCss, height: heightCss };
}

export function drawDonut(canvas, slices) {
  const size = 300;
  const { ctx, width, height } = setupCanvas(canvas, size);
  const cx = width / 2;
  const cy = height / 2;
  const outer = 118;
  const inner = 72;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (!total) {
    ctx.fillStyle = '#6b7268';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#24302a';
  ctx.font = '700 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(money(total), cx, cy - 2);
  ctx.fillStyle = '#6b7268';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('spent in November', cx, cy + 20);
}

export function drawBars(canvas, rows) {
  const heightCss = 260;
  const { ctx, width, height } = setupCanvas(canvas, heightCss);
  const padLeft = 8;
  const padBottom = 30;
  const padTop = 34;
  const plotWidth = width - padLeft * 2;
  const plotHeight = height - padTop - padBottom;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const gap = 10;
  const barWidth = Math.min(64, (plotWidth - gap * (rows.length - 1)) / rows.length);
  const totalWidth = barWidth * rows.length + gap * (rows.length - 1);
  let x = padLeft + (plotWidth - totalWidth) / 2;
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const row of rows) {
    const barHeight = Math.max(2, (row.value / max) * plotHeight);
    const y = padTop + plotHeight - barHeight;
    ctx.fillStyle = row.color || '#234434';
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#24302a';
    ctx.fillText(moneyShort(row.value), x + barWidth / 2, y - 8);
    ctx.fillStyle = '#6b7268';
    ctx.fillText(row.label, x + barWidth / 2, height - 10);
    x += barWidth + gap;
  }
}
