import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', background: '#ffffff', border: '1px solid #dce5de', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#073B2A', marginTop: 0 }}>KrishiPulse Application Notice</h2>
          <p style={{ color: '#52635A' }}>An error occurred while loading the view:</p>
          <pre style={{ background: '#fff5f5', color: '#e03131', padding: '14px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString() || 'Unknown error'}
            {'\n\n'}
            {this.state.error?.stack || ''}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 18px', background: '#087F5B', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' }}
          >
            Reload KrishiPulse
          </button>
        </div>
      )
    }
    return this.props.children
  }

}

import { CommodityProvider } from './context/CommodityContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CommodityProvider>
          <App />
        </CommodityProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
