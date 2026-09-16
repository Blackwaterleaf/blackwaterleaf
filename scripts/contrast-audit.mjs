const pairs = [
  ["Primary body", "#effff5", "#020604"],
  ["Secondary body", "#a9c0b3", "#020604"],
  ["Muted navigation", "#6d8d7b", "#020906"],
  ["Active navigation", "#69f4ba", "#020906"],
  ["Mint eyebrow", "#61f4b6", "#030906"],
  ["Cyan status", "#3de8ff", "#030906"],
  ["Gold status", "#edcc79", "#030906"],
  ["Primary action", "#041009", "#5bf5b2"],
  ["Muted setting", "#85a292", "#030a06"],
];

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map(offset => channel(Number.parseInt(value.slice(offset, offset + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

for (const [label, foreground, background] of pairs) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  const ratio = (light + 0.05) / (dark + 0.05);
  const normal = ratio >= 4.5 ? "PASS" : "FAIL";
  console.log(`${label}\t${foreground}\t${background}\t${ratio.toFixed(2)}:1\t${normal}`);
}
