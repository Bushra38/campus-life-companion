'use client'
import './globals.css'
import AccessibilityProvider from './components/AccessibilityProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AccessibilityProvider />
        <header>
          <nav className="navbar">
            <a href="/" className="nav-title">Campus Life Companion</a>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/events">Events</a>
              <a href="/societies">Societies</a>
              <a href="/rooms">Library</a>
              <a href="/support">Support</a>
              <a href="/accessibility">♿ Accessibility</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <p>© 2026 Campus Life Companion. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}