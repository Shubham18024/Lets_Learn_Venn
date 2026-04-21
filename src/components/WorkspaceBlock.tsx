import React, { useMemo } from 'react';
import { toPng, toSvg } from 'html-to-image';
import { Download, Trash2 } from 'lucide-react';
import { LogicalParser } from '../engine/LogicalParser';
import type { RegionState } from '../engine/LogicalParser';
import { BooleanMinimizer } from '../engine/Minimizer';
import { MathLiveInput } from './MathLiveInput';

interface WorkspaceBlockProps {
  id: string;
  expression: string;
  numSets: 2 | 3;
  colorHex: string;
  onUpdateExpression: (expr: string) => void;
  onChangeSets: (sets: 2 | 3) => void;
  onRemove: () => void;
}

export const WorkspaceBlock: React.FC<WorkspaceBlockProps> = ({ id, expression, numSets, colorHex, onUpdateExpression, onChangeSets, onRemove }) => {
  // Region generator mapping identical to Boolean Minimizer & LogicalParser
  const regions: RegionState[] = useMemo(() => {
    const list: RegionState[] = [];
    const booleans = [true, false];
    booleans.forEach(a => booleans.forEach(b => booleans.forEach(c => list.push({ A: a, B: b, C: c }))));
    return list;
  }, []);

  const activeRegions = useMemo(() => {
    return regions.map(region => LogicalParser.evaluate(expression, region));
  }, [expression, regions]);

  // Dimensions
  const rectSize = 400;
  const A_cx = 150, A_cy = 160, r = 90;
  const B_cx = 250, B_cy = 160;
  const C_cx = 200, C_cy = 246.6;

  // Mathematical exact click mapper!
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svgBounds = e.currentTarget.getBoundingClientRect();
    const scaleX = rectSize / svgBounds.width;
    const scaleY = rectSize / svgBounds.height;
    
    // Pixel coordinate converted exactly into the 400x400 SVG local space
    const pointX = (e.clientX - svgBounds.left) * scaleX;
    const pointY = (e.clientY - svgBounds.top) * scaleY;

    // Radius boundary intersections (Distance Formula)
    const inA = Math.pow(pointX - A_cx, 2) + Math.pow(pointY - A_cy, 2) <= r * r;
    const inB = Math.pow(pointX - B_cx, 2) + Math.pow(pointY - B_cy, 2) <= r * r;
    const inC = (numSets === 3) 
      ? Math.pow(pointX - C_cx, 2) + Math.pow(pointY - C_cy, 2) <= r * r 
      : false;

    // Find the matching iteration index mapped to `activeRegions`
    let targetIndex = -1;
    for (let i = 0; i < 8; i++) {
        if (regions[i].A === inA && regions[i].B === inB && regions[i].C === inC) {
            targetIndex = i; break;
        }
    }

    if (targetIndex !== -1) {
       // Deep copy active regions so we can mutate and minimize
       const nextVector = [...activeRegions];
       // No arbitrary limit slice needed properly anymore!
       nextVector[targetIndex] = !nextVector[targetIndex];
       
       const numberVer = nextVector.map(p => p ? 1 : 0);
       let nextExpression = BooleanMinimizer.minimize(numberVer);
       
       if (numSets === 2) {
         nextExpression = nextExpression.replace(/ \\cap \(C\^c\)/g, '').replace(/\(C\^c\) \\cap /g, '').replace(/ \\cap C\^c/g, '').replace(/C\^c \\cap /g, '');
       }
       onUpdateExpression(nextExpression);
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    const el = document.getElementById(`venn-export-${id}`);
    if (!el) return;
    try {
      const dataUrl = format === 'png' 
        ? await toPng(el, { backgroundColor: '#1a1b23' }) 
        : await toSvg(el, { backgroundColor: '#1a1b23' });
      const link = document.createElement('a');
      link.download = `venn-${id}-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch(e) { console.error('Export Error', e); }
  };

  const renderRegion = (region: RegionState, isActive: boolean, index: number) => {
    if (numSets === 2 && region.C) return null; 

    // Render transparent default or highlighted custom color
    const fill = isActive ? colorHex : 'transparent';
    const filter = isActive ? `url(#glow-${id})` : '';
    
    // We bind a full screen rect natively without onClick DOM overlaps!
    let element = <rect width="100%" height="100%" fill={fill} filter={filter} className="venn-path stroke-none" />;

    const applyMask = (m_id: string, inner: React.ReactNode) => (
      <g mask={`url(#${m_id})`} key={m_id}>{inner}</g>
    );
    const applyClip = (c_id: string, inner: React.ReactNode) => (
      <g clipPath={`url(#${c_id})`} key={c_id}>{inner}</g>
    );

    if (region.A) element = applyClip(`clip-A-${id}`, element); else element = applyMask(`mask-not-A-${id}`, element);
    if (region.B) element = applyClip(`clip-B-${id}`, element); else element = applyMask(`mask-not-B-${id}`, element);
    if (numSets === 3) {
      if (region.C) element = applyClip(`clip-C-${id}`, element); else element = applyMask(`mask-not-C-${id}`, element);
    }

    return <React.Fragment key={`region-${index}`}>{element}</React.Fragment>;
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '500px' }}>
      
      {/* Top Header / Editor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <MathLiveInput value={expression} onChange={onUpdateExpression} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '12px' }}>
           <button onClick={() => onChangeSets(2)} className="btn" style={{ padding: '0.6rem', border: 'none', background: numSets === 2 ? 'rgba(167, 139, 250, 0.3)' : 'transparent' }}>2 Sets</button>
           <button onClick={() => onChangeSets(3)} className="btn" style={{ padding: '0.6rem', border: 'none', background: numSets === 3 ? 'rgba(167, 139, 250, 0.3)' : 'transparent' }}>3 Sets</button>
        </div>

        <button onClick={onRemove} className="btn" style={{ padding: '0.8rem', background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <Trash2 size={20} color="#f43f5e" />
        </button>
      </div>

      {/* Snapshot Wrapper — expression header + diagram in one exportable block */}
      <div id={`venn-export-${id}`} style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#1a1b23', display: 'flex', flexDirection: 'column' }}>
        
        {/* Expression header row — always visible, captured in export */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
          {/* @ts-ignore */}
          <math-field style={{ fontSize: '1.3rem', color: '#fff', border: 'none', background: 'transparent', pointerEvents: 'none' }} readOnly>
            {expression}
          {/* @ts-ignore */}
          </math-field>
        </div>

        {/* Divider line between expression and diagram */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        {/* The Venn SVG */}
        <svg 
          viewBox={`0 0 ${rectSize} ${rectSize}`} 
          className="venn-svg cursor-crosshair"
          onClick={handleSvgClick}
          style={{ display: 'block', width: '100%' }}
        >
          <defs>
            <filter id={`glow-${id}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <circle id={`circle-A-${id}`} cx={A_cx} cy={A_cy} r={r} />
            <circle id={`circle-B-${id}`} cx={B_cx} cy={B_cy} r={r} />
            {numSets === 3 && <circle id={`circle-C-${id}`} cx={C_cx} cy={C_cy} r={r} />}

            <clipPath id={`clip-A-${id}`}><use href={`#circle-A-${id}`} /></clipPath>
            <clipPath id={`clip-B-${id}`}><use href={`#circle-B-${id}`} /></clipPath>
            {numSets === 3 && <clipPath id={`clip-C-${id}`}><use href={`#circle-C-${id}`} /></clipPath>}

            <mask id={`mask-not-A-${id}`}><rect x="0" y="0" width="100%" height="100%" fill="white" /><use href={`#circle-A-${id}`} fill="black" /></mask>
            <mask id={`mask-not-B-${id}`}><rect x="0" y="0" width="100%" height="100%" fill="white" /><use href={`#circle-B-${id}`} fill="black" /></mask>
            {numSets === 3 && (
              <mask id={`mask-not-C-${id}`}><rect x="0" y="0" width="100%" height="100%" fill="white" /><use href={`#circle-C-${id}`} fill="black" /></mask>
            )}
          </defs>

          {/* Universal Set boundary */}
          <rect x="20" y="20" width={rectSize - 40} height={rectSize - 40} rx="16" fill="transparent" stroke="rgba(255,255,255,0.4)" strokeWidth="2" pointerEvents="none" />
          <text x="35" y="55" fill="rgba(255,255,255,0.7)" fontSize="26" fontFamily="Inter, sans-serif" fontWeight="800" pointerEvents="none">S</text>

          {/* Coloured regions */}
          <g stroke="none">
            {regions.map((region, i) => renderRegion(region, activeRegions[i], i))}
          </g>

          {/* Circle outlines */}
          <use href={`#circle-A-${id}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" pointerEvents="none" />
          <use href={`#circle-B-${id}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" pointerEvents="none"/>
          {numSets === 3 && <use href={`#circle-C-${id}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" pointerEvents="none"/>}
          
          <text x={A_cx - 60} y={A_cy - 60} fill="white" fontSize="24" fontFamily="Inter, sans-serif" fontWeight="bold" pointerEvents="none">A</text>
          <text x={B_cx + 40} y={B_cy - 60} fill="white" fontSize="24" fontFamily="Inter, sans-serif" fontWeight="bold" pointerEvents="none">B</text>
          {numSets === 3 && <text x={C_cx - 10} y={C_cy + 90} fill="white" fontSize="24" fontFamily="Inter, sans-serif" fontWeight="bold" pointerEvents="none">C</text>}
        </svg>
      </div>

      {/* Downloader Footer */}
      <div className="controls-bar" style={{ marginTop: '0' }}>
        <button className="btn" onClick={() => handleDownload('png')}>
          <Download size={18} /> PNG
        </button>
        <button className="btn" onClick={() => handleDownload('svg')}>
          <Download size={18} /> SVG
        </button>
      </div>

    </div>
  );
};
