import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './Dashboard'
type Page = 'home' | 'features' | 'about' | 'ticket' | 'dashboard'
type Analysis = {
  category: string
  intent: string
  priority: string
  sentiment: string
  confidence: number
  recommended_action: string
}
function App() {
  const [page, setPage] = useState<Page>('home')

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const previousPage = event.state?.supportIQPage as Page | undefined
      setPage(previousPage || 'home')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Keep the rest of your existing App code here
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [issue, setIssue] = useState('')

  const [message, setMessage] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)

function goToPage(newPage: Page) {
  if (newPage === page) return

  window.history.pushState(
    { supportIQPage: newPage },
    '',
    window.location.pathname + window.location.search
  )

  setPage(newPage)

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !issue.trim()) {
      setMessage('Please fill in all fields.')
      setAnalysis(null)
      return
    }

    setLoading(true)
    setMessage('')
    setAnalysis(null)

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('email', email.trim())
    formData.append('issue', issue.trim())

    try {
      const response = await fetch(
      'https://supportiq-backend-q1ca.onrender.com/submit-ticket',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Ticket analyzed successfully.')
        setAnalysis(data.ai_analysis ?? null)
      } else {
        setMessage(
          data.detail || 'Failed to analyze ticket. Please try again.'
        )
      }
    } catch {
      setMessage(
        'Backend connection failed. Please check that your FastAPI server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`app ${
        page === 'dashboard' ? 'dashboard-mode' : 'website-mode'
      }`}
    >
      {/* HEADER */}

      <header className="header">
        <div
          className="logo"
          onClick={() => goToPage('home')}
          style={{ cursor: 'pointer' }}
        >
          <span className="logo-icon">AI</span>
          <span>SupportIQ</span>
        </div>

        <nav>
          <button
            className={page === 'home' ? 'nav-active' : ''}
            onClick={() => goToPage('home')}
          >
            Home
          </button>

          <button
            className={page === 'features' ? 'nav-active' : ''}
            onClick={() => goToPage('features')}
          >
            Features
          </button>

          <button
            className={page === 'about' ? 'nav-active' : ''}
            onClick={() => goToPage('about')}
          >
            About
          </button>
        </nav>

        <button
          className="agent-btn"
          onClick={() => goToPage('dashboard')}
        >
          Agent Dashboard
        </button>
      </header>

      {/* HOME */}

      {page === 'home' && (
        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <span className="badge">
                AI-POWERED SUPPORT INTELLIGENCE
              </span>

              <h1>
                Smarter Support.
                <br />
                <span>Faster Resolutions.</span>
              </h1>

              <p>
                Transform customer support tickets with AI-powered
                intent detection, priority prediction, sentiment
                analysis, and intelligent solution recommendations.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-btn"
                  onClick={() => {
                    setMessage('')
                    setAnalysis(null)
                    goToPage('ticket')
                  }}
                >
                  Create Support Ticket →
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => goToPage('features')}
                >
                  Explore Features
                </button>
              </div>
            </div>

            <div className="hero-card">
              <div className="card-header">
                <span>AI Ticket Analysis</span>
                <span className="status">● AI Ready</span>
              </div>

              <div className="ticket-preview">
                <p className="ticket-label">CUSTOMER TICKET</p>
                <p>
                  “My payment was deducted twice but my order
                  is still pending. Please help.”
                </p>
              </div>

              <div className="analysis-grid">
                <div>
                  <small>Category</small>
                  <strong>Payment</strong>
                </div>

                <div>
                  <small>Intent</small>
                  <strong>Duplicate Payment</strong>
                </div>

                <div>
                  <small>Priority</small>
                  <strong className="high">HIGH</strong>
                </div>

                <div>
                  <small>Sentiment</small>
                  <strong>Negative</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="features">
            <div className="section-title">
              <span className="badge">CORE CAPABILITIES</span>
              <h2>AI that understands every ticket</h2>
              <p>
                Automatically analyze, organize, and assist your
                support team.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Intent Detection</h3>
                <p>
                  Understand what the customer actually needs.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📂</div>
                <h3>Category Classification</h3>
                <p>
                  Automatically classify tickets into categories.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Priority Prediction</h3>
                <p>
                  Identify urgent tickets for faster responses.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '35px' }}>
              <button
                className="secondary-btn"
                onClick={() => goToPage('features')}
              >
                View All Features →
              </button>
            </div>
          </section>

          <section className="workflow">
            <div className="section-title">
              <span className="badge">HOW IT WORKS</span>
              <h2>From ticket to intelligent action</h2>
            </div>

            <div className="workflow-steps">
              <div>
                <span>01</span>
                <h3>Submit</h3>
                <p>Customer creates a support ticket.</p>
              </div>

              <div>
                <span>02</span>
                <h3>Analyze</h3>
                <p>AI processes the ticket.</p>
              </div>

              <div>
                <span>03</span>
                <h3>Understand</h3>
                <p>AI predicts ticket characteristics.</p>
              </div>

              <div>
                <span>04</span>
                <h3>Resolve</h3>
                <p>Agents receive useful recommendations.</p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* FEATURES */}

      {page === 'features' && (
        <main>
          <section className="page-section">
            <div className="section-title">
              <span className="badge">SUPPORTIQ FEATURES</span>
              <h1>Intelligent Support Features</h1>
              <p>
                Powerful AI-assisted capabilities designed to help
                customer support teams understand tickets faster.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Intent Detection</h3>
                <p>
                  Identify what the customer is trying to achieve,
                  such as requesting a refund, reporting a login
                  problem, or asking about an order.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📂</div>
                <h3>Category Classification</h3>
                <p>
                  Automatically organize tickets into categories
                  such as Payment, Account, Delivery, Technical
                  Issue, Subscription, and General Support.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Priority Prediction</h3>
                <p>
                  Detect urgent situations and classify tickets as
                  HIGH, MEDIUM, or LOW priority.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Sentiment Analysis</h3>
                <p>
                  Identify whether customer communication is
                  Positive, Neutral, or Negative.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔎</div>
                <h3>Ticket Intelligence</h3>
                <p>
                  Store analyzed tickets and make historical ticket
                  information available to support agents.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💡</div>
                <h3>Solution Recommendation</h3>
                <p>
                  Provide an AI-assisted recommended action based
                  on the detected category and customer intent.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <button
                className="primary-btn"
                onClick={() => goToPage('ticket')}
              >
                Try AI Ticket Analyzer →
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ABOUT */}

      {page === 'about' && (
        <main>
          <section className="page-section">
            <div className="section-title">
              <span className="badge">ABOUT SUPPORTIQ</span>
              <h1>AI-Powered Support Intelligence</h1>
              <p>
                SupportIQ is an AI-assisted customer support
                ticket intelligence platform.
              </p>
            </div>

            <div className="about-grid">
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>What is SupportIQ?</h3>
                <p>
                  SupportIQ analyzes customer support messages and
                  extracts useful information such as category,
                  intent, priority, sentiment, confidence, and
                  recommended action.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚙️</div>
                <h3>How it works</h3>
                <p>
                  A customer submits a support issue. The backend
                  processes the text and generates an intelligent
                  analysis. The result is stored in a SQLite
                  database for agent access.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>For Support Agents</h3>
                <p>
                  Agents can use the dashboard to view saved
                  tickets, monitor priorities, understand customer
                  sentiment, and review recommended actions.
                </p>
              </div>
            </div>

            <div className="workflow">
              <div className="section-title">
                <span className="badge">TECHNOLOGY</span>
                <h2>Built with modern technologies</h2>
              </div>

              <div className="workflow-steps">
                <div>
                  <span>01</span>
                  <h3>React</h3>
                  <p>Interactive frontend interface.</p>
                </div>

                <div>
                  <span>02</span>
                  <h3>FastAPI</h3>
                  <p>High-performance backend API.</p>
                </div>

                <div>
                  <span>03</span>
                  <h3>Python</h3>
                  <p>Ticket analysis and processing.</p>
                </div>

                <div>
                  <span>04</span>
                  <h3>SQLite</h3>
                  <p>Local ticket data storage.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* CREATE TICKET */}

      {page === 'ticket' && (
        <main>
          <section className="page-section ticket-page">
            <div className="section-title">
              <span className="badge">AI TICKET ANALYZER</span>
              <h1>Create Support Ticket</h1>
              <p>
                Describe your issue and let SupportIQ analyze it.
              </p>
            </div>

            <div className="ticket-form-card">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <textarea
                placeholder="Describe your issue..."
                rows={7}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />

              <button
                className="primary-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? 'Analyzing Ticket...'
                  : 'Analyze Ticket →'}
              </button>

              {message && (
                <p
                  role="status"
                  style={{
                    marginTop: '20px',
                    color: analysis ? '#16966b' : '#526078',
                    fontWeight: 600,
                  }}
                >
                  {message}
                </p>
              )}

              {analysis && (
                <div className="analysis-result">
                  <div className="analysis-result-header">
                    <span className="badge">
                      AI ANALYSIS COMPLETE
                    </span>
                    <h2>🤖 Ticket Intelligence</h2>
                  </div>

                  <div className="analysis-grid">
                    <div>
                      <small>Category</small>
                      <strong>{analysis.category}</strong>
                    </div>

                    <div>
                      <small>Intent</small>
                      <strong>{analysis.intent}</strong>
                    </div>

                    <div>
                      <small>Priority</small>
                      <strong className="high">
                        {analysis.priority}
                      </strong>
                    </div>

                    <div>
                      <small>Sentiment</small>
                      <strong>{analysis.sentiment}</strong>
                    </div>
                  </div>

                  <div className="analysis-extra">
                    <p>
                      <strong>📊 Confidence:</strong>{' '}
                      {(analysis.confidence * 100).toFixed(0)}%
                    </p>

                    <p>
                      <strong>💡 Recommended Action:</strong>{' '}
                      {analysis.recommended_action}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* AGENT DASHBOARD */}

      {page === 'dashboard' && (
        <main>
          <Dashboard />
        </main>
      )}

      {/* FOOTER */}

      <footer>
        <div className="logo">
          <span className="logo-icon">AI</span>
          <span>SupportIQ</span>
        </div>

        <p>AI Support Ticket Intelligence System</p>
      </footer>
    </div>
  )
}

export default App
