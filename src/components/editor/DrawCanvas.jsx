import { useRef, useEffect, useState, useCallback } from 'react'
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  Undo2, 
  Redo2,
  Minus,
  Plus,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

// Pen types configuration
const PEN_TYPES = {
  ballpoint: { name: 'Ballpoint', icon: Pen, defaultSize: 3, minPressure: 0.8, maxPressure: 1.2, opacity: 0.95 },
  fountain: { name: 'Fountain', icon: Pen, defaultSize: 2, minPressure: 0.3, maxPressure: 2, opacity: 0.9 },
  brush: { name: 'Brush', icon: Pen, defaultSize: 5, minPressure: 0.1, maxPressure: 3, opacity: 0.85 },
  highlighter: { name: 'Highlighter', icon: Highlighter, defaultSize: 12, minPressure: 1, maxPressure: 1, opacity: 0.22 },
  pencil: { name: 'Pencil', icon: Pen, defaultSize: 3, minPressure: 0.5, maxPressure: 1.5, opacity: 0.7 },
  eraser: { name: 'Eraser', icon: Eraser, defaultSize: 15, minPressure: 1, maxPressure: 1, opacity: 1 },
}

// Color palette
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Dark Gray', hex: '#636366' },
  { name: 'Red', hex: '#FF453A' },
  { name: 'Orange', hex: '#FF9500' },
  { name: 'Green', hex: '#30D158' },
  { name: 'Blue', hex: '#0A84FF' },
  { name: 'Purple', hex: '#BF5AF2' },
  { name: 'Pink', hex: '#FF375F' },
  { name: 'Brown', hex: '#A2845E' },
  { name: 'White', hex: '#FFFFFF' },
]

