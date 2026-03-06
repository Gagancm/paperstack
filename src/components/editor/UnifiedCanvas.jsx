import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { 
  Hand, Pen, Pencil, Highlighter, Eraser, Type, Image, 
  Shapes, Lasso, Undo2, Redo2, Plus, Minus, 
  ChevronDown, X, Mic,
  Circle, Square, Triangle, Minus as LineIcon, ArrowRight,
  Share2, Copy as CopyIcon
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

// ============= CONFIGURATIONS =============

// Tool definitions - matches GoodNotes toolbar order
const TOOLS = [
  { id: 'hand', name: 'Hand', icon: Hand },
  { id: 'lasso', name: 'Lasso', icon: Lasso },
  { id: 'pen', name: 'Pen', icon: Pen },
  { id: 'pencil', name: 'Pencil', icon: Pencil },
  { id: 'highlighter', name: 'Highlighter', icon: Highlighter },
  { id: 'eraser', name: 'Eraser', icon: Eraser },
  { id: 'text', name: 'Text', icon: Type },
  { id: 'shapes', name: 'Shapes', icon: Shapes },
  { id: 'image', name: 'Image', icon: Image },
  { id: 'mic', name: 'Audio', icon: Mic },
]

// Writing tool settings
const PEN_SETTINGS = {
  pen: { minPressure: 0.8, maxPressure: 1.3, opacity: 0.95, defaultSize: 2 },
  pencil: { minPressure: 0.4, maxPressure: 1.5, opacity: 0.6, defaultSize: 2 },
  highlighter: { minPressure: 1, maxPressure: 1, opacity: 0.3, defaultSize: 20 },
}

// Color palette
const COLORS = {
  basic: ['#000000', '#FFFFFF', '#636366', '#8E8E93', '#C7C7CC'],
  vivid: ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'],
  pastel: ['#FFB5B5', '#FFD9B5', '#FFF4B5', '#B5FFB5', '#B5E8FF', '#D5B5FF']
}

// Shape types
const SHAPE_TYPES = [
  { id: 'rectangle', icon: Square },
  { id: 'circle', icon: Circle },
  { id: 'triangle', icon: Triangle },
  { id: 'line', icon: LineIcon },
  { id: 'arrow', icon: ArrowRight },
]

// ============= MAIN COMPONENT =============

const UnifiedCanvas = forwardRef(function UnifiedCanvas({ noteId, paperTemplate, paperColor }, ref) {
  const canvasRef = useRef(null)
  const patternCanvasRef = useRef(null)
  const contextRef = useRef(null)
  const containerRef = useRef(null)
  
  // Tool state
  const [activeTool, setActiveTool] = useState('pen')
  const [activeColor, setActiveColor] = useState('#000000')
  const [penSize, setPenSize] = useState(2)
  const [eraserSize, setEraserSize] = useState(20)
  const [activeShape, setActiveShape] = useState('rectangle')
  
  // UI state
  const [showToolOptions, setShowToolOptions] = useState(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  // Page state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [points, setPoints] = useState([])

  const { updateNote, getSelectedNote } = useAppStore()
  const note = getSelectedNote()

  // Expose clearCanvas to parent via ref
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    const container = containerRef.current
    if (!canvas || !ctx || !container) return
    
    // Save to undo stack before clearing
    setUndoStack((prev) => [...prev.slice(-49), canvas.toDataURL()])
    setRedoStack([])
    
    const rect = container.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    if (noteId) {
      updateNote(noteId, { drawingData: canvas.toDataURL('image/png'), hasDrawing: false })
    }
  }, [noteId, updateNote])

  useImperativeHandle(ref, () => ({
    clearCanvas
  }), [clearCanvas])

  // ============= PAPER DRAWING =============
  
  const drawPaperPattern = useCallback((ctx, width, height) => {
    ctx.fillStyle = paperColor
    ctx.fillRect(0, 0, width, height)

    const isDark = paperColor === '#2C2C2E'
    const lineColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
    const dotColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)'
    const marginColor = isDark ? 'rgba(255,100,100,0.2)' : 'rgba(255,100,100,0.3)'

    ctx.strokeStyle = lineColor
    ctx.fillStyle = dotColor
    const lineSpacing = 28

    switch (paperTemplate) {
      case 'dotted':
        for (let x = 24; x < width; x += 24) {
          for (let y = 24; y < height; y += 24) {
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
      case 'grid':
        ctx.lineWidth = 0.5
        for (let x = 0; x <= width; x += 24) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y <= height; y += 24) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        break
      case 'lined':
        ctx.lineWidth = 0.5
        for (let y = 60; y < height; y += lineSpacing) {
          ctx.beginPath()
          ctx.moveTo(40, y)
          ctx.lineTo(width - 40, y)
          ctx.stroke()
        }
        break
      case 'lined-margin':
        ctx.lineWidth = 0.5
        for (let y = 60; y < height; y += lineSpacing) {
          ctx.beginPath()
          ctx.moveTo(80, y)
          ctx.lineTo(width - 40, y)
          ctx.stroke()
        }
        ctx.strokeStyle = marginColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(75, 40)
        ctx.lineTo(75, height - 40)
        ctx.stroke()
        break
      case 'cornell':
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(100, 80)
        ctx.lineTo(100, height - 150)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(40, height - 150)
        ctx.lineTo(width - 40, height - 150)
        ctx.stroke()
        ctx.lineWidth = 0.5
        for (let y = 80; y < height - 150; y += lineSpacing) {
          ctx.beginPath()
          ctx.moveTo(105, y)
          ctx.lineTo(width - 40, y)
          ctx.stroke()
        }
        break
      default:
        break
    }
  }, [paperColor, paperTemplate])

  // ============= CANVAS INITIALIZATION =============

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
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
      img.src = note.drawingData
    }

    saveToUndoStack()
  }, [noteId, drawPaperPattern])

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

    if (noteId) {
      updateNote(noteId, { paperColor, paperTemplate })
    }
  }, [paperColor, paperTemplate, drawPaperPattern, noteId, updateNote])

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
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
      img.src = dataUrl
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawPaperPattern])

  // ============= DRAWING FUNCTIONS =============

  const saveToUndoStack = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setUndoStack((prev) => [...prev.slice(-49), canvas.toDataURL()])
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
    if (e.pointerType === 'touch' && activeTool !== 'hand') return
    if (['hand', 'text', 'image', 'lasso', 'mic'].includes(activeTool)) return

    const { x, y, pressure } = getPointerPosition(e)
    setPoints([{ x, y, pressure }])
    setIsDrawing(true)

    const ctx = contextRef.current
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    if (e.pointerType === 'touch' && activeTool !== 'hand') return

    const { x, y, pressure } = getPointerPosition(e)
    const ctx = contextRef.current

    setPoints((prev) => [...prev, { x, y, pressure }])

    const settings = PEN_SETTINGS[activeTool] || PEN_SETTINGS.pen
    
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = eraserSize
      ctx.globalAlpha = 1
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'
      ctx.strokeStyle = activeColor
      ctx.lineWidth = penSize
      ctx.globalAlpha = settings.opacity
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = activeColor
      const pressureMultiplier = settings.minPressure + (settings.maxPressure - settings.minPressure) * pressure
      ctx.lineWidth = penSize * pressureMultiplier
      ctx.globalAlpha = settings.opacity
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
    updateNote(noteId, { drawingData: canvas.toDataURL('image/png'), hasDrawing: true })
  }, [noteId, updateNote])

  const handleUndo = () => {
    if (undoStack.length <= 1) return
    const canvas = canvasRef.current
    const ctx = contextRef.current
    const container = containerRef.current

    setRedoStack((prev) => [...prev, canvas.toDataURL()])
    const newStack = [...undoStack]
    newStack.pop()
    setUndoStack(newStack)

    const img = new window.Image()
    img.onload = () => {
      const rect = container.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      ctx.drawImage(img, 0, 0, rect.width, rect.height)
      saveDrawing()
    }
    img.src = newStack[newStack.length - 1]
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

    const img = new window.Image()
    img.onload = () => {
      const rect = container.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      ctx.drawImage(img, 0, 0, rect.width, rect.height)
      saveDrawing()
    }
    img.src = nextState
  }

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId)
    if (['pen', 'pencil', 'highlighter', 'eraser', 'shapes'].includes(toolId)) {
      setShowToolOptions(showToolOptions === toolId ? null : toolId)
    } else {
      setShowToolOptions(null)
    }
    setShowColorPicker(false)
    
    if (toolId === 'highlighter') setPenSize(20)
    else if (toolId === 'pen') setPenSize(2)
    else if (toolId === 'pencil') setPenSize(2)
  }

  const getCursor = () => {
    if (activeTool === 'hand') return 'grab'
    if (activeTool === 'text') return 'text'
    return 'crosshair'
  }

  // ============= RENDER =============

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1C1C1E]">
      {/* Top Toolbar - Compact like GoodNotes */}
      <div className="bg-[#2C2C2E] border-b border-[#3A3A3C] h-11 flex items-center px-3">
        {/* Left Section: Undo/Redo */}
        <div className="flex items-center gap-0.5 min-w-[80px]">
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C] disabled:opacity-30"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C] disabled:opacity-30"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Center Section: Main Tools */}
        <div className="flex-1 flex items-center justify-center gap-0.5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`p-1.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#0A84FF] text-white' 
                    : 'text-[#8E8E93] hover:bg-[#3A3A3C] hover:text-white'
                }`}
                title={tool.name}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-0.5 min-w-[80px] justify-end">
          <button className="p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C]" title="Add Page">
            <Plus size={18} />
          </button>
          <button className="p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C]" title="Share">
            <Share2 size={18} />
          </button>
          <button className="p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C]" title="Duplicate">
            <CopyIcon size={18} />
          </button>
        </div>
      </div>

      {/* Active Tool Options Bar - Compact */}
      {showToolOptions && (
        <div className="bg-[#2C2C2E] border-b border-[#3A3A3C] h-10 flex items-center justify-center px-3">
          <div className="flex items-center gap-3">
            {/* Pen/Pencil/Highlighter options */}
            {['pen', 'pencil', 'highlighter'].includes(showToolOptions) && (
              <>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3A3A3C] text-white text-xs">
                  <span>Standard</span>
                  <ChevronDown size={10} />
                </button>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setPenSize(s => Math.max(1, s - 1))}
                    className="w-6 h-6 rounded-full bg-[#3A3A3C] text-white flex items-center justify-center"
                  >
                    <Minus size={12} />
                  </button>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-7 h-7 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: activeColor }}
                  />
                  <button 
                    onClick={() => setPenSize(s => Math.min(50, s + 1))}
                    className="w-6 h-6 rounded-full bg-[#3A3A3C] text-white flex items-center justify-center"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="w-16 h-6 rounded-md overflow-hidden border border-[#3A3A3C]">
                  <div 
                    className="w-full h-full"
                    style={{
                      background: `repeating-linear-gradient(45deg, ${activeColor}, ${activeColor} 2px, transparent 2px, transparent 6px)`
                    }}
                  />
                </div>
              </>
            )}

            {showToolOptions === 'eraser' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93]">Size</span>
                <button 
                  onClick={() => setEraserSize(s => Math.max(5, s - 5))}
                  className="w-6 h-6 rounded-full bg-[#3A3A3C] text-white flex items-center justify-center"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={eraserSize}
                  onChange={(e) => setEraserSize(Number(e.target.value))}
                  className="w-24"
                />
                <button 
                  onClick={() => setEraserSize(s => Math.min(60, s + 5))}
                  className="w-6 h-6 rounded-full bg-[#3A3A3C] text-white flex items-center justify-center"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}

            {showToolOptions === 'shapes' && (
              <div className="flex items-center gap-1">
                {SHAPE_TYPES.map((shape) => {
                  const Icon = shape.icon
                  return (
                    <button
                      key={shape.id}
                      onClick={() => setActiveShape(shape.id)}
                      className={`p-1.5 rounded-md ${
                        activeShape === shape.id ? 'bg-[#0A84FF] text-white' : 'bg-[#3A3A3C] text-[#8E8E93]'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color Picker Dropdown */}
      {showColorPicker && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2C2C2E] rounded-xl shadow-xl border border-[#3A3A3C] overflow-hidden w-56">
          {/* Header */}
          <div className="py-2 text-center border-b border-[#3A3A3C]">
            <span className="text-white font-medium text-[15px]">Color</span>
          </div>
          
          <div className="p-1.5">
            {/* Basic Colors */}
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Basic</p>
            <div className="bg-[#1C1C1E] rounded-lg p-2.5 mb-1.5">
              <div className="flex gap-2 justify-center">
                {COLORS.basic.map(color => (
                  <button
                    key={color}
                    onClick={() => { setActiveColor(color); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-transform ${activeColor === color ? 'ring-2 ring-[#0A84FF] scale-110' : ''}`}
                    style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #636366' : 'none' }}
                  />
                ))}
              </div>
            </div>
            
            {/* Vivid Colors */}
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Vivid</p>
            <div className="bg-[#1C1C1E] rounded-lg p-2.5 mb-1.5">
              <div className="flex gap-2 flex-wrap justify-center">
                {COLORS.vivid.map(color => (
                  <button
                    key={color}
                    onClick={() => { setActiveColor(color); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-transform ${activeColor === color ? 'ring-2 ring-[#0A84FF] scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Pastel Colors */}
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Pastel</p>
            <div className="bg-[#1C1C1E] rounded-lg p-2.5">
              <div className="flex gap-2 justify-center">
                {COLORS.pastel.map(color => (
                  <button
                    key={color}
                    onClick={() => { setActiveColor(color); setShowColorPicker(false) }}
                    className={`w-7 h-7 rounded-full transition-transform ${activeColor === color ? 'ring-2 ring-[#0A84FF] scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Area - Full Width */}
      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-auto"
        onClick={() => { setShowColorPicker(false) }}
      >
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
          className="absolute inset-0 touch-none"
          style={{ cursor: getCursor() }}
        />
      </div>

      {/* Bottom Bar - Page Number Only - Compact */}
      <div className="bg-[#2C2C2E] border-t border-[#3A3A3C] h-8 flex items-center justify-center">
        <span className="text-xs text-[#8E8E93]">
          {currentPage} of {totalPages}
        </span>
      </div>

    </div>
  )
})

export default UnifiedCanvas
