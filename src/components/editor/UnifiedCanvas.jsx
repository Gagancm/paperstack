import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { 
  Hand, Pen, Pencil, Highlighter, Eraser, Type, Image, 
  Shapes, Lasso, Undo2, Redo2, Plus, Minus, 
  ChevronDown, X, Mic, Search, Clock, Ruler, ZoomIn,
  Circle, Square, Triangle, Minus as LineIcon, ArrowRight, Diamond,
  Share2, Copy as CopyIcon, PanelLeft, FileText,
  Camera, Smile, Upload, Printer, Monitor, Layout, Download,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Pin,
  ScanLine, ImagePlus, FolderOpen, Link2, MessageSquare,
  Bookmark, Check, Settings, RotateCcw
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

// ============= CONFIGURATIONS =============

// Tool definitions - matches GoodNotes toolbar order
const MAIN_TOOLS = [
  { id: 'lasso', name: 'Lasso', icon: Lasso },
  { id: 'pen', name: 'Pen', icon: Pen },
  { id: 'eraser', name: 'Eraser', icon: Eraser },
  { id: 'text', name: 'Text', icon: Type },
  { id: 'elements', name: 'Elements', icon: Smile },
  { id: 'image', name: 'Image', icon: Image },
  { id: 'shapes', name: 'Shapes', icon: Shapes },
  { id: 'comment', name: 'Comment', icon: MessageSquare },
  { id: 'link', name: 'Link', icon: Link2 },
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
  { id: 'freeform', icon: Lasso },
  { id: 'connector1', icon: ArrowRight },
  { id: 'connector2', icon: Share2 },
  { id: 'rectangle', icon: Square },
  { id: 'circle', icon: Circle },
  { id: 'triangle', icon: Triangle },
  { id: 'diamond', icon: Diamond },
  { id: 'line', icon: LineIcon },
]

// Pen stroke sizes
const PEN_STROKE_SIZES = [
  { id: 'thin', width: 1 },
  { id: 'medium', width: 2 },
  { id: 'thick', width: 4 },
]

// Pen colors for quick access
const PEN_QUICK_COLORS = ['#FF3B30', '#007AFF', '#000000']

// Font options
const FONTS = ['Modern', 'Classic', 'Handwritten', 'Mono']
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64]

// ============= MAIN COMPONENT =============

