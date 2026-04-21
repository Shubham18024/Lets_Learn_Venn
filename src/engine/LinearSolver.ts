export class LinearSolver {
  // Solves a system of equations for matrix [A | B]
  // Extracted target variables will be fixed or deduced if possible.
  static solve(matrix: number[][]): number[] | null {
    if (matrix.length === 0) return null;
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Convert to RREF
    let lead = 0;
    for (let r = 0; r < rows; r++) {
      if (cols <= lead) return matrix.map(row => row[cols - 1]);
      
      let i = r;
      while (matrix[i][lead] === 0) {
        i++;
        if (rows === i) {
          i = r;
          lead++;
          if (cols === lead) return matrix.map(row => row[cols - 1]);
        }
      }

      // Swap rows
      const temp = matrix[i];
      matrix[i] = matrix[r];
      matrix[r] = temp;

      const val = matrix[r][lead];
      for (let j = 0; j < cols; j++) {
        matrix[r][j] /= val;
      }

      for (let i = 0; i < rows; i++) {
        if (i !== r) {
          const val = matrix[i][lead];
          for (let j = 0; j < cols; j++) {
            matrix[i][j] -= val * matrix[r][j];
          }
        }
      }
      lead++;
    }

    return null; 
  }

  // Helper: given user constraints [{ vector: [8-bits], value: 10 }, ...]
  // and a target vector [8-bits]
  // We deduce if the target vector is uniquely solvable!
  static evaluateTarget(constraints: {vector: number[], value: number}[], target: number[]): number | null {
    // We build a matrix with rows: constraints.
    // Plus one final row for Target: target = X.
    // However, linear deduction means asking: is `target` in the span of the constraint vectors?
    // An easier way to do this in software: 
    // Frame constraints as [ A | b ]. Turn to RREF.
    
    // We construct a matrix of dimension: constraints x 9.
    const matrix = constraints.map(c => [...c.vector, c.value]);

    this.solve(matrix);

    // After RREF, check if any row is 0=nonzero (contradiction)
    for (let r=0; r<matrix.length; r++) {
      const allZeros = matrix[r].slice(0, 8).every(v => Math.abs(v) < 1e-9);
      if (allZeros && Math.abs(matrix[r][8]) > 1e-9) return null; // Unsolvable / Contradiction
    }

    // Is the target in the row space?
    // We try to eliminate the target vector using the RREF matrix.
    let currentTarget = [...target];
    let currentValue = 0;

    for (let r = 0; r < matrix.length; r++) {
      // find the leading 1 (pivot)
      let pivotIndex = -1;
      for (let c = 0; c < 8; c++) {
        if (Math.abs(matrix[r][c] - 1) < 1e-9) {
          // Verify it's actually the pivot (all left are 0)
          let valid = true;
          for(let k=0; k<c; k++) if(Math.abs(matrix[r][k]) > 1e-9) valid = false;
          if (valid) {
            pivotIndex = c;
            break;
          }
        }
      }

      if (pivotIndex !== -1 && Math.abs(currentTarget[pivotIndex]) > 1e-9) {
        const factor = currentTarget[pivotIndex];
        for (let c = 0; c < 8; c++) {
          currentTarget[c] -= factor * matrix[r][c];
        }
        currentValue += factor * matrix[r][8];
      }
    }

    // If target is completely zeroed out, it means we fully resolved it!
    const isZeroed = currentTarget.every(v => Math.abs(v) < 1e-9);
    if (isZeroed) return currentValue;

    // Otherwise, insufficient information!
    return null;
  }
}
