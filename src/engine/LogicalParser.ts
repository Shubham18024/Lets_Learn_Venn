export type RegionState = {
  A: boolean;
  B: boolean;
  C: boolean;
};

export class LogicalParser {
  static evaluate(latex: string, region: RegionState): boolean {
    if (!latex || !latex.trim()) return false;
    
    // Normalization Step
    let expr = latex
      .replace(/\\cup/g, '|')
      .replace(/\\cap/g, '&')
      .replace(/\\setminus/g, '-')
      .replace(/\\Delta/g, '^') 
      .replace(/\\oplus/g, '^')
      .replace(/\^\{?c\}?/gi, "'")       // Matches ^c, ^C, ^{c}, ^{C}
      .replace(/\^\{?'\}?/g, "'")       // Matches ^' or ^{'}
      .replace(/\\complement/gi, "'")
      .replace(/\\mathrm\{/g, '')       // Strip formatting blocks
      .replace(/\\operatorname\{/g, '')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\(/g, '(')
      .replace(/\)/g, ')')
      .replace(/[\s\,\\:\}\{]/g, ''); // strip spaces, slashes and braces left over

    try {
      const tokens = this.tokenize(expr);
      const ast = this.parse(tokens);
      return this.evalAst(ast, region);
    } catch (e) {
      return false;
    }
  }

  static tokenize(str: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < str.length) {
      const char = str[i];
      if (/[a-zA-Z]/.test(char)) { 
        tokens.push(char.toUpperCase()); // Convert 'b' to 'B'
      } else if (/[|&\-^'()]/.test(char)) {
        tokens.push(char);
      }
      i++;
    }

    // Implicit intersection
    const finalTokens: string[] = [];
    for (let j = 0; j < tokens.length; j++) {
      if (j > 0) {
        const prev = tokens[j - 1];
        const curr = tokens[j];
        const prevIsOperandOrClose = /[A-Z)']/.test(prev);
        const currIsOperandOrOpen = /[A-Z(]/.test(curr);
        
        if (prevIsOperandOrClose && currIsOperandOrOpen && curr !== "'") {
             finalTokens.push('&');
        }
      }
      finalTokens.push(tokens[j]);
    }

    return finalTokens;
  }

  static parse(tokens: string[]): any {
    let pos = 0;

    function parseExpression(): any {
      let node = parseTerm();
      while (pos < tokens.length && (tokens[pos] === '|' || tokens[pos] === '^' || tokens[pos] === '-')) {
        const op = tokens[pos++];
        const right = parseTerm();
        node = { type: 'Binary', op, left: node, right };
      }
      return node;
    }

    function parseTerm(): any {
      let node = parseFactor();
      while (pos < tokens.length && tokens[pos] === '&') {
        const op = tokens[pos++];
        const right = parseFactor();
        node = { type: 'Binary', op, left: node, right };
      }
      return node;
    }

    function parseFactor(): any {
      let node;
      if (pos < tokens.length && tokens[pos] === '(') {
        pos++;
        node = parseExpression();
        pos++;
      } else if (pos < tokens.length && /[A-Z]/.test(tokens[pos])) {
        node = { type: 'Variable', name: tokens[pos++] };
      } else {
        throw new Error('Unexpected token');
      }

      while (pos < tokens.length && tokens[pos] === "'") {
        pos++;
        node = { type: 'Unary', op: "'", child: node };
      }
      return node;
    }

    return parseExpression();
  }

  static evalAst(node: any, region: RegionState): boolean {
    if (!node) return false;
    if (node.type === 'Variable') {
      return (region as any)[node.name] || false;
    }
    if (node.type === 'Unary' && node.op === "'") {
      return !this.evalAst(node.child, region);
    }
    if (node.type === 'Binary') {
      const left = this.evalAst(node.left, region);
      const right = this.evalAst(node.right, region);
      switch (node.op) {
        case '|': return left || right;
        case '&': return left && right;
        case '-': return left && !right;
        case '^': return left !== right;
      }
    }
    return false;
  }

  // Linear algebra helper: map a formula to a row vector of 8 boolean truths
  static getRegionTruthVector(latex: string): number[] {
    const vector: number[] = [];
    const booleans = [true, false];
    
    // We strictly use 3 sets (A, B, C) for general matrix builder
    booleans.forEach(a => {
      booleans.forEach(b => {
        booleans.forEach(c => {
           vector.push(this.evaluate(latex, { A: a, B: b, C: c }) ? 1 : 0);
        });
      });
    });
    return vector;
  }
}
