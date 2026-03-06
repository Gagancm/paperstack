import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Label colors from the plan
export const LABEL_COLORS = {
  red: '#FF453A',
  orange: '#FF9500',
  yellow: '#FFD60A',
  green: '#30D158',
  blue: '#0A84FF',
  purple: '#BF5AF2',
  pink: '#FF375F',
  gray: '#8E8E93',
}

// Initial demo labels
const initialLabels = [
  { id: 'l1', name: 'Work', color: 'blue' },
  { id: 'l2', name: 'Personal', color: 'green' },
  { id: 'l3', name: 'Ideas', color: 'orange' },
  { id: 'l4', name: 'Study', color: 'purple' },
]

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: true, // Set to true for demo, change to false for real auth
      user: {
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: null,
      },

      // UI state
      sidebarOpen: false,
      viewMode: 'grid', // 'list' or 'grid'
      sortBy: 'lastModified', // 'lastModified', 'dateCreated', 'name', 'type'
      theme: 'dark', // 'light', 'dark', or 'system'
      editorMode: 'type', // 'type' or 'draw'
      defaultPenTool: 'ballpoint',

      // Notes state
      notes: [],
      selectedNoteId: null,
      activeFilter: 'all', // 'all', 'favorites', 'trash', or label id
      searchQuery: '',
      selectedFolderId: null, // Currently selected folder for filtering

      // Folders state
      folders: [],

      // Labels state
      labels: initialLabels,

      // Sync state
      syncStatus: 'saved', // 'saved', 'saving', 'offline', 'error'
      lastSyncTime: new Date().toISOString(),

      // Toast notifications
      toasts: [],

      // Actions - Auth
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      logout: () => set({ isAuthenticated: false, user: null }),

      // Actions - UI
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setTheme: (theme) => set({ theme }),
      setEditorMode: (mode) => set({ editorMode: mode }),
      setDefaultPenTool: (tool) => set({ defaultPenTool: tool }),

      // Actions - Notes
      createNote: () => {
        const newNote = {
          id: generateId(),
          title: 'Untitled Notebook',
          content: '',
          labels: [],
          pinned: false,
          hasDrawing: false,
          drawingData: null,
          inTrash: false,
          // Color key for notebook
          colorKey: 'blue',
          // Paper settings
          paperTemplate: 'blank',
          paperColor: '#FFFFFF',
          // Organization
          folderId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          notes: [newNote, ...state.notes],
        }))
        return newNote.id
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, inTrash: true } : note
          ),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        }))
        // Show undo toast
        get().addToast({
          message: 'Note moved to trash',
          action: {
            label: 'Undo',
            onClick: () => get().restoreNote(id),
          },
        })
      },

      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, inTrash: false } : note
          ),
        }))
      },

      permanentlyDeleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        }))
      },

      duplicateNote: (id) => {
        const state = get()
        const noteToDuplicate = state.notes.find((n) => n.id === id)
        if (!noteToDuplicate) return

        const newNote = {
          ...noteToDuplicate,
          id: generateId(),
          title: `Copy of ${noteToDuplicate.title}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          notes: [newNote, ...state.notes],
        }))
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, pinned: !note.pinned } : note
          ),
        }))
      },

      selectNote: (id) => set({ selectedNoteId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveFilter: (filter) => set({ activeFilter: filter, selectedFolderId: null }),

      setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),

      clearSelectedFolder: () => set({ selectedFolderId: null }),

      // Actions - Folders
      createFolder: (name = 'New Folder') => {
        const newFolder = {
          id: generateId(),
          name,
          colorKey: 'blue',
          pinned: false,
          labelIds: [], // Labels attached to folder
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          folders: [newFolder, ...state.folders],
        }))
        return newFolder.id
      },

      addLabelToFolder: (folderId, labelId) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === folderId && !(folder.labelIds || []).includes(labelId)
              ? { ...folder, labelIds: [...(folder.labelIds || []), labelId], updatedAt: new Date().toISOString() }
              : folder
          ),
        }))
      },

      removeLabelFromFolder: (folderId, labelId) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === folderId
              ? { ...folder, labelIds: (folder.labelIds || []).filter((id) => id !== labelId), updatedAt: new Date().toISOString() }
              : folder
          ),
        }))
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
              : folder
          ),
        }))
      },

      deleteFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
        }))
      },

      // Actions - Labels
      createLabel: (name, color) => {
        const newLabel = {
          id: generateId(),
          name,
          color,
        }
        set((state) => ({
          labels: [...state.labels, newLabel],
        }))
        return newLabel.id
      },

      updateLabel: (id, updates) => {
        set((state) => ({
          labels: state.labels.map((label) =>
            label.id === id ? { ...label, ...updates } : label
          ),
        }))
      },

      deleteLabel: (id) => {
        set((state) => ({
          labels: state.labels.filter((label) => label.id !== id),
          // Remove label from all notes
          notes: state.notes.map((note) => ({
            ...note,
            labels: note.labels.filter((labelId) => labelId !== id),
          })),
        }))
      },

      addLabelToNote: (noteId, labelId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId && !note.labels.includes(labelId)
              ? { ...note, labels: [...note.labels, labelId] }
              : note
          ),
        }))
      },

      removeLabelFromNote: (noteId, labelId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, labels: note.labels.filter((id) => id !== labelId) }
              : note
          ),
        }))
      },

      // Actions - Sync
      setSyncStatus: (status) => set({ syncStatus: status }),
      setLastSyncTime: (time) => set({ lastSyncTime: time }),

      // Actions - Toasts
      addToast: (toast) => {
        const id = generateId()
        const newToast = { ...toast, id }
        set((state) => ({
          toasts: [...state.toasts, newToast],
        }))
        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeToast(id)
        }, 5000)
        return id
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }))
      },

      // Computed/Derived state helpers
      getFilteredNotes: () => {
        const state = get()
        let filtered = state.notes

        // Filter by folder first
        if (state.selectedFolderId) {
          filtered = filtered.filter((note) => note.folderId === state.selectedFolderId)
        }

        // Filter by trash/active
        if (state.activeFilter === 'trash') {
          filtered = filtered.filter((note) => note.inTrash)
        } else {
          filtered = filtered.filter((note) => !note.inTrash)

          // Filter by favorites
          if (state.activeFilter === 'favorites') {
            filtered = filtered.filter((note) => note.pinned)
          }
          // Filter by label
          else if (state.activeFilter !== 'all') {
            filtered = filtered.filter((note) =>
              note.labels.includes(state.activeFilter)
            )
          }
        }

        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(
            (note) =>
              note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query)
          )
        }

        // Sort: pinned first, then by sortBy preference
        const sortBy = state.sortBy || 'lastModified'
        filtered.sort((a, b) => {
          // Pinned items always first
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          
          // Then sort by preference
          switch (sortBy) {
            case 'name':
              return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
            case 'dateCreated':
              return new Date(b.createdAt) - new Date(a.createdAt)
            case 'type':
              // Folders first (if applicable), then notes
              return 0
            case 'lastModified':
            default:
              return new Date(b.updatedAt) - new Date(a.updatedAt)
          }
        })

        return filtered
      },

      getNotesCountByFolder: (folderId) => {
        const state = get()
        return state.notes.filter(
          (note) => !note.inTrash && note.folderId === folderId
        ).length
      },

      getFilteredFolders: () => {
        const state = get()
        let filtered = [...state.folders]
        
        // Sort folders
        const sortBy = state.sortBy || 'lastModified'
        filtered.sort((a, b) => {
          // Pinned items always first
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          
          // Then sort by preference
          switch (sortBy) {
            case 'name':
              return (a.name || 'Untitled').localeCompare(b.name || 'Untitled')
            case 'dateCreated':
              return new Date(b.createdAt) - new Date(a.createdAt)
            case 'type':
              return 0
            case 'lastModified':
            default:
              return new Date(b.updatedAt) - new Date(a.updatedAt)
          }
        })

        return filtered
      },

      getSelectedNote: () => {
        const state = get()
        return state.notes.find((note) => note.id === state.selectedNoteId)
      },

      getLabelById: (id) => {
        const state = get()
        return state.labels.find((label) => label.id === id)
      },

      getNotesCountByLabel: (labelId) => {
        const state = get()
        return state.notes.filter(
          (note) => !note.inTrash && note.labels.includes(labelId)
        ).length
      },
    }),
    {
      name: 'paperstack-storage',
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        labels: state.labels,
        theme: state.theme,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        defaultPenTool: state.defaultPenTool,
      }),
    }
  )
)
