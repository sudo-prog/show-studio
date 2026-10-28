import { useState } from 'react'

export default function Header() {
  const [activeSection, setActiveSection] = useState('clothing')
  
  const sections = ['Clothing', 'Shoes', 'Bags', 'Caps']
  
  return (
    <header className="header">
      <div className="header-side">
        <button className="nav-button active">Menu</button>
      </div>
      <nav className="section-nav">
        {sections.map(section => (
          <button
            key={section}
            className={activeSection === section.toLowerCase() ? 'active' : ''}
            onClick={() => setActiveSection(section.toLowerCase())}
          >
            {section}
          </button>
        ))}
      </nav>
      <div className="header-side">
        <button className="nav-button">Cart</button>
      </div>
    </header>
  )
}