export default function DrawCanvas({ noteId }) {
  const canvasRef = useRef(null)
  const patternCanvasRef = useRef(null)
  const contextRef = useRef(null)
  const containerRef = useRef(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [activePen, setActivePen] = useState('ballpoint')
  const [activeColor, setActiveColor] = useState('#000000')
  const [penSize, setPenSize] = useState(3)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [points, setPoints] = useState([])

  const { updateNote, getSelectedNote } = useAppStore()
  const note = getSelectedNote()
  
  const paperColor = note?.paperColor || '#FFFFFF'
  const paperTemplate = note?.paperTemplate || 'blank'

  // Draw paper pattern on background canvas
  const drawPaperPattern = useCallback((ctx, width, height) => {
    // Fill background
    ctx.fillStyle = paperColor
    ctx.fillRect(0, 0, width, height)

    const isDark = paperColor === '#1C1C1E'
    const lineColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
    const dotColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'

    ctx.strokeStyle = lineColor
    ctx.fillStyle = dotColor

    switch (paperTemplate) {
      case 'dotted':
        for (let x = 20; x < width; x += 20) {
          for (let y = 20; y < height; y += 20) {
            ctx.beginPath()
            ctx.arc(x, y, 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
      case 'squared':
        ctx.lineWidth = 0.5
        for (let x = 0; x <= width; x += 20) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y <= height; y += 20) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break
      case 'ruled-narrow':
        ctx.lineWidth = 0.5
        for (let y = 30; y < height; y += 24) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break
      case 'ruled-wide':
        ctx.lineWidth = 0.5
        for (let y = 40; y < height; y += 36) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break
      default:
        break
    }
  }, [paperColor, paperTemplate])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const patternCanvas = patternCanvasRef.current
    const container = containerRef.current
    if (!canvas || !patternCanvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Setup pattern canvas (background)
    patternCanvas.width = rect.width * dpr
    patternCanvas.height = rect.height * dpr
    patternCanvas.style.width = `${rect.width}px`
    patternCanvas.style.height = `${rect.height}px`
    const patternCtx = patternCanvas.getContext('2d')
    patternCtx.scale(dpr, dpr)
    drawPaperPattern(patternCtx, rect.width, rect.height)

    // Setup drawing canvas
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    contextRef.current = ctx

    // Load existing drawing if any
    if (note?.drawingData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = note.drawingData
    }

    // Save initial state
    saveToUndoStack()
  }, [noteId, drawPaperPattern])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const patternCanvas = patternCanvasRef.current
      const container = containerRef.current
      if (!canvas || !patternCanvas || !container) return

      // Save current drawing
      const dataUrl = canvas.toDataURL()

      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // Resize pattern canvas
      patternCanvas.width = rect.width * dpr
      patternCanvas.height = rect.height * dpr
      patternCanvas.style.width = `${rect.width}px`
      patternCanvas.style.height = `${rect.height}px`
      const patternCtx = patternCanvas.getContext('2d')
      patternCtx.scale(dpr, dpr)
      drawPaperPattern(patternCtx, rect.width, rect.height)

      // Resize drawing canvas
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      contextRef.current = ctx

      // Restore drawing
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = dataUrl
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawPaperPattern])

  const saveToUndoStack = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    setUndoStack((prev) => [...prev.slice(-49), dataUrl])
    setRedoStack([])
  }, [])

  const getPointerPosition = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    const pressure = e.pressure || 0.5
    return { x, y, pressure }
  }

  const startDrawing = (e) => {
    // Palm rejection: only draw with pen or mouse, ignore touch on iPad
    if (e.pointerType === 'touch') return

    const { x, y, pressure } = getPointerPosition(e)
    setPoints([{ x, y, pressure }])
    setIsDrawing(true)

    const ctx = contextRef.current
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    if (e.pointerType === 'touch') return

    const { x, y, pressure } = getPointerPosition(e)
    const ctx = contextRef.current
    const pen = PEN_TYPES[activePen]

    // Add point for smoothing
    setPoints((prev) => [...prev, { x, y, pressure }])

    // Calculate pressure-sensitive size
    const pressureMultiplier = pen.minPressure + (pen.maxPressure - pen.minPressure) * pressure
    const currentSize = penSize * pressureMultiplier

    if (activePen === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else if (activePen === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'
      ctx.strokeStyle = activeColor
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = activeColor
    }

    ctx.globalAlpha = pen.opacity
    ctx.lineWidth = currentSize

    // Smooth drawing using quadratic curves
    const pts = points
    if (pts.length >= 2) {
      const lastPoint = pts[pts.length - 2]
      const currentPoint = pts[pts.length - 1]
      const midX = (lastPoint.x + currentPoint.x) / 2
      const midY = (lastPoint.y + currentPoint.y) / 2

      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(midX, midY)
    }
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    setPoints([])
    contextRef.current.globalCompositeOperation = 'source-over'
    contextRef.current.globalAlpha = 1

    // Save to undo stack
    saveToUndoStack()

    // Save drawing to note (debounced)
    saveDrawing()
  }

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !noteId) return

    const dataUrl = canvas.toDataURL('image/png')
    updateNote(noteId, { drawingData: dataUrl, hasDrawing: true })
  }, [noteId, updateNote])

  const handleUndo = () => {
    if (undoStack.length <= 1) return

    const canvas = canvasRef.current
    const ctx = contextRef.current
    const container = containerRef.current

    // Save current state to redo
    setRedoStack((prev) => [...prev, canvas.toDataURL()])

    // Pop and restore previous state
    const newStack = [...undoStack]
    newStack.pop()
    const previousState = newStack[newStack.length - 1]
    setUndoStack(newStack)

    if (previousState) {
      const img = new Image()
      img.onload = () => {
        const rect = container.getBoundingClientRect()
        ctx.clearRect(0, 0, rect.width, rect.height)
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        saveDrawing()
      }
      img.src = previousState
    }
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const canvas = canvasRef.current
    const ctx = contextRef.current
    const container = containerRef.current

    // Save current state to undo
    setUndoStack((prev) => [...prev, canvas.toDataURL()])

    // Pop and restore redo state
    const newStack = [...redoStack]
    const nextState = newStack.pop()
    setRedoStack(newStack)

    if (nextState) {
      const img = new Image()
      img.onload = () => {
        const rect = container.getBoundingClientRect()
        ctx.clearRect(0, 0, rect.width, rect.height)
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        saveDrawing()
      }
      img.src = nextState
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    saveToUndoStack()
    ctx.clearRect(0, 0, rect.width, rect.height)
    saveDrawing()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ios-tertiary bg-ios-secondary overflow-x-auto">
        {/* Pen Types */}
        <div className="flex items-center gap-1">
          {Object.entries(PEN_TYPES).map(([key, pen]) => {
            const Icon = pen.icon
            return (
              <button
                key={key}
                onClick={() => {
                  setActivePen(key)
                  setPenSize(pen.defaultSize)
                }}
                className={`p-2.5 rounded-lg transition-colors ${
                  activePen === key
                    ? 'bg-ios-blue text-white'
                    : 'text-ios-secondary-label hover:bg-ios-tertiary'
                }`}
                title={pen.name}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2 px-3">
          <button
            onClick={() => setPenSize((s) => Math.max(1, s - 1))}
            className="p-1 text-ios-secondary-label hover:text-white"
          >
            <Minus size={16} />
          </button>
          <input
            type="range"
            min="1"
            max="20"
            value={penSize}
            onChange={(e) => setPenSize(Number(e.target.value))}
            className="w-20 accent-ios-blue"
          />
          <button
            onClick={() => setPenSize((s) => Math.min(20, s + 1))}
            className="p-1 text-ios-secondary-label hover:text-white"
          >
            <Plus size={16} />
          </button>
          <span className="text-xs text-ios-secondary-label w-6">{penSize}</span>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1">
          {COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => setActiveColor(color.hex)}
              className={`w-7 h-7 rounded-full transition-transform ${
                activeColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-ios-secondary scale-110' : ''
              }`}
              style={{ backgroundColor: color.hex, border: color.hex === '#FFFFFF' ? '1px solid #636366' : 'none' }}
              title={color.name}
            />
          ))}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            className="p-2.5 rounded-lg text-ios-secondary-label hover:bg-ios-tertiary disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2.5 rounded-lg text-ios-secondary-label hover:bg-ios-tertiary disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 size={20} />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Background pattern canvas */}
        <canvas
          ref={patternCanvasRef}
          className="absolute inset-0 touch-none pointer-events-none"
        />
        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="drawing-canvas absolute inset-0 touch-none"
          style={{ cursor: activePen === 'eraser' ? 'crosshair' : 'crosshair' }}
        />
      </div>
    </div>
  )
}
