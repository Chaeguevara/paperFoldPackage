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
  {
    id: 'vertex-type',
    title: 'Vertex Type & Validity',
    subtitle: 'M/V sequence + crimping',
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

export function VertexTypeValidity() {
  return (
    <div className="learn">
      <nav className="learn-breadcrumb">
        <Link to="/learn">Theory</Link>
        <span>/</span>
        <span>Vertex Type &amp; Validity</span>
      </nav>

      <article className="theorem-article">
        <header>
          <span className="theorem-category">flat-foldability</span>
          <h1>Vertex Type &amp; Validity</h1>
          <p className="theorem-statement">
            The <strong>vertex type</strong> is the circular sequence of Mountain (M)
            and Valley (V) fold assignments around a vertex. <strong>Vertex validity</strong>
            determines whether that assignment can fold flat without layer self-intersection.
          </p>
        </header>

        <section className="theorem-section">
          <h2>Vertex Type</h2>
          <p>
            At any vertex where crease lines meet, we can walk around the vertex
            in angular order and record whether each fold is Mountain or Valley.
            This circular sequence is the <em>vertex type</em>.
          </p>
          <p>
            For a degree-4 vertex satisfying Maekawa (|M-V|=2), the possible types are:
          </p>
          <div className="corollary-list">
            <div className="corollary">
              <h4>3M + 1V types</h4>
              <p>MMMV, MMVM, MVMM, VMMM (all rotations of the same type)</p>
            </div>
            <div className="corollary">
              <h4>1M + 3V types</h4>
              <p>MVVV, VMVV, VVMV, VVVM (all rotations of the same type)</p>
            </div>
          </div>
          <p>
            For degree-6 vertices (4M+2V or 2M+4V), the placement of the minority
            folds matters: MMMMVV, MMMVMV, MMVMMV, etc. are distinct types with
            different validity.
          </p>
        </section>

        <section className="theorem-section">
          <h2>Visual: Vertex Types at Degree 4</h2>
          <div className="theorem-diagram">
            <svg viewBox="0 0 500 280" className="diagram-svg">
              {/* Valid vertex: MMMV */}
              <text x="110" y="20" fill="var(--color-text)" fontSize="13"
                fontWeight="600" textAnchor="middle">MMMV (Valid)</text>
              <circle cx="110" cy="130" r="4" fill="var(--color-primary)" />
              <line x1="110" y1="130" x2="60" y2="60"
                stroke="#ef4444" strokeWidth="2" />
              <line x1="110" y1="130" x2="160" y2="60"
                stroke="#ef4444" strokeWidth="2" />
              <line x1="110" y1="130" x2="110" y2="230"
                stroke="#ef4444" strokeWidth="2" />
              <line x1="110" y1="130" x2="190" y2="170"
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3" />
              <text x="55" y="75" fill="#ef4444" fontSize="11">M</text>
              <text x="155" y="75" fill="#ef4444" fontSize="11">M</text>
              <text x="115" y="220" fill="#ef4444" fontSize="11">M</text>
              <text x="175" y="180" fill="#3b82f6" fontSize="11">V</text>
              <text x="110" y="265" fill="#22c55e" fontSize="12"
                textAnchor="middle">|3-1|=2</text>

              {/* Invalid vertex: MMVV (violates Maekawa) */}
              <text x="360" y="20" fill="var(--color-text)" fontSize="13"
                fontWeight="600" textAnchor="middle">MMVV (Invalid)</text>
              <circle cx="360" cy="130" r="4" fill="var(--color-primary)" />
              <line x1="360" y1="130" x2="310" y2="60"
                stroke="#ef4444" strokeWidth="2" />
              <line x1="360" y1="130" x2="410" y2="60"
                stroke="#ef4444" strokeWidth="2" />
              <line x1="360" y1="130" x2="310" y2="200"
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3" />
              <line x1="360" y1="130" x2="410" y2="200"
                stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3" />
              <text x="305" y="75" fill="#ef4444" fontSize="11">M</text>
              <text x="405" y="75" fill="#ef4444" fontSize="11">M</text>
              <text x="305" y="195" fill="#3b82f6" fontSize="11">V</text>
              <text x="405" y="195" fill="#3b82f6" fontSize="11">V</text>
              <text x="360" y="265" fill="#ef4444" fontSize="12"
                textAnchor="middle">|2-2|=0 (fails)</text>
            </svg>
            <p className="diagram-caption">
              Left: Valid MMMV vertex (satisfies Maekawa). Right: Invalid MMVV vertex
              (|M-V|=0, violates Maekawa&apos;s |M-V|=2 requirement).
            </p>
          </div>
        </section>

        <section className="theorem-section">
          <h2>Vertex Validity &amp; The Crimping Algorithm</h2>
          <p>
            Satisfying Maekawa is <em>necessary</em> but not <em>sufficient</em> for
            flat-foldability. For degree-6 and higher vertices, even Maekawa-satisfying
            assignments can fail due to <strong>layer self-intersection</strong>.
          </p>
          <p>
            The <strong>crimping algorithm</strong> tests validity:
          </p>
          <div className="corollary-list">
            <div className="corollary">
              <h4>Step 1: Find smallest angle</h4>
              <p>
                Locate the smallest angle sector between two consecutive fold lines
                around the vertex.
              </p>
            </div>
            <div className="corollary">
              <h4>Step 2: Check fold types</h4>
              <p>
                If the two folds bounding the smallest sector are <em>opposite</em>
                types (one M, one V), they can be &ldquo;crimped&rdquo; together.
              </p>
            </div>
            <div className="corollary">
              <h4>Step 3: Crimp and reduce</h4>
              <p>
                Remove the two folds, merge adjacent angle sectors, reducing vertex
                degree by 2. Repeat until only 2 folds remain (valid) or same-type
                folds bound the smallest angle (invalid).
              </p>
            </div>
          </div>
        </section>

        <section className="theorem-section">
          <h2>Example: Crimping a Degree-6 Vertex</h2>
          <div className="theorem-diagram">
            <svg viewBox="0 0 500 220" className="diagram-svg">
              {/* Step 1: degree 6 */}
              <text x="80" y="15" fill="var(--color-text)" fontSize="11"
                textAnchor="middle">Degree 6</text>
              <circle cx="80" cy="110" r="3" fill="var(--color-primary)" />
              <line x1="80" y1="110" x2="80" y2="40" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="80" y1="110" x2="130" y2="60" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="80" y1="110" x2="130" y2="150" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="80" y1="110" x2="80" y2="190" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="80" y1="110" x2="30" y2="150" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="80" y1="110" x2="30" y2="60" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="80" y="208" fill="var(--color-text-muted)" fontSize="10"
                textAnchor="middle">MMVMMV</text>

              {/* Arrow */}
              <text x="175" y="110" fill="var(--color-text-muted)" fontSize="16">&#8594;</text>
              <text x="175" y="130" fill="var(--color-text-muted)" fontSize="9"
                textAnchor="middle">crimp</text>

              {/* Step 2: degree 4 */}
              <text x="260" y="15" fill="var(--color-text)" fontSize="11"
                textAnchor="middle">Degree 4</text>
              <circle cx="260" cy="110" r="3" fill="var(--color-primary)" />
              <line x1="260" y1="110" x2="260" y2="40" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="260" y1="110" x2="310" y2="150" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="260" y1="110" x2="260" y2="190" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="260" y1="110" x2="210" y2="60" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="260" y="208" fill="var(--color-text-muted)" fontSize="10"
                textAnchor="middle">MMMV</text>

              {/* Arrow */}
              <text x="350" y="110" fill="var(--color-text-muted)" fontSize="16">&#8594;</text>
              <text x="350" y="130" fill="var(--color-text-muted)" fontSize="9"
                textAnchor="middle">crimp</text>

              {/* Step 3: degree 2 (done) */}
              <text x="430" y="15" fill="var(--color-text)" fontSize="11"
                textAnchor="middle">Degree 2</text>
              <circle cx="430" cy="110" r="3" fill="var(--color-primary)" />
              <line x1="430" y1="110" x2="430" y2="40" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="430" y1="110" x2="430" y2="190" stroke="#ef4444" strokeWidth="1.5" />
              <text x="430" y="208" fill="#22c55e" fontSize="11"
                textAnchor="middle">Valid!</text>
            </svg>
            <p className="diagram-caption">
              A degree-6 MMVMMV vertex is reduced by crimping adjacent opposite-type
              folds until only 2 remain, proving flat-foldability.
            </p>
          </div>
        </section>

        <section className="theorem-section">
          <h2>Invalid Example</h2>
          <p>
            Consider a degree-6 vertex with type <strong>MMMVVV</strong> and equal
            angles (60&deg; each). After one crimp (removing an MV pair at the boundary),
            the remaining vertex has type MMVV with the smallest angle bounded by
            two folds of the <em>same type</em>. The crimping algorithm fails, proving
            this arrangement is invalid for flat-folding.
          </p>
          <div className="theorem-formula theorem-formula-sm">
            MMMVVV &#8594; crimp &#8594; MMVV &#8594; same-type boundary &#8594; INVALID
          </div>
        </section>

        <section className="theorem-section">
          <h2>Relationship to Other Theorems</h2>
          <div className="corollary-list">
            <div className="corollary">
              <h4>Maekawa&apos;s Theorem</h4>
              <p>
                Constrains the <em>count</em> of M and V folds (|M-V|=2). This is a
                prerequisite for vertex validity.
              </p>
            </div>
            <div className="corollary">
              <h4>Kawasaki-Justin Theorem</h4>
              <p>
                Constrains the <em>angles</em> between folds (alternating sums = 180&deg;).
                Vertex validity adds the layer ordering constraint on top.
              </p>
            </div>
            <div className="corollary">
              <h4>Justin&apos;s Theorem (General)</h4>
              <p>
                Provides the complete necessary and sufficient conditions for flat-foldability,
                incorporating both angle and layer ordering constraints.
              </p>
            </div>
          </div>
        </section>

        <section className="theorem-section">
          <h2>Application in This Tool</h2>
          <p>
            The validation system computes vertex types for every interior vertex and
            runs the crimping algorithm to verify layer ordering. Patterns that fail
            vertex validity would self-intersect when folded, making physical assembly
            impossible.
          </p>
          <p>
            For simple shapes (box, pyramid), most vertices are on the perimeter and
            exempt. For complex crease patterns with interior vertices, this validation
            becomes critical.
          </p>
        </section>

        <section className="theorem-section">
          <h2>References</h2>
          <ul className="reference-list">
            <li>
              Justin, J. (1997). &ldquo;Towards a Mathematical Theory of Origami&rdquo;
              - 2nd International Meeting of Origami Science
            </li>
            <li>
              Hull, T. (1994). &ldquo;On the Mathematics of Flat Origamis&rdquo; -
              Congressus Numerantium, 100, 215-224
            </li>
            <li>
              Demaine, E.D. &amp; O&apos;Rourke, J. (2007). <em>Geometric Folding
              Algorithms</em>. Cambridge University Press.
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
