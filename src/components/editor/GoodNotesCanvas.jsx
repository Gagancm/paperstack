import { useRef, useEffect, useState, useCallback } from 'react'
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  Undo2, 
  Redo2,
  Minus,
  Plus,
  Circle,
  Square,
  Triangle,
  Type,
  Image,
  Layers,
  Grid3X3,
  Palette,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Move,
  Scissors,
  RotateCcw,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

// Tool categories
const TOOL_CATEGORIES = {
  select: { id: 'select', name: 'Select', icon: Move },
  pen: { id: 'pen', name: 'Pen', icon: Pen },
  highlighter: { id: 'highlighter', name: 'Highlighter', icon: Highlighter },
  eraser: { id: 'eraser', name: 'Eraser', icon: Eraser },
  shapes: { id: 'shapes', name: 'Shapes', icon: Square },
  text: { id: 'text', name: 'Text', icon: Type },
  image: { id: 'image', name: 'Image', icon: Image },
  lasso: { id: 'lasso', name: 'Lasso', icon: Scissors },
}

// Pen styles
const PEN_STYLES = [
  { id: 'ballpoint', name: 'Ballpoint', pressure: { min: 0.8, max: 1.2 }, opacity: 0.95, smoothing: 0.3 },
  { id: 'fountain', name: 'Fountain', pressure: { min: 0.3, max: 2.0 }, opacity: 0.9, smoothing: 0.5 },
  { id: 'brush', name: 'Brush', pressure: { min: 0.1, max: 3.0 }, opacity: 0.85, smoothing: 0.7 },
  { id: 'pencil', name: 'Pencil', pressure: { min: 0.5, max: 1.5 }, opacity: 0.6, smoothing: 0.2 },
  { id: 'marker', name: 'Marker', pressure: { min: 0.9, max: 1.1 }, opacity: 0.9, smoothing: 0.4 },
]

// Highlighter styles
const HIGHLIGHTER_STYLES = [
  { id: 'standard', name: 'Standard', opacity: 0.3, width: 15 },
  { id: 'soft', name: 'Soft', opacity: 0.2, width: 20 },
  { id: 'bold', name: 'Bold', opacity: 0.4, width: 12 },
]

// Color palette - organized by category
const COLOR_PALETTE = {
  basic: [
    { name: 'Black', hex: '#000000' },
    { name: 'Dark Gray', hex: '#636366' },
    { name: 'Gray', hex: '#8E8E93' },
    { name: 'Light Gray', hex: '#C7C7CC' },
    { name: 'White', hex: '#FFFFFF' },
  ],
  vivid: [
    { name: 'Red', hex: '#FF3B30' },
    { name: 'Orange', hex: '#FF9500' },
    { name: 'Yellow', hex: '#FFCC00' },
    { name: 'Green', hex: '#34C759' },
    { name: 'Teal', hex: '#5AC8FA' },
    { name: 'Blue', hex: '#007AFF' },
    { name: 'Indigo', hex: '#5856D6' },
    { name: 'Purple', hex: '#AF52DE' },
    { name: 'Pink', hex: '#FF2D55' },
  ],
  pastel: [
    { name: 'Pastel Red', hex: '#FFB5B5' },
    { name: 'Pastel Orange', hex: '#FFD9B5' },
    { name: 'Pastel Yellow', hex: '#FFF4B5' },
    { name: 'Pastel Green', hex: '#B5FFB5' },
    { name: 'Pastel Blue', hex: '#B5D9FF' },
    { name: 'Pastel Purple', hex: '#E0B5FF' },
  ],
}

// Paper templates
const PAPER_TEMPLATES = [
  { id: 'blank', name: 'Blank', icon: '📄' },
  { id: 'dotted', name: 'Dotted', icon: '⋯' },
  { id: 'squared', name: 'Grid', icon: '▦' },
  { id: 'ruled-narrow', name: 'Lined', icon: '≡' },
  { id: 'ruled-wide', name: 'Wide Ruled', icon: '☰' },
  { id: 'cornell', name: 'Cornell', icon: '📋' },
]

// Paper colors
const PAPER_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Cream', hex: '#FFF8E7' },
  { name: 'Yellow', hex: '#FFFDE7' },
  { name: 'Green', hex: '#E8F5E9' },
  { name: 'Blue', hex: '#E3F2FD' },
  { name: 'Dark', hex: '#1C1C1E' },
  { name: 'Sepia', hex: '#F5E6D3' },
  { name: 'Rose', hex: '#FCE4EC' },
]

// Shape types
const SHAPE_TYPES = [
  { id: 'rectangle', name: 'Rectangle', icon: Square },
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
  { id: 'line', name: 'Line', icon: Minus },
  { id: 'arrow', name: 'Arrow', icon: ChevronUp },
]

