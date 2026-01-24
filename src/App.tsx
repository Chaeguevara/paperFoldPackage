import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, Editor, Templates, Learn, MaekawaTheorem, VertexTypeValidity } from '@/pages';
import { MetaTags, StructuredData, appSchema } from '@/seo';
import './App.css';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">
            Paper Fold
          </Link>
          <div className="nav-links">
            <Link to="/templates">Templates</Link>
            <Link to="/editor">Editor</Link>
            <Link to="/learn">Learn</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Paper Fold Package Designer</p>
          <div className="footer-links">
            <a href="https://github.com/chaeguevara/paperFoldPackage" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter basename="/paperFoldPackage">
      <MetaTags />
      <StructuredData data={appSchema} />

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/maekawa" element={<MaekawaTheorem />} />
          <Route path="/learn/vertex-type" element={<VertexTypeValidity />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
