/**
 * 安全的公式求值器
 * 替代 new Function()，防止代码注入和 RCE
 */

interface SpreadsheetData {
  [key: string]: {
    value: string;
    formula?: string;
  };
}

// 允许的数学函数
const ALLOWED_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  SUM: (...args) => args.reduce((a, b) => a + b, 0),
  AVERAGE: (...args) => args.reduce((a, b) => a + b, 0) / args.length,
  MAX: (...args) => Math.max(...args),
  MIN: (...args) => Math.min(...args),
  COUNT: (...args) => args.length,
  ABS: (x) => Math.abs(x),
  ROUND: (x, digits = 0) => {
    const factor = Math.pow(10, digits);
    return Math.round(x * factor) / factor;
  },
  FLOOR: (x) => Math.floor(x),
  CEILING: (x) => Math.ceil(x),
  SQRT: (x) => Math.sqrt(x),
  POWER: (x, y) => Math.pow(x, y),
  LOG: (x, base = 10) => Math.log(x) / Math.log(base),
  LN: (x) => Math.log(x),
  EXP: (x) => Math.exp(x),
  SIN: (x) => Math.sin(x),
  COS: (x) => Math.cos(x),
  TAN: (x) => Math.tan(x),
  PI: () => Math.PI,
};

// 危险模式黑名单
const DANGEROUS_PATTERNS = [
  /function\s*\(/i,
  /=>\s*\{/,
  /eval\s*\(/i,
  /new\s+Function/i,
  /setTimeout\s*\(/i,
  /setInterval\s*\(/i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /WebSocket/i,
  /import\s*\(/i,
  /require\s*\(/i,
  /process\./i,
  /window\./i,
  /document\./i,
  /localStorage/i,
  /sessionStorage/i,
  /alert\s*\(/i,
  /confirm\s*\(/i,
  /prompt\s*\(/i,
  /<script/i,
  /javascript:/i,
];

/**
 * 检查公式是否包含危险模式
 */
function containsDangerousPattern(formula: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(formula));
}

/**
 * 解析单元格引用（如 A1, B2）
 */
function parseCellReference(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const colLetters = match[1];
  const row = parseInt(match[2], 10) - 1; // 0-based

  let col = 0;
  for (let i = 0; i < colLetters.length; i++) {
    col = col * 26 + (colLetters.charCodeAt(i) - 65);
  }

  return { row, col };
}

/**
 * 解析范围引用（如 A1:B5）
 */
function parseRange(range: string): string[] | null {
  const match = range.match(/^([A-Z]+\d+):([A-Z]+\d+)$/);
  if (!match) return null;

  const start = parseCellReference(match[1]);
  const end = parseCellReference(match[2]);
  if (!start || !end) return null;

  const cells: string[] = [];
  for (let row = start.row; row <= end.row; row++) {
    for (let col = start.col; col <= end.col; col++) {
      const colLetter = String.fromCharCode(65 + col);
      cells.push(`${colLetter}${row + 1}`);
    }
  }
  return cells;
}

/**
 * 获取单元格的值
 */
function getCellValue(cellId: string, data: SpreadsheetData): number {
  const cell = data[cellId];
  if (!cell) return 0;

  const value = cell.formula
    ? evaluateFormulaSafe(cell.formula, data)
    : cell.value;

  const numValue = Number(value);
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * 安全的公式求值
 */
function evaluateFormulaSafe(formula: string, data: SpreadsheetData): string {
  // 移除开头的等号
  const expr = formula.startsWith("=") ? formula.slice(1) : formula;

  // 检查危险模式
  if (containsDangerousPattern(expr)) {
    throw new Error("Formula contains dangerous patterns");
  }

  try {
    const result = evaluateExpression(expr, data);
    return String(result);
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR";
  }
}

/**
 * 求值表达式
 */
function evaluateExpression(expr: string, data: SpreadsheetData): number {
  // 先处理函数调用
  let processedExpr = expr;

  // 处理函数调用（如 SUM(A1:B5)）
  const functionRegex = /([A-Z]+)\s*\(([^)]+)\)/g;
  processedExpr = processedExpr.replace(functionRegex, (match, funcName, args) => {
    const func = ALLOWED_FUNCTIONS[funcName.toUpperCase()];
    if (!func) {
      throw new Error(`Unknown function: ${funcName}`);
    }

    // 解析参数
    const argValues = parseArguments(args, data);
    const result = func(...argValues);
    return String(result);
  });

  // 处理单元格引用
  const cellRefRegex = /([A-Z]+\d+)/g;
  processedExpr = processedExpr.replace(cellRefRegex, (match) => {
    const value = getCellValue(match, data);
    return String(value);
  });

  // 现在应该只剩下数字和运算符
  // 使用安全的数学求值
  return safeMathEvaluate(processedExpr);
}

/**
 * 解析函数参数
 */
function parseArguments(args: string, data: SpreadsheetData): number[] {
  const values: number[] = [];
  const parts = args.split(",").map((p) => p.trim());

  for (const part of parts) {
    // 检查是否是范围
    const range = parseRange(part);
    if (range) {
      for (const cellId of range) {
        values.push(getCellValue(cellId, data));
      }
      continue;
    }

    // 检查是否是单元格引用
    const cellRef = parseCellReference(part);
    if (cellRef) {
      values.push(getCellValue(part, data));
      continue;
    }

    // 尝试解析为数字
    const numValue = Number(part);
    if (!isNaN(numValue)) {
      values.push(numValue);
      continue;
    }

    // 如果都无法解析，返回 0
    values.push(0);
  }

  return values;
}

/**
 * 安全的数学表达式求值
 * 只支持基本数学运算，不使用 eval 或 new Function
 */
function safeMathEvaluate(expr: string): number {
  // 移除所有空白字符
  expr = expr.replace(/\s/g, "");

  // 验证只包含允许的字符
  if (!/^[\d+\-*/().]+$/.test(expr)) {
    throw new Error("Invalid characters in expression");
  }

  // 使用栈进行表达式求值
  const tokens = tokenize(expr);
  return evaluateTokens(tokens);
}

/**
 * 将表达式分词
 */
function tokenize(expr: string): (number | string)[] {
  const tokens: (number | string)[] = [];
  let current = "";

  for (const char of expr) {
    if (/[\d.]/.test(char)) {
      current += char;
    } else {
      if (current) {
        tokens.push(Number(current));
        current = "";
      }
      tokens.push(char);
    }
  }

  if (current) {
    tokens.push(Number(current));
  }

  return tokens;
}

/**
 * 求值分词后的表达式（支持括号）
 */
function evaluateTokens(tokens: (number | string)[]): number {
  // 先处理括号
  const stack: (number | string)[] = [];

  for (const token of tokens) {
    if (token === ")") {
      // 弹出直到左括号
      const subExpr: (number | string)[] = [];
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        subExpr.unshift(stack.pop()!);
      }
      stack.pop(); // 移除左括号
      const result = evaluateSimpleExpression(subExpr);
      stack.push(result);
    } else {
      stack.push(token);
    }
  }

  return evaluateSimpleExpression(stack);
}

/**
 * 求值没有括号的简单表达式
 */
function evaluateSimpleExpression(tokens: (number | string)[]): number {
  if (tokens.length === 0) return 0;
  if (tokens.length === 1) return Number(tokens[0]);

  // 先处理乘除
  const afterMulDiv: (number | string)[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "*" || token === "/") {
      const left = Number(afterMulDiv.pop());
      const right = Number(tokens[i + 1]);
      if (token === "*") {
        afterMulDiv.push(left * right);
      } else {
        afterMulDiv.push(left / right);
      }
      i += 2;
    } else {
      afterMulDiv.push(token);
      i++;
    }
  }

  // 再处理加减
  let result = Number(afterMulDiv[0]);
  for (let j = 1; j < afterMulDiv.length; j += 2) {
    const op = afterMulDiv[j];
    const right = Number(afterMulDiv[j + 1]);
    if (op === "+") {
      result += right;
    } else if (op === "-") {
      result -= right;
    }
  }

  return result;
}

/**
 * 创建安全的公式求值函数
 */
export function createSafeFormulaEvaluator() {
  return (formula: string, data: SpreadsheetData): string => {
    return evaluateFormulaSafe(formula, data);
  };
}
