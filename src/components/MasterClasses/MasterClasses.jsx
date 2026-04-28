import { useState } from 'react'
import { MASTERCLASSES } from '../../data'
import './MasterClasses.css'

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SectionContent({ section }) {
  return (
    <div className="mc-section-body">
      {section.text && <p>{section.text}</p>}
      {section.items && (
        <div className="mc-items-grid">
          {section.items.map((item, i) => (
            <div key={i} className="mc-item-card">
              {item.img
                ? <img src={item.img} alt={item.name} className="mc-item-img" />
                : <div className="mc-item-img-placeholder">{item.icon}</div>
              }
              <span className="mc-item-name">{item.name}</span>
              <span className="mc-item-note">{item.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ClassDropdown({ mc, isOpen, onToggle }) {
  return (
    <div className={`mc-class-dropdown ${isOpen ? 'open' : ''}`} style={{ '--class-color': mc.color }}>
      {/* ── Class Header (main toggle) ── */}
      <button className="mc-class-header" onClick={onToggle}>
        {typeof mc.icon === 'string' && mc.icon.match(/\.(png|jpg|webp|gif)$/)
          ? <img src={mc.icon} alt={mc.name} className="mc-class-icon-img" />
          : <span className="mc-class-icon">{mc.icon}</span>
        }
        <span className="mc-class-name">{mc.name}</span>
        <span className="mc-class-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* ── Class Body ── */}
      {isOpen && (
        <div className="mc-class-body">
          {mc.sections.map(section => (
            <div key={section.id} className="mc-section">
              <h3 className="mc-section-title">{section.title}</h3>
              <SectionContent section={section} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MasterClasses() {
  const [openClass, setOpenClass] = useState('blood-berserker')

  function toggleClass(id) {
    setOpenClass(prev => (prev === id ? null : id))
  }

  return (
    <div className="page masterclasses-page">
      <h2 className="page-title">Master Classes</h2>

      <div className="mc-list">
        {MASTERCLASSES.map(mc => (
          <ClassDropdown
            key={mc.id}
            mc={mc}
            isOpen={openClass === mc.id}
            onToggle={() => toggleClass(mc.id)}
          />
        ))}
      </div>
    </div>
  )
}