// Pen rendering algorithms for the drawing canvas

/**
 * Catmull-Rom spline smoothing for stroke points
 * Creates smooth curves through all points
 */
export function catmullRomSpline(points, tension = 0.5) {
  if (points.length < 2) return points

  const smoothedPoints = []

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    // Generate intermediate points
    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t
      const t3 = t2 * t

      const x =
        0.5 *
        ((2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)

      const y =
        0.5 *
        ((2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)

      // Interpolate pressure
      const pressure = p1.pressure + (p2.pressure - p1.pressure) * t

      smoothedPoints.push({ x, y, pressure })
    }
  }

  // Add the last point
  smoothedPoints.push(points[points.length - 1])

  return smoothedPoints
}

/**
 * Calculate speed from two points
 */
export function calculateSpeed(p1, p2, dt) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance / dt
}

/**
 * Apply pen-specific rendering
 */
export function renderStroke(ctx, points, penType, color, baseSize) {
  if (points.length < 2) return

  const smoothedPoints = catmullRomSpline(points)

  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (penType) {
    case 'ballpoint':
      renderBallpoint(ctx, smoothedPoints, baseSize)
      break
    case 'fountain':
      renderFountain(ctx, smoothedPoints, baseSize)
      break
    case 'brush':
      renderBrush(ctx, smoothedPoints, baseSize)
      break
    case 'highlighter':
      renderHighlighter(ctx, smoothedPoints, color, baseSize)
      break
    case 'pencil':
      renderPencil(ctx, smoothedPoints, color, baseSize)
      break
    case 'eraser':
      renderEraser(ctx, smoothedPoints, baseSize)
      break
    default:
      renderBallpoint(ctx, smoothedPoints, baseSize)
  }
}

/**
 * Ballpoint pen: consistent line with slight pressure variation
 */
function renderBallpoint(ctx, points, baseSize) {
  ctx.globalAlpha = 0.95

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    const pressure = p.pressure || 0.5
    ctx.lineWidth = baseSize * (0.8 + pressure * 0.4)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  ctx.globalAlpha = 1
}

/**
 * Fountain pen: line thins when fast, thickens when slow + pressure
 */
function renderFountain(ctx, points, baseSize) {
  ctx.globalAlpha = 0.9

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]

    // Calculate speed factor
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const speedFactor = 1 / (distance * 0.1 + 1)

    const pressure = p2.pressure || 0.5
    const width = baseSize * (0.3 + 1.7 * pressure * speedFactor)

    ctx.lineWidth = Math.max(0.5, Math.min(width, baseSize * 2))

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

/**
 * Brush pen: wide, soft strokes with tapered ends
 */
function renderBrush(ctx, points, baseSize) {
  ctx.globalAlpha = 0.85

  const taperLength = Math.floor(points.length * 0.1)

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]

    const pressure = p2.pressure || 0.5
    let width = baseSize * (0.1 + 2.9 * pressure)

    // Apply taper at start and end
    if (i < taperLength) {
      width *= i / taperLength
    } else if (i > points.length - taperLength) {
      width *= (points.length - i) / taperLength
    }

    ctx.lineWidth = Math.max(0.5, width)

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

/**
 * Highlighter: wide, semi-transparent, non-compounding
 */
function renderHighlighter(ctx, points, color, baseSize) {
  // Create offscreen canvas for non-compounding effect
  const offscreen = document.createElement('canvas')
  offscreen.width = ctx.canvas.width
  offscreen.height = ctx.canvas.height
  const offCtx = offscreen.getContext('2d')

  offCtx.strokeStyle = color
  offCtx.lineWidth = baseSize
  offCtx.lineCap = 'round'
  offCtx.lineJoin = 'round'

  offCtx.beginPath()
  offCtx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    offCtx.lineTo(points[i].x, points[i].y)
  }

  offCtx.stroke()

  // Composite onto main canvas with multiply
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = 0.22
  ctx.drawImage(offscreen, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
}

/**
 * Pencil: grainy, textured strokes
 */
function renderPencil(ctx, points, color, baseSize) {
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]
    const pressure = p2.pressure || 0.5

    // Calculate density based on pressure
    const density = Math.floor(3 + pressure * 10)

    // Draw scattered dots along the path
    for (let j = 0; j < density; j++) {
      const t = j / density
      const x = p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * baseSize
      const y = p1.y + (p2.y - p1.y) * t + (Math.random() - 0.5) * baseSize

      ctx.globalAlpha = 0.3 + pressure * 0.4
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * baseSize * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
}

/**
 * Eraser: removes pixels
 */
function renderEraser(ctx, points, baseSize) {
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineWidth = baseSize

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }

  ctx.stroke()
  ctx.globalCompositeOperation = 'source-over'
}
