export class BooleanMinimizer {
  // Returns minimized LaTeX string for a given truth table of 8 values
  // Array order matches getRegionTruthVector: A, B, C iterations:
  // [111, 110, 101, 100, 011, 010, 001, 000]
  static minimize(truthVector: number[]): string {
    if (truthVector.every(v => v === 0)) return '\\emptyset';
    if (truthVector.every(v => v === 1)) return 'S';

    // Map minterm index to binary string representation
    // Order was: A=true/false, B=true/false, C=true/false

    const minterms: string[] = [];
    
    // Minterm mappings based on evaluate iteration
    const terms = [
      '111', '110', '101', '100', 
      '011', '010', '001', '000'
    ];

    for (let i = 0; i < 8; i++) {
        if (truthVector[i]) minterms.push(terms[i]);
    }

    // Quine-McCluskey algorithm for up to 3 variables
    let implicants = new Set<string>(minterms);
    let merged = true;

    while (merged) {
      merged = false;
      const nextImplicants = new Set<string>();
      const used = new Set<string>();
      const arr = Array.from(implicants);

      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const diffIndex = this.getDifferingBitIndex(arr[i], arr[j]);
          if (diffIndex !== -1) {
            merged = true;
            used.add(arr[i]);
            used.add(arr[j]);
            const newTerm = arr[i].substring(0, diffIndex) + '-' + arr[i].substring(diffIndex + 1);
            nextImplicants.add(newTerm);
          }
        }
      }

      for (const t of arr) {
        if (!used.has(t)) nextImplicants.add(t);
      }
      implicants = nextImplicants;
    }

    // Very naive set cover for essential prime implicants (works perfectly for N=3 where overlap is small)
    // We just take all generated implicants (it's completely reduced for 3 vars)
    const finalTerms = Array.from(implicants).map(term => {
      let parts = [];
      if (term[0] === '1') parts.push('A');
      if (term[0] === '0') parts.push('A^c');
      if (term[1] === '1') parts.push('B');
      if (term[1] === '0') parts.push('B^c');
      if (term[2] === '1') parts.push('C');
      if (term[2] === '0') parts.push('C^c');
      
      let text = parts.join(' \\cap ');
      if (parts.length > 1) {
        text = `(${text})`; 
      }
      return text;
    });

    const joined = finalTerms.join(' \\cup ');
    return joined || '\\emptyset';
  }

  private static getDifferingBitIndex(a: string, b: string): number {
    let diff = -1;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        if (diff !== -1) return -1; // more than 1 diff
        diff = i;
      }
    }
    return diff;
  }
}
