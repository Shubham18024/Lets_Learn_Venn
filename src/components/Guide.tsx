import { BookOpen, AlertCircle } from 'lucide-react';

export const Guide = () => {
  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '1120px', marginTop: '4rem', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <BookOpen size={26} color="#ec4899" />
        <h2 style={{ margin: 0, fontSize: '1.6rem' }}>How to Use Math Sets</h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Desmos-Style Keyboard Shortcuts</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-secondary)' }}>
            <li><strong>Union ( $A \cup B$ )</strong>: Type <code>u</code> or <code>union</code></li>
            <li><strong>Intersection ( $A \cap B$ )</strong>: Type <code>i</code> or <code>intersection</code></li>
            <li><strong>Complement ( $A^c$ )</strong>: Type <code>'</code>, <code>^c</code> or <code>comp</code></li>
            <li><strong>Difference ( $A \setminus B$ )</strong>: Type <code>diff</code> or <code>-</code></li>
            <li><strong>Symmetric Diff ( $A \Delta B$ )</strong>: Type <code>sym</code></li>
          </ul>
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <h3 style={{ color: '#f472b6', marginBottom: '1rem' }}>Interactive Venn Diagram Features</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
            The visualization boundary square represents the <strong>Universal Set ($S$)</strong>. Computations for components like $A^c$ map perfectly to all universal space surrounding it.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
             <p style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
               <AlertCircle size={18} color="#f472b6" style={{ marginTop: '3px' }}/> 
               <span><strong>Mathematical Touch Integration:</strong> Clicking anywhere on the diagram traces a geometric radius to locate the precise logical region. Our Minimization algorithm will rewrite your click natively into Set Theory automatically!</span>
             </p>
          </div>
        </div>

        <div style={{ flex: '1 1 300px' }}>
           <h3 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Famous Set Rules Examples</h3>
           <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
             Type these into the visualizer to explore mathematical properties:
           </p>
           <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', color: '#fbbf24' }}>
              <li><strong>De Morgan's First Law:</strong> <br/> <code style={{ color: '#fff' }}>(A \cup B)^c = A^c \cap B^c</code></li>
              <li><strong>De Morgan's Second Law:</strong> <br/> <code style={{ color: '#fff' }}>(A \cap B)^c = A^c \cup B^c</code></li>
              <li><strong>Distributive Law:</strong> <br/> <code style={{ color: '#fff' }}>A \cup (B \cap C) = (A \cup B) \cap (A \cup C)</code></li>
              <li><strong>Symmetric Exclusion:</strong> <br/> <code style={{ color: '#fff' }}>A \Delta B = (A \setminus B) \cup (B \setminus A)</code></li>
           </ul>
        </div>
      </div>
    </div>
  );
};
