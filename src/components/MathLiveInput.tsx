import React, { useEffect, useRef, useState } from 'react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';

interface MathLiveInputProps {
  value: string;
  onChange: (latex: string) => void;
}

// Ensure the web component types exist for React


export const MathLiveInput: React.FC<MathLiveInputProps> = ({ value, onChange }) => {
  const mfRef = useRef<MathfieldElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const mf = mfRef.current;
    if (mf) {
      // Configuration for typing aliases
      mf.mathVirtualKeyboardPolicy = 'manual'; // Hide virtual keyboard unless clicked
      mf.smartFence = false;
      
      // Inject aliases correctly
      mf.inlineShortcuts = {
        ...mf.inlineShortcuts,
        'u': '\\cup',
        'union': '\\cup',
        'i': '\\cap',
        'intersection': '\\cap',
        'c': '^c',
        'comp': '^c',
        'sym': '\\Delta',
        'diff': '\\setminus'
      };

      const handleInput = (ev: Event) => {
        const target = ev.target as MathfieldElement;
        const newLatex = target.value;
        setInternalValue(newLatex);
        onChange(newLatex);
      };

      mf.addEventListener('input', handleInput);
      return () => {
        mf.removeEventListener('input', handleInput);
      };
    }
  }, [onChange]);

  // Sync external changes (though mostly it will be driven from inside)
  useEffect(() => {
    if (mfRef.current && value !== internalValue) {
      mfRef.current.value = value;
      setInternalValue(value);
    }
  }, [value, internalValue]);

  return (
    <div className="math-input-wrapper">
      {/* @ts-ignore */}
      <math-field 
        ref={mfRef} 
        style={{ '--keycap-background': '#333' } as React.CSSProperties}
      >
        {value}
      {/* @ts-ignore */}
      </math-field>
    </div>
  );
};
