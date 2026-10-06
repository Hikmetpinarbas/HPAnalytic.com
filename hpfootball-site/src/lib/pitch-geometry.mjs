// IFAB Law 1 reference pitch (metres) projected into SVG coordinates.
// Decomposition follows mplsoccer's dims → renderer split (MIT, reference only;
// no code copied): geometry is data, the SVG component only draws it.
export const IFAB_PITCH = Object.freeze({
  length: 105,
  width: 68,
  penaltyAreaLength: 16.5,
  penaltyAreaWidth: 40.32,
  goalAreaLength: 5.5,
  goalAreaWidth: 18.32,
  penaltySpot: 11,
  centreCircleRadius: 9.15,
  goalWidth: 7.32,
});

export function pitchGeometry({ width = 900, padding = 40, dims = IFAB_PITCH } = {}) {
  const scale = (width - padding * 2) / dims.length;
  const height = dims.width * scale + padding * 2;
  const x = (m) => padding + m * scale;
  const y = (m) => padding + m * scale;
  const midY = dims.width / 2;
  const box = (length, boxWidth, side) => ({
    x: side === 'left' ? x(0) : x(dims.length - length),
    y: y(midY - boxWidth / 2),
    width: length * scale,
    height: boxWidth * scale,
  });
  // Penalty arc: the part of the 9.15 m circle around the spot outside the box.
  const arcDx = dims.penaltyAreaLength - dims.penaltySpot;
  const arcDy = Math.sqrt(dims.centreCircleRadius ** 2 - arcDx ** 2);
  const r = dims.centreCircleRadius * scale;
  const arcPath = (side) => {
    const edge = side === 'left' ? dims.penaltyAreaLength : dims.length - dims.penaltyAreaLength;
    const sweep = side === 'left' ? 1 : 0;
    return `M${x(edge)} ${y(midY - arcDy)} A${r} ${r} 0 0 ${sweep} ${x(edge)} ${y(midY + arcDy)}`;
  };

  return {
    scale,
    viewBox: `0 0 ${width} ${round(height)}`,
    width,
    height: round(height),
    toSvg: (mx, my) => ({ x: x(mx), y: y(my) }),
    outline: { x: x(0), y: y(0), width: dims.length * scale, height: dims.width * scale },
    halfway: { x1: x(dims.length / 2), y1: y(0), x2: x(dims.length / 2), y2: y(dims.width) },
    centre: { cx: x(dims.length / 2), cy: y(midY), r },
    penaltyAreas: [box(dims.penaltyAreaLength, dims.penaltyAreaWidth, 'left'), box(dims.penaltyAreaLength, dims.penaltyAreaWidth, 'right')],
    goalAreas: [box(dims.goalAreaLength, dims.goalAreaWidth, 'left'), box(dims.goalAreaLength, dims.goalAreaWidth, 'right')],
    penaltySpots: [{ cx: x(dims.penaltySpot), cy: y(midY) }, { cx: x(dims.length - dims.penaltySpot), cy: y(midY) }],
    penaltyArcs: [arcPath('left'), arcPath('right')],
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}
