import { useState } from 'react';
import { Plus } from 'lucide-react';

import { WorkspaceBlock } from './components/WorkspaceBlock';
import { Guide } from './components/Guide';

type DiagramData = {
  id: string;
  expression: string;
  numSets: 2 | 3;
  colorHex: string;
};

// Vibrant colors for dynamic instances
const COLORS = ['#2563EB', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

function App() {
  const [diagrams, setDiagrams] = useState<DiagramData[]>([
    { id: 'initial', expression: 'A \\cup B', numSets: 3, colorHex: COLORS[0] }
  ]);

  const addDiagram = () => {
    if (diagrams.length >= 5) return;
    setDiagrams([...diagrams, {
      id: Math.random().toString(36).substring(7),
      expression: 'A',
      numSets: 3,
      colorHex: COLORS[diagrams.length]
    }]);
  };

  const removeDiagram = (id: string) => {
    setDiagrams(diagrams.filter(d => d.id !== id));
  };

  const updateExpression = (id: string, newExpr: string) => {
    setDiagrams(diagrams.map(d => d.id === id ? { ...d, expression: newExpr } : d));
  };

  const setGlobalSets = (id: string, numSets: 2 | 3) => {
    setDiagrams(diagrams.map(d => d.id === id ? { ...d, numSets } : d));
  };



  return (
    <div className="app-container" style={{ maxWidth: '1600px' }}>
      <header className="header">
        <h1>Let's Learn Venn</h1>
        <p>Interactive Set Theory logic visualizer Workspace</p>
      </header>

      {/* Dynamic Grid Layout for Multiple Diagrams */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '100%', justifyContent: 'center' }}>
        {diagrams.map(d => (
          <WorkspaceBlock 
            key={d.id}
            id={d.id}
            expression={d.expression}
            numSets={d.numSets}
            colorHex={d.colorHex}
            onUpdateExpression={(expr) => updateExpression(d.id, expr)}
            onChangeSets={(val) => setGlobalSets(d.id, val)}
            onRemove={() => removeDiagram(d.id)}
          />
        ))}

        {/* Combiner Panel directly inline with Add button block */}
        {diagrams.length < 5 && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '500px', minHeight: '400px', gap: '2rem', borderStyle: 'dashed' }}>
            <div onClick={addDiagram} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Plus size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', fontSize: '1.2rem' }}>Add Diagram ({diagrams.length}/5)</p>
            </div>

            {diagrams.length >= 2 && (
              <div style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <p style={{ margin: 0, textAlign: 'center', color: '#a78bfa', fontWeight: 'bold' }}>Combine Diagrams</p>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select id="merge1" style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: '#333', color: '#fff', border: 'none' }}>
                      {diagrams.map((d, i) => <option key={d.id} value={i}>Diagram {i+1}</option>)}
                    </select>
                    <select id="merge2" style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: '#333', color: '#fff', border: 'none' }} defaultValue={1}>
                      {diagrams.map((d, i) => <option key={d.id} value={i}>Diagram {i+1}</option>)}
                    </select>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn" onClick={() => {
                       const d1 = diagrams[parseInt((document.getElementById('merge1') as HTMLSelectElement).value)];
                       const d2 = diagrams[parseInt((document.getElementById('merge2') as HTMLSelectElement).value)];
                       if(d1 && d2) {
                          setDiagrams([...diagrams, { id: Math.random().toString(36).substring(7), expression: `(${d1.expression}) \\cup (${d2.expression})`, numSets: 3, colorHex: COLORS[diagrams.length] }]);
                       }
                    }}>Union $\cup$</button>
                    <button className="btn" onClick={() => {
                       const d1 = diagrams[parseInt((document.getElementById('merge1') as HTMLSelectElement).value)];
                       const d2 = diagrams[parseInt((document.getElementById('merge2') as HTMLSelectElement).value)];
                       if(d1 && d2) {
                          setDiagrams([...diagrams, { id: Math.random().toString(36).substring(7), expression: `(${d1.expression}) \\cap (${d2.expression})`, numSets: 3, colorHex: COLORS[diagrams.length] }]);
                       }
                    }}>Intersect $\cap$</button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Guide />
    </div>
  );
}

export default App;
