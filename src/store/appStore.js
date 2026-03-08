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

// Document types for sidebar tabs
export const DOCUMENT_TYPES = {
  notebook: { id: 'notebook', label: 'Notebooks', icon: '📓', description: 'Fixed pages with drawing + text' },
  whiteboard: { id: 'whiteboard', label: 'Whiteboard', icon: '⬜', description: 'Infinite canvas for mind maps' },
  task: { id: 'task', label: 'Tasks', icon: '📄', description: 'Typing-focused tasks' },
}

// Normalize legacy 'document' type to 'task' for persisted data (export for use in components)
export const effectiveDocType = (note) =>
  note.documentType === 'document' ? 'task' : (note.documentType || 'notebook')

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
      activeDocumentType: 'notebook', // 'notebook', 'whiteboard', 'task'

      // Notes state
      notes: [],
      selectedNoteId: null,
      activeFilter: 'all', // 'all', 'favorites', 'trash', or label id
      trashFavoritesSubFilter: 'all', // 'all' | 'notebook' | 'task' | 'whiteboard' - filter by type within trash/favorites
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

      // Notifications (persistent)
      notifications: [],

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
      setActiveDocumentType: (type) => set({ activeDocumentType: type, selectedFolderId: null }),

      // Actions - Notes
      createNote: (documentType = 'notebook') => {
        const typeLabels = {
          notebook: 'Untitled Notebook',
          whiteboard: 'Untitled Whiteboard',
          task: 'Untitled Task',
        }
        const newNote = {
          id: generateId(),
          title: typeLabels[documentType] || 'Untitled',
          content: '',
          labels: [],
          pinned: false,
          hasDrawing: false,
          drawingData: null,
          inTrash: false,
          // Document type
          documentType: documentType,
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
        // Add notification
        get().addNotification({
          type: 'note_created',
          message: `New ${documentType} created`,
        })
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
        const state = get()
        const note = state.notes.find((n) => n.id === id)
        const noteTitle = note?.title || 'Untitled'
        
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, inTrash: true } : note
          ),
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        }))
        // Show undo toast (no notification needed - toast has undo action)
        get().addToast({
          type: 'delete',
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

      setActiveFilter: (filter) => set({
        activeFilter: filter,
        selectedFolderId: null,
        ...(filter === 'trash' || filter === 'favorites' ? { trashFavoritesSubFilter: 'all' } : {}),
      }),
      setTrashFavoritesSubFilter: (subFilter) => set({ trashFavoritesSubFilter: subFilter }),

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
        // Add notification
        get().addNotification({
          type: 'folder_created',
          message: `Folder "${name}" created`,
        })
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
        // Add notification
        get().addNotification({
          type: 'label_added',
          message: `Label "${name}" created`,
        })
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

      // Actions - Notifications
      addNotification: (notification) => {
        const id = generateId()
        const newNotification = {
          ...notification,
          id,
          read: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        }))
        return id
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      getUnreadNotificationCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },

      // Computed/Derived state helpers
      getFilteredNotes: () => {
        const state = get()
        let filtered = state.notes

        // Filter by document type (skip for Trash and Favorites so sidebar count matches visible items)
        const isTrashOrFavorites = state.activeFilter === 'trash' || state.activeFilter === 'favorites'
        if (state.activeDocumentType && !isTrashOrFavorites) {
          filtered = filtered.filter((note) =>
            effectiveDocType(note) === state.activeDocumentType
          )
        }

        // Filter by folder (only when not in Trash/Favorites)
        if (state.selectedFolderId && !isTrashOrFavorites) {
          filtered = filtered.filter((note) => note.folderId === state.selectedFolderId)
        }

        // Filter by trash/active
        if (state.activeFilter === 'trash') {
          filtered = filtered.filter((note) => note.inTrash)
          if (state.trashFavoritesSubFilter && state.trashFavoritesSubFilter !== 'all') {
            filtered = filtered.filter((note) => effectiveDocType(note) === state.trashFavoritesSubFilter)
          }
        } else {
          filtered = filtered.filter((note) => !note.inTrash)

          // Filter by favorites
          if (state.activeFilter === 'favorites') {
            filtered = filtered.filter((note) => note.pinned)
            if (state.trashFavoritesSubFilter && state.trashFavoritesSubFilter !== 'all') {
              filtered = filtered.filter((note) => effectiveDocType(note) === state.trashFavoritesSubFilter)
            }
          }
          // Filter by label
          else if (state.activeFilter !== 'all') {
            filtered = filtered.filter((note) =>
              note.labels.includes(state.activeFilter)
            )
          }
        }

        // Filter by search query - search in title, content, and labels
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter((note) => {
            // Search in title
            if (note.title?.toLowerCase().includes(query)) return true
            
            // Search in content (strip HTML tags for better matching)
            const plainContent = note.content?.replace(/<[^>]*>/g, '') || ''
            if (plainContent.toLowerCase().includes(query)) return true
            
            // Search in label names
            const noteLabels = note.labels || []
            const matchingLabel = noteLabels.some(labelId => {
              const label = state.labels.find(l => l.id === labelId)
              return label?.name?.toLowerCase().includes(query)
            })
            if (matchingLabel) return true
            
            return false
          })
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

      getNotesCountByDocumentType: (documentType) => {
        const state = get()
        return state.notes.filter(
          (note) => !note.inTrash && effectiveDocType(note) === documentType
        ).length
      },

      getFilteredFolders: () => {
        const state = get()
        let filtered = [...state.folders]
        
        // Filter by search query - search in folder name and labels
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter((folder) => {
            // Search in folder name
            if (folder.name?.toLowerCase().includes(query)) return true
            
            // Search in label names attached to folder
            const folderLabels = folder.labelIds || []
            const matchingLabel = folderLabels.some(labelId => {
              const label = state.labels.find(l => l.id === labelId)
              return label?.name?.toLowerCase().includes(query)
            })
            if (matchingLabel) return true
            
            return false
          })
        }
        
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
        activeDocumentType: state.activeDocumentType,
        notifications: state.notifications,
      }),
    }
  )
)