const UnifiedCanvas = forwardRef(function UnifiedCanvas({ noteId, paperTemplate, paperColor, onPaperTemplateChange, onPaperColorChange }, ref) {
  const canvasRef = useRef(null)
  const patternCanvasRef = useRef(null)
  const contextRef = useRef(null)
  const containerRef = useRef(null)
  const toolbarRef = useRef(null)
  
  // Tool state
  const [activeTool, setActiveTool] = useState('pen')
  const [activeColor, setActiveColor] = useState('#000000')
  const [penSize, setPenSize] = useState(2)
  const [eraserSize, setEraserSize] = useState(20)
  const [activeShape, setActiveShape] = useState('rectangle')
  
  // UI state - Panels/Dropdowns
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showPagesPanel, setShowPagesPanel] = useState(false)
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const [showAccessoriesMenu, setShowAccessoriesMenu] = useState(false)
  const [showAddPageMenu, setShowAddPageMenu] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showElementsPanel, setShowElementsPanel] = useState(false)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)
  
  // Text tool state
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Modern')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [textAlign, setTextAlign] = useState('left')
  const [pinTextTool, setPinTextTool] = useState(false)
  
  // Page state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(2)
  const [pages, setPages] = useState([
    { id: 1, thumbnail: null, isCover: true },
    { id: 2, thumbnail: null, isCover: false },
  ])
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [points, setPoints] = useState([])

  const { updateNote, getSelectedNote, addToast } = useAppStore()
  const note = getSelectedNote()

  // Expose clearCanvas to parent via ref
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    const container = containerRef.current
    if (!canvas || !ctx || !container) return
    
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

  // Close all dropdown menus
  const closeAllMenus = () => {
    setShowAccessoriesMenu(false)
    setShowAddPageMenu(false)
    setShowShareMenu(false)
    setShowElementsPanel(false)
    setShowImageMenu(false)
    setShowColorPicker(false)
    setShowPageSettings(false)
  }

  // Check if tool options bar should show (only for drawing tools)
  const showToolOptionsBar = ['pen', 'pencil', 'highlighter', 'eraser', 'shapes', 'text'].includes(activeTool)

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
    if (['hand', 'text', 'image', 'lasso', 'elements', 'comment', 'link'].includes(activeTool)) return

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
    closeAllMenus()
    
    // If clicking the same tool, deselect it (hide floating panel)
    if (activeTool === toolId) {
      setActiveTool(null)
      return
    }
    
    setActiveTool(toolId)
    
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1C1C1E] relative">
      {/* Toolbar Container - scrolls horizontally on narrow screens (iPad portrait / mobile) */}
      <div ref={toolbarRef} className="relative z-20 shrink-0">
        {/* Top Toolbar - responsive height and padding for iPad/mobile */}
        <div className="bg-[#2C2C2E] border-b border-[#3A3A3C] min-h-[44px] h-11 flex items-center px-2 sm:px-3 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Left Section: Pages, Search, Undo/Redo */}
          <div className="flex items-center gap-0.5 w-20 sm:w-[100px] shrink-0">
            {/* Pages Panel Toggle */}
            <button
              onClick={() => { closeAllMenus(); setShowPagesPanel(!showPagesPanel) }}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                showPagesPanel ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
              title="Pages"
            >
              <PanelLeft size={18} />
            </button>
            
            {/* Search */}
            <button
              onClick={() => { closeAllMenus(); setShowSearchPanel(!showSearchPanel) }}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                showSearchPanel ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
              title="Search"
            >
              <Search size={18} />
            </button>

            <div className="w-px h-5 bg-[#3A3A3C] mx-0.5 sm:mx-1 shrink-0" />

            {/* Undo/Redo */}
            <button
              onClick={handleUndo}
              disabled={undoStack.length <= 1}
              className="p-2 sm:p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C] disabled:opacity-30 min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 sm:p-1.5 rounded-lg text-[#8E8E93] hover:bg-[#3A3A3C] disabled:opacity-30 min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
          </div>

          {/* Center Section: Main Tools - scrollable on narrow screens */}
          <div className="flex-1 flex items-center justify-center gap-0.5 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MAIN_TOOLS.map((tool) => {
              const Icon = tool.icon
              const isActive = activeTool === tool.id
              
              if (tool.id === 'elements') {
                return (
                  <button
                    key={tool.id}
                    onClick={() => { 
                      if (showElementsPanel) {
                        // Already showing, close it
                        setShowElementsPanel(false)
                        setActiveTool(null)
                      } else {
                        closeAllMenus()
                        setActiveTool('elements')
                        setShowElementsPanel(true) 
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      showElementsPanel ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
                    }`}
                    title={tool.name}
                  >
                    <Icon size={18} />
                  </button>
                )
              }
              if (tool.id === 'image') {
                return (
                  <button
                    key={tool.id}
                    onClick={() => { 
                      if (showImageMenu) {
                        // Already showing, close it
                        setShowImageMenu(false)
                        setActiveTool(null)
                      } else {
                        closeAllMenus()
                        setActiveTool('image')
                        setShowImageMenu(true) 
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      showImageMenu ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
                    }`}
                    title={tool.name}
                  >
                    <Icon size={18} />
                  </button>
                )
              }
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

            {/* Accessories Menu - part of center section */}
            <button
              onClick={() => { closeAllMenus(); setShowAccessoriesMenu(!showAccessoriesMenu) }}
              className={`p-1.5 rounded-lg transition-all relative ${
                showAccessoriesMenu ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
              title="Accessories"
            >
              <Mic size={18} />
              <ChevronDown size={10} className="absolute -bottom-0.5 -right-0.5" />
            </button>
          </div>

          {/* Right Section: Add Page, Share, Page Settings */}
          <div className="flex items-center gap-0.5 w-20 sm:w-[100px] justify-end shrink-0">
            <button
              onClick={() => { closeAllMenus(); setShowAddPageMenu(!showAddPageMenu) }}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                showAddPageMenu ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
              title="Add Page"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => { closeAllMenus(); setShowShareMenu(!showShareMenu) }}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                showShareMenu ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
              title="Share"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={() => { closeAllMenus(); setShowPageSettings(!showPageSettings) }}
              className={`p-2 sm:p-1.5 rounded-lg transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                showPageSettings ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
              title="Page Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

      </div>

      {/* Floating Pen Tool Options - responsive top for safe area / toolbar height */}
      {(activeTool === 'pen' || activeTool === 'pencil' || activeTool === 'highlighter') && (
        <div className="absolute top-12 sm:top-[52px] left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-2rem)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 bg-[#1C1C1E] rounded-full px-3 py-2 shadow-lg border border-[#3A3A3C]">
              {/* Undo in sub-bar */}
              <button
                onClick={handleUndo}
                disabled={undoStack.length <= 1}
                className="p-1 rounded-md text-[#8E8E93] hover:bg-[#3A3A3C] disabled:opacity-30"
              >
                <Undo2 size={16} />
              </button>

              <div className="w-px h-5 bg-[#3A3A3C]" />

              {/* Pen type selector */}
              <button 
                onClick={() => setActiveTool('pen')}
                className={`p-1.5 rounded-md ${activeTool === 'pen' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <Pen size={16} />
              </button>
              <button 
                onClick={() => setActiveTool('highlighter')}
                className={`p-1.5 rounded-md ${activeTool === 'highlighter' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <Highlighter size={16} />
              </button>
              <button 
                onClick={() => setActiveTool('pencil')}
                className={`p-1.5 rounded-md ${activeTool === 'pencil' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <Pencil size={16} />
              </button>
              <div className="w-px h-5 bg-[#3A3A3C]" />

              {/* Stroke sizes */}
              {PEN_STROKE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setPenSize(size.width)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    penSize === size.width ? 'bg-[#3A3A3C]' : 'hover:bg-[#3A3A3C]'
                  }`}
                >
                  <div 
                    className="rounded-full bg-white"
                    style={{ 
                      width: size.width * 2 + 2,
                      height: size.width * 2 + 2
                    }}
                  />
                </button>
              ))}

              <div className="w-px h-5 bg-[#3A3A3C]" />

              {/* Quick colors */}
              {PEN_QUICK_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    activeColor === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}

            {/* Color picker trigger */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center"
            >
              <Plus size={12} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Text Tool Options */}
      {activeTool === 'text' && (
        <div className="absolute top-12 sm:top-[52px] left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-2rem)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 bg-[#1C1C1E] rounded-full px-3 py-2 shadow-lg border border-[#3A3A3C]">
              {/* Color picker */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-6 h-6 rounded-full border-2 border-white/30"
                style={{ backgroundColor: activeColor }}
              />

              {/* Font size */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-[#3A3A3C] text-white text-sm rounded-md px-2 py-1 border-none outline-none"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              {/* Font family */}
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-[#3A3A3C] text-white text-sm rounded-md px-2 py-1 border-none outline-none"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>

              <div className="w-px h-5 bg-[#3A3A3C]" />

              {/* Bold / Italic */}
              <button
                onClick={() => setIsBold(!isBold)}
                className={`p-1.5 rounded-md ${isBold ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                className={`p-1.5 rounded-md ${isItalic ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <Italic size={16} />
              </button>

              <div className="w-px h-5 bg-[#3A3A3C]" />

              {/* Alignment */}
              <button
                onClick={() => setTextAlign('left')}
                className={`p-1.5 rounded-md ${textAlign === 'left' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-1.5 rounded-md ${textAlign === 'center' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-1.5 rounded-md ${textAlign === 'right' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
              >
                <AlignRight size={16} />
              </button>

              <div className="w-px h-5 bg-[#3A3A3C]" />

            {/* Text box / Pin text tool */}
            <button className="p-1.5 rounded-full text-[#8E8E93] hover:bg-[#3A3A3C]">
              <Square size={16} />
            </button>
            <button
              onClick={() => setPinTextTool(!pinTextTool)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                pinTextTool ? 'bg-[#0A84FF] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
              }`}
            >
              <Pin size={14} />
              <span className="text-xs">Pin Text Tool</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Shapes Tool Options */}
      {activeTool === 'shapes' && (
        <div className="absolute top-12 sm:top-[52px] left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-2rem)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1 bg-[#1C1C1E] rounded-full px-3 py-2 shadow-lg border border-[#3A3A3C]">
              {SHAPE_TYPES.map((shape) => {
                const Icon = shape.icon
                return (
                  <button
                    key={shape.id}
                    onClick={() => setActiveShape(shape.id)}
                    className={`p-1.5 rounded-md ${
                      activeShape === shape.id ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C]'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}

              <div className="w-px h-5 bg-[#3A3A3C] mx-1" />

            {/* Fill color */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-6 h-6 rounded-full border-2 border-white/30"
              style={{ backgroundColor: activeColor }}
            />
          </div>
        </div>
      )}

      {/* Floating Eraser Tool Options */}
      {activeTool === 'eraser' && (
        <div className="absolute top-12 sm:top-[52px] left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-2rem)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 bg-[#1C1C1E] rounded-full px-3 py-2 shadow-lg border border-[#3A3A3C]">
              <span className="text-xs text-[#8E8E93]">Standard</span>
              <ChevronDown size={12} className="text-[#8E8E93]" />

              <div className="w-px h-5 bg-[#3A3A3C] mx-1" />

              <button 
                onClick={() => setEraserSize(s => Math.max(5, s - 5))}
                className="w-6 h-6 rounded-full bg-[#3A3A3C] text-white flex items-center justify-center"
              >
                <Minus size={12} />
              </button>
              
              <div className="flex items-center gap-1">
                <div 
                  className="rounded-full bg-[#8E8E93]"
                  style={{ width: eraserSize / 2, height: eraserSize / 2 }}
                />
              </div>

            <button 
              onClick={() => setEraserSize(s => Math.min(60, s + 5))}
              className="w-6 h-6 rounded-full bg-[#3A3A3C] text-white flex items-center justify-center"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ============= DROPDOWN MENUS - Fixed Position below first toolbar ============= */}

      {/* Page Settings Menu */}
      {showPageSettings && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowPageSettings(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] w-64 overflow-hidden"
            style={{ top: '90px', right: '12px' }}
          >
            {/* Template Section */}
            <div className="p-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Template</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                {['Blank', 'Dotted', 'Grid', 'Lined', 'Margin', 'Cornell'].map((template, index, arr) => {
                  const templateId = template.toLowerCase().replace(' ', '-')
                  const actualTemplateId = templateId === 'margin' ? 'lined-margin' : templateId
                  const isActive = paperTemplate === actualTemplateId
                  return (
                    <button
                      key={template}
                      onClick={() => {
                        if (onPaperTemplateChange) {
                          onPaperTemplateChange(actualTemplateId)
                        }
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors ${
                        index < arr.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                      }`}
                    >
                      <span className="text-[15px] text-white">{template}</span>
                      {isActive && <Check size={18} className="text-[#0A84FF]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Paper Color Section */}
            <div className="px-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Paper Color</p>
              <div className="bg-[#1C1C1E] rounded-xl p-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Cream', hex: '#FFF8E7' },
                    { name: 'Yellow', hex: '#FFFDE7' },
                    { name: 'Green', hex: '#E8F5E9' },
                    { name: 'Blue', hex: '#E3F2FD' },
                    { name: 'Dark', hex: '#2C2C2E' },
                    { name: 'Sepia', hex: '#F5E6D3' },
                    { name: 'Rose', hex: '#FCE4EC' },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        if (onPaperColorChange) {
                          onPaperColorChange(color.hex)
                        }
                      }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        paperColor === color.hex ? 'ring-2 ring-[#0A84FF] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.hex, border: '1px solid #3A3A3C' }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Page */}
            <div className="px-3 pb-3">
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    clearCanvas()
                    setShowPageSettings(false)
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors"
                >
                  <RotateCcw size={20} className="text-[#FF453A]" />
                  <span className="text-[15px] text-[#FF453A]">Clear This Page</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Accessories Menu */}
      {showAccessoriesMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowAccessoriesMenu(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] w-64 overflow-hidden"
            style={{ top: '90px', left: '50%', marginLeft: '80px', transform: 'translateX(-50%)' }}
          >
            {/* Tools Section */}
            <div className="p-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Tools</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                  </div>
                  <span className="text-white text-[15px]">Record & Summarize</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Mic size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Show Recordings</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <ZoomIn size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Zoom Window</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Ruler size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Ruler</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors">
                  <Clock size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Time Keeper</span>
                </button>
              </div>
            </div>

            {/* Settings Section */}
            <div className="px-3 pb-3">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Settings</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors">
                  <Settings size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Toolbar Customization</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Page Menu */}
      {showAddPageMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowAddPageMenu(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] w-72 overflow-hidden"
            style={{ top: '90px', right: '76px' }}
          >
            {/* Position Section */}
            <div className="p-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Position</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-xl bg-[#0A84FF] text-white text-sm font-medium">Before</button>
                <button className="flex-1 px-3 py-2 rounded-xl bg-[#1C1C1E] text-white text-sm font-medium hover:bg-[#3A3A3C] transition-colors">After</button>
                <button className="flex-1 px-3 py-2 rounded-xl bg-[#1C1C1E] text-[#8E8E93] text-sm font-medium hover:bg-[#3A3A3C] transition-colors">Last</button>
              </div>
            </div>

            {/* Recent templates */}
            <div className="px-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Recent Templates</p>
              <div className="bg-[#1C1C1E] rounded-xl p-3">
                <div className="w-16 h-20 bg-[#FFFDE7] rounded-lg border border-[#3A3A3C]" />
                <p className="text-[11px] text-[#8E8E93] mt-2">Current Template</p>
              </div>
            </div>

            {/* Options */}
            <div className="px-3 pb-3">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Add From</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <FileText size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">More from Templates...</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Image size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Image</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <ScanLine size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Scan Tasks</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Camera size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Take Photo</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors">
                  <Download size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Import</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Share Menu */}
      {showShareMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowShareMenu(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] w-72 overflow-hidden"
            style={{ top: '90px', right: '44px' }}
          >
            {/* Collaboration */}
            <div className="p-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Collaboration</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors">
                  <Share2 size={20} className="text-[#8E8E93]" />
                  <div className="flex-1 text-left">
                    <span className="text-white text-[15px]">Share...</span>
                    <p className="text-[11px] text-[#8E8E93]">Invite, view collaborators</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Export */}
            <div className="px-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Export</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Upload size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Export This Page</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Upload size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Export All</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors">
                  <Printer size={20} className="text-[#8E8E93]" />
                  <span className="text-white text-[15px]">Print</span>
                </button>
              </div>
            </div>

            {/* Presentation Mode */}
            <div className="px-3 pb-3">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Presentation Mode</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Monitor size={20} className="text-[#8E8E93]" />
                  <div className="flex-1 text-left">
                    <span className="text-white text-[15px]">Mirror Entire Screen</span>
                    <p className="text-[11px] text-[#8E8E93]">Audience sees what presenter sees</p>
                  </div>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]">
                  <Monitor size={20} className="text-[#8E8E93]" />
                  <div className="flex-1 text-left">
                    <span className="text-white text-[15px]">Mirror Presenter Page</span>
                    <p className="text-[11px] text-[#8E8E93]">Audience doesn't see the interface</p>
                  </div>
                  <Check size={18} className="text-[#0A84FF]" />
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors">
                  <Monitor size={20} className="text-[#8E8E93]" />
                  <div className="flex-1 text-left">
                    <span className="text-white text-[15px]">Mirror Full Page</span>
                    <p className="text-[11px] text-[#8E8E93]">Audience doesn't see interface & zoom</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Elements Panel */}
      {showElementsPanel && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowElementsPanel(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] w-80 overflow-hidden"
            style={{ top: '90px', left: '50%', transform: 'translateX(-50%)' }}
          >
            {/* Recent Elements Section */}
            <div className="p-3 pb-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide">Recent Elements</p>
                <button className="p-1 rounded-md text-[#8E8E93] hover:bg-[#3A3A3C] transition-colors">
                  <PanelLeft size={16} />
                </button>
              </div>
              <div className="bg-[#1C1C1E] rounded-xl p-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#3A3A3C] flex items-center justify-center mb-3">
                  <Smile size={24} className="text-[#8E8E93]" />
                </div>
                <p className="text-white font-medium text-[15px]">No Recent Elements</p>
                <p className="text-[#8E8E93] text-[13px] text-center mt-1">After you inserted or created an element, it will appear here.</p>
              </div>
            </div>

            {/* Category Section */}
            <div className="px-3 pb-3">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Categories</p>
              <div className="flex justify-center gap-2">
                <button className="w-10 h-10 rounded-xl bg-[#0A84FF] flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-[#1C1C1E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors">
                  <span className="text-xl leading-none">📝</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-[#1C1C1E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors">
                  <span className="text-xl leading-none">🏈</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-[#1C1C1E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors">
                  <span className="text-xl leading-none">📅</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Menu */}
      {showImageMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowImageMenu(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] w-80 overflow-hidden"
            style={{ top: '90px', left: '50%', transform: 'translateX(-50%)' }}
          >
            {/* Recent Images Section */}
            <div className="p-3 pb-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide">Recent Images</p>
                <button className="p-1 rounded-md text-[#0A84FF] hover:bg-[#3A3A3C] transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div className="bg-[#1C1C1E] rounded-xl p-3">
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i}
                      className="aspect-square bg-[#3A3A3C] rounded-lg hover:bg-[#4A4A4C] transition-colors cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            </div>


          </div>
        </>
      )}

      {/* Color Picker Dropdown */}
      {showColorPicker && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowColorPicker(false)} />
          <div 
            className="fixed z-50 bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] overflow-hidden w-56"
            style={{ 
              top: showToolOptionsBar ? '134px' : '90px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            {/* Basic Colors */}
            <div className="p-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Basic</p>
              <div className="bg-[#1C1C1E] rounded-xl p-3">
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
            </div>
            
            {/* Vivid Colors */}
            <div className="px-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Vivid</p>
              <div className="bg-[#1C1C1E] rounded-xl p-3">
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
            </div>
            
            {/* Pastel Colors */}
            <div className="px-3 pb-3">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Pastel</p>
              <div className="bg-[#1C1C1E] rounded-xl p-3">
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
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Pages Panel (Left) - responsive width on iPad/mobile */}
        {showPagesPanel && (
          <div className="w-56 sm:w-64 bg-[#2C2C2E] border-r border-[#3A3A3C] flex flex-col shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#3A3A3C]">
              <div className="flex items-center gap-2">
                <button className="p-1 rounded-md text-[#8E8E93] hover:bg-[#3A3A3C] transition-colors">
                  <Settings size={16} />
                </button>
              </div>
              <button 
                onClick={() => setShowPagesPanel(false)}
                className="p-1 rounded-md text-[#8E8E93] hover:bg-[#3A3A3C] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* View Mode Section */}
            <div className="p-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">View Mode</p>
              <div className="bg-[#1C1C1E] rounded-xl p-1 flex">
                <button className="flex-1 p-2 rounded-lg bg-[#3A3A3C] text-white flex items-center justify-center gap-1.5 transition-colors">
                  <FileText size={16} />
                  <span className="text-[12px]">Pages</span>
                </button>
                <button className="flex-1 p-2 rounded-lg text-[#8E8E93] hover:text-white flex items-center justify-center gap-1.5 transition-colors">
                  <Layout size={16} />
                  <span className="text-[12px]">Grid</span>
                </button>
                <button className="flex-1 p-2 rounded-lg text-[#8E8E93] hover:text-white flex items-center justify-center gap-1.5 transition-colors">
                  <Mic size={16} />
                  <span className="text-[12px]">Audio</span>
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="px-3 pb-2">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Filter</p>
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors">
                  <span className="text-white text-[15px]">All Pages</span>
                  <ChevronDown size={16} className="text-[#8E8E93]" />
                </button>
              </div>
            </div>

            {/* Pages Grid Section */}
            <div className="px-3 pb-3 flex-1 overflow-hidden flex flex-col">
              <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">Pages</p>
              <div className="bg-[#1C1C1E] rounded-xl p-3 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {pages.map((page, index) => (
                    <div
                      key={page.id}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                        currentPage === page.id ? 'border-[#0A84FF]' : 'border-transparent hover:border-[#3A3A3C]'
                      }`}
                      onClick={() => setCurrentPage(page.id)}
                    >
                      <div 
                        className={`aspect-[3/4] ${
                          page.isCover ? 'bg-gradient-to-b from-cyan-400 to-cyan-600' : 'bg-[#FFFDE7]'
                        }`}
                      >
                        {page.isCover && (
                          <div className="absolute right-1 top-1/2 w-1 h-8 bg-cyan-700 rounded-l" />
                        )}
                      </div>
                      <div className="absolute top-1.5 right-1.5">
                        <Bookmark size={14} className="text-[#8E8E93]" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-1.5 flex items-center justify-between">
                        <span className="text-[11px] text-white font-medium">{index + 1}</span>
                        <button 
                          className="p-0.5 rounded text-[#8E8E93] hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add page button */}
                  <div 
                    className="aspect-[3/4] border-2 border-dashed border-[#3A3A3C] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0A84FF] hover:bg-[#0A84FF]/10 transition-all"
                    onClick={() => {
                      const newPage = { id: pages.length + 1, thumbnail: null, isCover: false }
                      setPages([...pages, newPage])
                      setTotalPages(totalPages + 1)
                    }}
                  >
                    <Plus size={24} className="text-[#0A84FF]" />
                    <span className="text-[11px] text-[#0A84FF] mt-1">Add Page</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div 
          ref={containerRef} 
          className="flex-1 relative overflow-auto bg-[#1C1C1E]"
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
      </div>

      {/* Bottom Bar - Page Number */}
      <div className="bg-[#2C2C2E] border-t border-[#3A3A3C] h-8 flex items-center justify-center">
        <span className="text-xs text-[#8E8E93]">
          {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  )
})

export default UnifiedCanvas