export default function GoodNotesCanvas({ noteId }) {
  const canvasRef = useRef(null)
  const patternCanvasRef = useRef(null)
  const contextRef = useRef(null)
  const containerRef = useRef(null)
  
  // Tool state
  const [activeTool, setActiveTool] = useState('pen')
  const [activeColor, setActiveColor] = useState('#000000')
  const [penStyle, setPenStyle] = useState('ballpoint')
  const [highlighterStyle, setHighlighterStyle] = useState('standard')
  const [penSize, setPenSize] = useState(3)
  const [eraserSize, setEraserSize] = useState(15)
  const [activeShape, setActiveShape] = useState('rectangle')
  
  // UI state
  const [showToolMenu, setShowToolMenu] = useState(null) // Which tool menu is open
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showPaperOptions, setShowPaperOptions] = useState(false)
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [points, setPoints] = useState([])

  const { updateNote, getSelectedNote } = useAppStore()
  const note = getSelectedNote()
  
  const [paperColor, setPaperColor] = useState(note?.paperColor || '#FFFFFF')
  const [paperTemplate, setPaperTemplate] = useState(note?.paperTemplate || 'blank')

  // Get current pen/highlighter settings
  const getCurrentPenSettings = () => {
    if (activeTool === 'highlighter') {
      const style = HIGHLIGHTER_STYLES.find(s => s.id === highlighterStyle)
      return { ...style, size: style.width }
    }
    const style = PEN_STYLES.find(s => s.id === penStyle)
    return { ...style, size: penSize }
  }

  // Draw paper pattern
  const drawPaperPattern = useCallback((ctx, width, height) => {
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
      case 'cornell':
        ctx.lineWidth = 1
        // Left margin
        ctx.beginPath()
        ctx.moveTo(80, 0)
        ctx.lineTo(80, height - 120)
        ctx.stroke()
        // Bottom section
        ctx.beginPath()
        ctx.moveTo(0, height - 120)
        ctx.lineTo(width, height - 120)
        ctx.stroke()
        // Horizontal lines in main area
        ctx.lineWidth = 0.5
        for (let y = 30; y < height - 120; y += 24) {
          ctx.beginPath()
          ctx.moveTo(80, y)
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

    patternCanvas.width = rect.width * dpr
    patternCanvas.height = rect.height * dpr
    patternCanvas.style.width = `${rect.width}px`
    patternCanvas.style.height = `${rect.height}px`
    const patternCtx = patternCanvas.getContext('2d')
    patternCtx.scale(dpr, dpr)
    drawPaperPattern(patternCtx, rect.width, rect.height)

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    contextRef.current = ctx

    if (note?.drawingData) {
      const img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = note.drawingData
    }

    saveToUndoStack()
  }, [noteId, drawPaperPattern])

  // Update paper when template or color changes
  useEffect(() => {
    const patternCanvas = patternCanvasRef.current
    const container = containerRef.current
    if (!patternCanvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const patternCtx = patternCanvas.getContext('2d')
    patternCtx.setTransform(1, 0, 0, 1, 0, 0)
    patternCtx.scale(dpr, dpr)
    drawPaperPattern(patternCtx, rect.width, rect.height)

    // Save paper settings to note
    if (noteId) {
      updateNote(noteId, { paperColor, paperTemplate })
    }
  }, [paperColor, paperTemplate, drawPaperPattern, noteId, updateNote])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const patternCanvas = patternCanvasRef.current
      const container = containerRef.current
      if (!canvas || !patternCanvas || !container) return

      const dataUrl = canvas.toDataURL()
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      patternCanvas.width = rect.width * dpr
      patternCanvas.height = rect.height * dpr
      patternCanvas.style.width = `${rect.width}px`
      patternCanvas.style.height = `${rect.height}px`
      const patternCtx = patternCanvas.getContext('2d')
      patternCtx.scale(dpr, dpr)
      drawPaperPattern(patternCtx, rect.width, rect.height)

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      contextRef.current = ctx

      const img = new window.Image()
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
    if (e.pointerType === 'touch') return
    if (activeTool === 'select' || activeTool === 'text' || activeTool === 'image' || activeTool === 'lasso') return

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
    const settings = getCurrentPenSettings()

    setPoints((prev) => [...prev, { x, y, pressure }])

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = eraserSize
      ctx.globalAlpha = 1
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'
      ctx.strokeStyle = activeColor
      ctx.lineWidth = settings.size
      ctx.globalAlpha = settings.opacity
    } else if (activeTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = activeColor
      const pressureMultiplier = settings.pressure.min + (settings.pressure.max - settings.pressure.min) * pressure
      ctx.lineWidth = penSize * pressureMultiplier
      ctx.globalAlpha = settings.opacity
    } else if (activeTool === 'shapes') {
      // Handle shapes differently
      return
    }

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

    saveToUndoStack()
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

    setRedoStack((prev) => [...prev, canvas.toDataURL()])

    const newStack = [...undoStack]
    newStack.pop()
    const previousState = newStack[newStack.length - 1]
    setUndoStack(newStack)

    if (previousState) {
      const img = new window.Image()
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

    setUndoStack((prev) => [...prev, canvas.toDataURL()])

    const newStack = [...redoStack]
    const nextState = newStack.pop()
    setRedoStack(newStack)

    if (nextState) {
      const img = new window.Image()
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

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId)
    // Toggle menu for tools with options
    if (['pen', 'highlighter', 'eraser', 'shapes'].includes(toolId)) {
      setShowToolMenu(showToolMenu === toolId ? null : toolId)
    } else {
      setShowToolMenu(null)
    }
    setShowColorPicker(false)
    setShowPaperOptions(false)
  }

  // Close all menus when clicking outside
  const closeAllMenus = () => {
    setShowToolMenu(null)
    setShowColorPicker(false)
    setShowPaperOptions(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#1C1C1E]">
      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" onClick={closeAllMenus}>
        <canvas
          ref={patternCanvasRef}
          className="absolute inset-0 touch-none pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="drawing-canvas absolute inset-0 touch-none"
          style={{ cursor: activeTool === 'eraser' ? 'crosshair' : 'crosshair' }}
        />
      </div>

      {/* Active Tool Menu - Appears above toolbar */}
      {showToolMenu && (
        <div className="bg-[#2C2C2E] border-t border-[#3A3A3C] px-4 py-3">
          {/* Pen Options */}
          {showToolMenu === 'pen' && (
            <div className="flex flex-col gap-3">
              {/* Pen Styles */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93] w-16">Style</span>
                <div className="flex gap-1">
                  {PEN_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setPenStyle(style.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        penStyle === style.id
                          ? 'bg-[#0A84FF] text-white'
                          : 'bg-[#3A3A3C] text-[#8E8E93] hover:bg-[#48484A]'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Pen Size */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93] w-16">Size</span>
                <button onClick={() => setPenSize((s) => Math.max(1, s - 1))} className="p-1.5 rounded-lg bg-[#3A3A3C] text-white">
                  <Minus size={14} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={penSize}
                  onChange={(e) => setPenSize(Number(e.target.value))}
                  className="flex-1 accent-[#0A84FF]"
                />
                <button onClick={() => setPenSize((s) => Math.min(20, s + 1))} className="p-1.5 rounded-lg bg-[#3A3A3C] text-white">
                  <Plus size={14} />
                </button>
                <span className="text-xs text-white w-6 text-center">{penSize}</span>
              </div>
              {/* Size Preview */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93] w-16">Preview</span>
                <div className="flex-1 flex items-center justify-center py-2">
                  <div
                    className="rounded-full"
                    style={{
                      width: penSize * 2,
                      height: penSize * 2,
                      backgroundColor: activeColor,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Highlighter Options */}
          {showToolMenu === 'highlighter' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93] w-16">Style</span>
                <div className="flex gap-1">
                  {HIGHLIGHTER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setHighlighterStyle(style.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        highlighterStyle === style.id
                          ? 'bg-[#0A84FF] text-white'
                          : 'bg-[#3A3A3C] text-[#8E8E93] hover:bg-[#48484A]'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Eraser Options */}
          {showToolMenu === 'eraser' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Size</span>
              <button onClick={() => setEraserSize((s) => Math.max(5, s - 5))} className="p-1.5 rounded-lg bg-[#3A3A3C] text-white">
                <Minus size={14} />
              </button>
              <input
                type="range"
                min="5"
                max="50"
                value={eraserSize}
                onChange={(e) => setEraserSize(Number(e.target.value))}
                className="flex-1 accent-[#0A84FF]"
              />
              <button onClick={() => setEraserSize((s) => Math.min(50, s + 5))} className="p-1.5 rounded-lg bg-[#3A3A3C] text-white">
                <Plus size={14} />
              </button>
              <span className="text-xs text-white w-8 text-center">{eraserSize}</span>
            </div>
          )}

          {/* Shapes Options */}
          {showToolMenu === 'shapes' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Shape</span>
              <div className="flex gap-1">
                {SHAPE_TYPES.map((shape) => {
                  const Icon = shape.icon
                  return (
                    <button
                      key={shape.id}
                      onClick={() => setActiveShape(shape.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        activeShape === shape.id
                          ? 'bg-[#0A84FF] text-white'
                          : 'bg-[#3A3A3C] text-[#8E8E93] hover:bg-[#48484A]'
                      }`}
                    >
                      <Icon size={18} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Color Picker Panel */}
      {showColorPicker && (
        <div className="bg-[#2C2C2E] border-t border-[#3A3A3C] px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Basic colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Basic</span>
              <div className="flex gap-1.5">
                {COLOR_PALETTE.basic.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => { setActiveColor(color.hex); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      activeColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2C2C2E] scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.hex, border: color.hex === '#FFFFFF' ? '1px solid #636366' : 'none' }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            {/* Vivid colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Vivid</span>
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_PALETTE.vivid.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => { setActiveColor(color.hex); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      activeColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2C2C2E] scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            {/* Pastel colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Pastel</span>
              <div className="flex gap-1.5">
                {COLOR_PALETTE.pastel.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => { setActiveColor(color.hex); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      activeColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2C2C2E] scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paper Options Panel */}
      {showPaperOptions && (
        <div className="bg-[#2C2C2E] border-t border-[#3A3A3C] px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Paper Templates */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Template</span>
              <div className="flex gap-1.5 flex-wrap">
                {PAPER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPaperTemplate(template.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                      paperTemplate === template.id
                        ? 'bg-[#0A84FF] text-white'
                        : 'bg-[#3A3A3C] text-[#8E8E93] hover:bg-[#48484A]'
                    }`}
                  >
                    <span>{template.icon}</span>
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Paper Colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Color</span>
              <div className="flex gap-1.5">
                {PAPER_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setPaperColor(color.hex)}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      paperColor === color.hex ? 'ring-2 ring-[#0A84FF] ring-offset-2 ring-offset-[#2C2C2E] scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.hex, border: '1px solid #3A3A3C' }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            {/* Clear Canvas */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E93] w-16">Actions</span>
              <button
                onClick={clearCanvas}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#FF453A]/20 text-[#FF453A] hover:bg-[#FF453A]/30 flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Clear Canvas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="bg-[#2C2C2E] border-t border-[#3A3A3C] px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-between">
          {/* Left: Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-2.5 rounded-xl text-white hover:bg-[#3A3A3C] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2.5 rounded-xl text-white hover:bg-[#3A3A3C] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Redo2 size={20} />
            </button>
          </div>

          {/* Center: Main Tools */}
          <div className="flex items-center gap-1 bg-[#1C1C1E] rounded-2xl p-1">
            {/* Lasso/Select */}
            <button
              onClick={() => handleToolSelect('lasso')}
              className={`p-2.5 rounded-xl transition-colors ${
                activeTool === 'lasso' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Scissors size={20} />
            </button>

            {/* Pen */}
            <button
              onClick={() => handleToolSelect('pen')}
              className={`p-2.5 rounded-xl transition-colors relative ${
                activeTool === 'pen' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Pen size={20} />
              {activeTool === 'pen' && showToolMenu === 'pen' && (
                <ChevronUp size={10} className="absolute -top-0.5 right-0.5" />
              )}
            </button>

            {/* Highlighter */}
            <button
              onClick={() => handleToolSelect('highlighter')}
              className={`p-2.5 rounded-xl transition-colors ${
                activeTool === 'highlighter' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Highlighter size={20} />
            </button>

            {/* Eraser */}
            <button
              onClick={() => handleToolSelect('eraser')}
              className={`p-2.5 rounded-xl transition-colors ${
                activeTool === 'eraser' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Eraser size={20} />
            </button>

            {/* Shapes */}
            <button
              onClick={() => handleToolSelect('shapes')}
              className={`p-2.5 rounded-xl transition-colors ${
                activeTool === 'shapes' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Layers size={20} />
            </button>

            {/* Text */}
            <button
              onClick={() => handleToolSelect('text')}
              className={`p-2.5 rounded-xl transition-colors ${
                activeTool === 'text' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Type size={20} />
            </button>

            {/* Image */}
            <button
              onClick={() => handleToolSelect('image')}
              className={`p-2.5 rounded-xl transition-colors ${
                activeTool === 'image' ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Image size={20} />
            </button>
          </div>

          {/* Right: Color & Paper */}
          <div className="flex items-center gap-1">
            {/* Active Color */}
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker)
                setShowToolMenu(null)
                setShowPaperOptions(false)
              }}
              className={`p-1.5 rounded-xl hover:bg-[#3A3A3C] ${showColorPicker ? 'bg-[#3A3A3C]' : ''}`}
            >
              <div
                className="w-7 h-7 rounded-full border-2 border-white/30"
                style={{ backgroundColor: activeColor }}
              />
            </button>

            {/* Paper Options */}
            <button
              onClick={() => {
                setShowPaperOptions(!showPaperOptions)
                setShowToolMenu(null)
                setShowColorPicker(false)
              }}
              className={`p-2.5 rounded-xl text-white hover:bg-[#3A3A3C] ${showPaperOptions ? 'bg-[#3A3A3C]' : ''}`}
            >
              <Grid3X3 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
