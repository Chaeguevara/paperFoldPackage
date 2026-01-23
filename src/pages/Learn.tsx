import { Link } from 'react-router-dom';

interface TheoremCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
}

const theorems: TheoremCard[] = [
  {
    id: 'maekawa',
    title: "Maekawa's Theorem",
    subtitle: 'M - V = \u00B12',
    category: 'flat-foldability',
  },
];

export function Learn() {
  return (
    <div className="learn">
      <section className="learn-header">
        <h1>Paper Folding Theory</h1>
        <p>
          Mathematical foundations behind flat-foldable origami patterns.
        </p>
      </section>

      <section className="theorem-list">
        {theorems.map((t) => (
          <Link key={t.id} to={`/learn/${t.id}`} className="theorem-card">
            <span className="theorem-category">{t.category}</span>
            <h3>{t.title}</h3>
            <p className="theorem-subtitle">{t.subtitle}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function MaekawaTheorem() {
  return (
    <div className="learn">
      <nav className="learn-breadcrumb">
        <Link to="/learn">Theory</Link>
        <span>/</span>
        <span>Maekawa's Theorem</span>
      </nav>

      <article className="theorem-article">
        <header>
          <span className="theorem-category">flat-foldability</span>
          <h1>Maekawa's Theorem</h1>
          <p className="theorem-statement">
            At any interior vertex of a flat-foldable crease pattern, the number
            of mountain folds (M) and valley folds (V) satisfy:
          </p>
          <div className="theorem-formula">
            M - V = &plusmn;2
          </div>
        </header>

        <section className="theorem-section">
          <h2>Intuition</h2>
          <p>
            Consider a single vertex where multiple crease lines meet. When you
            fold the paper flat, some folds go "up" (mountain) and some go "down"
            (valley). If you walk around the vertex, the paper must return to its
            original orientation after a full loop. This constraint forces an
            imbalance of exactly 2 between mountain and valley folds.
          </p>
          <p>
            Think of it this way: each mountain fold rotates the paper by +180&deg;
            and each valley fold rotates it by -180&deg;. For the paper to lie flat
            (net rotation = &plusmn;360&deg;), you need:
          </p>
          <div className="theorem-formula theorem-formula-sm">
            180&deg; &times; M - 180&deg; &times; V = &plusmn;360&deg;
          </div>
          <p>Dividing both sides by 180&deg; gives us M - V = &plusmn;2.</p>
        </section>

        <section className="theorem-section">
          <h2>Visual Example</h2>
          <div className="theorem-diagram">
            <svg viewBox="0 0 400 300" className="diagram-svg">
              {/* Paper background */}
              <rect x="50" y="30" width="300" height="240" fill="none"
                stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4" />

              {/* Center vertex */}
              <circle cx="200" cy="150" r="4" fill="var(--color-primary)" />

              {/* Fold lines from center - 4 fold vertex example: 3M + 1V */}
              {/* Mountain fold 1 (up-left) */}
              <line x1="200" y1="150" x2="100" y2="70"
                stroke="#ef4444" strokeWidth="2" />
              {/* Mountain fold 2 (up-right) */}
              <line x1="200" y1="150" x2="300" y2="70"
                stroke="#ef4444" strokeWidth="2" />
              {/* Mountain fold 3 (down) */}
              <line x1="200" y1="150" x2="200" y2="270"
                stroke="#ef4444" strokeWidth="2" />
              {/* Valley fold 1 (right) */}
              <line x1="200" y1="150" x2="320" y2="200"
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 4" />

              {/* Labels */}
              <text x="130" y="90" fill="#ef4444" fontSize="13" fontWeight="600">M</text>
              <text x="270" y="90" fill="#ef4444" fontSize="13" fontWeight="600">M</text>
              <text x="205" y="260" fill="#ef4444" fontSize="13" fontWeight="600">M</text>
              <text x="290" y="210" fill="#3b82f6" fontSize="13" fontWeight="600">V</text>

              {/* Legend */}
              <line x1="60" y1="290" x2="90" y2="290"
                stroke="#ef4444" strokeWidth="2" />
              <text x="95" y="294" fill="var(--color-text-muted)" fontSize="11">
                Mountain (M=3)
              </text>
              <line x1="200" y1="290" x2="230" y2="290"
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 4" />
              <text x="235" y="294" fill="var(--color-text-muted)" fontSize="11">
                Valley (V=1)
              </text>
            </svg>
            <p className="diagram-caption">
              A 4-fold vertex with 3 mountain and 1 valley fold. M - V = 3 - 1 = 2.
            </p>
          </div>
        </section>

        <section className="theorem-section">
          <h2>Corollaries</h2>
          <div className="corollary-list">
            <div className="corollary">
              <h4>Even number of folds</h4>
              <p>
                Since M - V = &plusmn;2 and M + V = total folds, the total number
                of creases at any vertex must be even.
              </p>
            </div>
            <div className="corollary">
              <h4>Minimum 4 folds</h4>
              <p>
                The smallest flat-foldable vertex has 4 creases (3 mountain + 1
                valley, or 1 mountain + 3 valley).
              </p>
            </div>
            <div className="corollary">
              <h4>Paper color</h4>
              <p>
                If the paper has different colors on each side, a flat fold shows
                the same color on top when M - V = +2, and the opposite color
                when M - V = -2.
              </p>
            </div>
          </div>
        </section>

        <section className="theorem-section">
          <h2>Application in This Tool</h2>
          <p>
            When generating fold patterns (box, pyramid, etc.), every interior
            vertex in the crease pattern must satisfy Maekawa's theorem for the
            pattern to fold flat without tearing or buckling. The validation system
            checks this constraint automatically.
          </p>
          <p>
            For example, a box pattern has 4-fold vertices at each corner where
            three mountain folds and one valley fold meet, satisfying 3 - 1 = 2.
          </p>
        </section>

        <section className="theorem-section">
          <h2>References</h2>
          <ul className="reference-list">
            <li>
              Maekawa, J. (1986). "Introduction to the Study of Flat Foldings"
            </li>
            <li>
              Justin, J. (1986). "Mathematics of Origami, Part 9"
            </li>
            <li>
              Hull, T. (1994). "On the Mathematics of Flat Origamis" -
              Congressus Numerantium, 100, 215-224
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
