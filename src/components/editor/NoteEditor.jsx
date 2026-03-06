import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Edit, MoreSquare, Star, Folder, Delete, CloseSquare, ChevronLeft, TickSquare } from 'react-iconly'
import { Type, Tag, Copy } from 'lucide-react' // These icons not available in Iconly
import { useAppStore, LABEL_COLORS } from '../../store/appStore'
import DrawCanvas from './DrawCanvas'
import LabelPicker from '../labels/LabelPicker'

export default function NoteEditor({ onClose }) {
  const {
    getSelectedNote,
    updateNote,
    togglePinNote,
    deleteNote,
    duplicateNote,
    editorMode,
    setEditorMode,
    selectNote,
    labels,
    folders,
    removeLabelFromNote,
    addToast,
  } = useAppStore()

  const [showMenu, setShowMenu] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  const note = getSelectedNote()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      if (note) updateNote(note.id, { content: editor.getHTML() })
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-invert max-w-none focus:outline-none min-h-full px-6 py-4',
      },
    },
  }, [note?.id])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!note) return null

  const noteLabels = note.labels.map((id) => labels.find((l) => l.id === id)).filter(Boolean)
  const currentFolder = folders.find(f => f.id === note.folderId)

  const handleTitleChange = (e) => updateNote(note.id, { title: e.target.value })
  const handleClose = () => { selectNote(null); onClose() }
  const handleDelete = () => { deleteNote(note.id); setShowMenu(false); onClose() }

  const handleMoveToFolder = (folderId) => {
    updateNote(note.id, { folderId: folderId || null })
    setShowFolderPicker(false)
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No Folder'
    addToast({ message: `Moved to ${folderName}` })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1C1E] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#1C1C1E] border-b border-[#3A3A3C]">
        <button onClick={handleClose} className="flex items-center gap-1 text-[#0A84FF]">
          <ChevronLeft set="broken" size={24} stroke="regular" />
          <span className="font-medium">Notes</span>
        </button>

        {/* Mode Toggle */}
        <div className="flex items-center bg-[#2C2C2E] rounded-lg p-1">
          <button
            onClick={() => setEditorMode('type')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${
              editorMode === 'type' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93]'
            }`}
          >
            <Type size={16} />
            <span>Type</span>
          </button>
          <button
            onClick={() => setEditorMode('draw')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${
              editorMode === 'draw' ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93]'
            }`}
          >
            <Edit set="broken" size={16} stroke="regular" />
            <span>Draw</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePinNote(note.id)}
            className={`p-2 rounded-lg hover:bg-[#3A3A3C] ${note.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'}`}
          >
            <Star set={note.pinned ? 'bold' : 'broken'} size={20} stroke="regular" />
          </button>
          
          <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="p-2 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]">
            <Tag size={20} />
          </button>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]">
              <MoreSquare set="broken" size={20} stroke="regular" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-lg shadow-xl z-50 w-52 py-1 border border-[#3A3A3C]">
                  <button
                    onClick={() => { setShowMenu(false); setShowFolderPicker(true) }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-white hover:bg-[#3A3A3C]"
                  >
                    <div className="text-[#8E8E93]">
                      <Folder set="broken" size={18} stroke="regular" />
                    </div>
                    <span className="text-sm">Move to Folder</span>
                  </button>
                  <div className="h-px bg-[#3A3A3C] mx-2" />
                  <button
                    onClick={() => { duplicateNote(note.id); setShowMenu(false) }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-white hover:bg-[#3A3A3C]"
                  >
                    <Copy size={18} className="text-[#8E8E93]" />
                    <span className="text-sm">Duplicate</span>
                  </button>
                  <div className="h-px bg-[#3A3A3C] mx-2" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-[#FF453A] hover:bg-[#3A3A3C]"
                  >
                    <Delete set="broken" size={18} stroke="regular" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Label Picker */}
      {showLabelPicker && (
        <LabelPicker noteId={note.id} selectedLabels={note.labels} onClose={() => setShowLabelPicker(false)} />
      )}

      {/* Folder Picker Modal */}
      {showFolderPicker && (
        <FolderPicker
          currentFolderId={note.folderId}
          folders={folders}
          onSelect={handleMoveToFolder}
          onClose={() => setShowFolderPicker(false)}
        />
      )}

      {/* Labels */}
      {(noteLabels.length > 0 || currentFolder) && (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#3A3A3C] overflow-x-auto">
          {currentFolder && (
            <span className="bg-[#3A3A3C] px-3 py-1 rounded-full text-sm text-white flex items-center gap-2 shrink-0">
              📁 {currentFolder.name}
            </span>
          )}
          {noteLabels.map((label) => (
            <span
              key={label.id}
              className="px-3 py-1 rounded-full text-sm flex items-center gap-2 shrink-0"
              style={{ backgroundColor: `${LABEL_COLORS[label.color]}30`, color: LABEL_COLORS[label.color] }}
            >
              {label.name}
              <button onClick={() => removeLabelFromNote(note.id, label.id)} className="hover:opacity-70">
                <CloseSquare set="broken" size={14} stroke="regular" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <div className="px-6 pt-6 pb-2">
        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none placeholder-[#8E8E93]"
          maxLength={120}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        {editorMode === 'type' ? (
          <EditorContent editor={editor} className="h-full" />
        ) : (
          <DrawCanvas noteId={note.id} />
        )}
      </div>
    </div>
  )
}

function FolderPicker({ currentFolderId, folders, onSelect, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-2xl pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A3A3C]">
            <h3 className="text-lg font-semibold text-white">Move to Folder</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]">
              <CloseSquare set="broken" size={20} stroke="regular" />
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <button
              onClick={() => onSelect(null)}
              className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-[#3A3A3C] ${!currentFolderId ? 'text-[#0A84FF]' : 'text-white'}`}
            >
              <span className="text-2xl">📄</span>
              <span className="flex-1 text-left">No Folder</span>
              {!currentFolderId && <TickSquare set="broken" size={20} stroke="regular" primaryColor="#0A84FF" />}
            </button>
            
            <div className="h-px bg-[#3A3A3C]" />
            
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onSelect(folder.id)}
                className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-[#3A3A3C] ${currentFolderId === folder.id ? 'text-[#0A84FF]' : 'text-white'}`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: folder.gradient || folder.color }}
                >
                  {folder.icon || '📁'}
                </div>
                <span className="flex-1 text-left">{folder.name}</span>
                {currentFolderId === folder.id && <TickSquare set="broken" size={20} stroke="regular" primaryColor="#0A84FF" />}
              </button>
            ))}
            
            {folders.length === 0 && (
              <div className="px-5 py-8 text-center text-[#8E8E93]">No folders yet</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
