import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Paper Fold Package Designer</h1>
        <p>
          Design paper folding patterns with 3D visualization.
          Export to SVG for cutting or STL for 3D printing.
        </p>
        <div className="hero-actions">
          <Link to="/editor" className="btn btn-primary">
            Start Designing
          </Link>
          <Link to="/templates" className="btn btn-secondary">
            Browse Templates
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>3D Visualization</h3>
            <p>See your patterns come to life with interactive 3D preview</p>
          </div>
          <div className="feature">
            <h3>SVG Export</h3>
            <p>Export patterns with fold lines for cutting machines</p>
          </div>
          <div className="feature">
            <h3>STL Export</h3>
            <p>Generate 3D printable models with living hinges</p>
          </div>
          <div className="feature">
            <h3>Customizable</h3>
            <p>Adjust dimensions to fit your exact needs</p>
          </div>
        </div>
      </section>
    </div>
  );
}
