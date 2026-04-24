import { useState, useEffect } from 'react'
import './TodoList.css'

export default function TodoList({ characterId, defaultTodos = [] }) {
  const storageKey = `idleon-todos-${characterId}`

  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : defaultTodos
    } catch {
      return defaultTodos
    }
  })

  const [showModal, setShowModal] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setTodos(saved ? JSON.parse(saved) : defaultTodos)
    } catch {
      setTodos(defaultTodos)
    }
  }, [characterId])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(todos))
    } catch {
      console.warn('Could not save todos to localStorage.')
    }
  }, [todos, storageKey])

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    setTodos(prev => [...prev, trimmed])
    setInputValue('')
    setShowModal(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') closeModal()
  }

  const handleRemove = (index) => {
    setTodos(prev => prev.filter((_, i) => i !== index))
  }

  const closeModal = () => {
    setShowModal(false)
    setInputValue('')
  }

  return (
    <>
      <div className="todo-container">
        <ul className="todo-list">
          {todos.map((todo, i) => (
            <li key={i} className="todo-item">
              <span>{todo}</span>
              <button
                className="todo-remove"
                onClick={() => handleRemove(i)}
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
          {todos.length === 0 && (
            <li className="todo-empty">Nothing To-Do Yet!</li>
          )}
        </ul>
        <button className="todo-add-btn" onClick={() => setShowModal(true)}>
          + Add To-Do
        </button>
      </div>

      {showModal && (
        <div className="todo-modal-overlay" onClick={closeModal}>
          <div className="todo-modal" onClick={e => e.stopPropagation()}>
            <h3 className="todo-modal-title">New To-Do</h3>
            <input
              className="todo-modal-input"
              type="text"
              placeholder="e.g. Farm Amarok kills..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="todo-modal-actions">
              <button className="todo-modal-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="todo-modal-confirm"
                onClick={handleAdd}
                disabled={!inputValue.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}