const displayElement = document.getElementById('display');
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('clear');
const deleteButton = document.getElementById('delete');
const parenButtons = document.querySelectorAll('[data-paren]');
const sciToggle = document.getElementById('sci-toggle');
const sciPanel = document.getElementById('sci-panel');
const sciButtons = document.querySelectorAll('[data-func]');

let expression = '';

// Update the calculator display
function updateDisplay() {
  displayElement.innerText = expression || '0';
}

// Append character to the expression (with implicit multiplication if needed)
function appendChar(char) {
  const lastChar = expression.slice(-1);
  // If adding a parenthesis or function/PI after a number or ')', insert a '*'
  if (expression.length > 0 && (char.includes('(') || char === 'PI') &&
    (/\d|\)/.test(lastChar) || lastChar === 'I')) {
    expression += '*';
  }
  expression += char;
}

// Check for balanced parentheses
function areParenthesesBalanced(expr) {
  let stack = [];
  for (let char of expr) {
    if (char === '(') stack.push(char);
    else if (char === ')') {
      if (!stack.length) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}

// Sanitize the expression by replacing calculator syntax with JavaScript equivalents
function sanitizeExpression(expr) {
  return expr
    .replace(/log\(/g, 'Math.log(')       // Natural logarithm
    .replace(/exp\(/g, 'Math.exp(')      // Exponential e^x
    .replace(/sqrt\(/g, 'Math.sqrt(')    // Square root
    .replace(/PI/g, 'Math.PI')          // PI constant
    .replace(/(\d+|\([^()]+\))\^2/g, 'Math.pow($1,2)')  // x^2
    .replace(/(\w+|\([^()]+\))\^(\d+)/g, 'Math.pow($1,$2)'); // x^n
}

// Convert degrees to radians
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Preprocess trigonometric functions: convert degree input to radians
function preprocessTrigFunctions(expr) {
  return expr
    .replace(/sin\(([^()]+)\)/g, 'Math.sin(toRadians($1))')
    .replace(/cos\(([^()]+)\)/g, 'Math.cos(toRadians($1))')
    .replace(/tan\(([^()]+)\)/g, 'Math.tan(toRadians($1))');
}

// Evaluate the expression safely
function evaluateExpression(expr) {
  try {
    // Allow only valid characters: digits, operators, parentheses, decimal, PI, letters (for functions)
    if (!/^[0-9+\-*/^().\sPIa-z]+$/.test(expr)) throw 'Invalid characters';
    if (!areParenthesesBalanced(expr)) throw 'Unbalanced parentheses';
    expr = preprocessTrigFunctions(expr);
    expr = sanitizeExpression(expr);
    // Use Function constructor to evaluate (providing toRadians for trig conversion)
    const result = Function('toRadians', "\"use strict\"; return (" + expr + ")")(toRadians);
    if (isNaN(result) || !isFinite(result)) throw 'Invalid result';
    return result;
  } catch {
    return 'Error';
  }
}

// Number button click
numberButtons.forEach(btn => btn.addEventListener('click', () => {
  appendChar(btn.dataset.number);
  updateDisplay();
}));

// Operation button click
operationButtons.forEach(btn => btn.addEventListener('click', () => {
  appendChar(btn.dataset.operation);
  updateDisplay();
}));

// Parentheses button click
parenButtons.forEach(btn => btn.addEventListener('click', () => {
  appendChar(btn.dataset.paren);
  updateDisplay();
}));

// Equals button click
equalsButton.addEventListener('click', () => {
  expression = evaluateExpression(expression).toString();
  updateDisplay();
});

// Clear button click
clearButton.addEventListener('click', () => {
  expression = '';
  updateDisplay();
});

// Delete (backspace) button click
deleteButton.addEventListener('click', () => {
  expression = expression.slice(0, -1);
  updateDisplay();
});

// Keyboard input handling
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/\d|[+\-*/().]/.test(key)) {
    appendChar(key);
    updateDisplay();
  } else if (key === '=' || key === 'Enter') {
    expression = evaluateExpression(expression).toString();
    updateDisplay();
  } else if (key === 'Backspace') {
    expression = expression.slice(0, -1);
    updateDisplay();
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    expression = '';
    updateDisplay();
  }
});

// Toggle scientific functions panel
sciToggle.addEventListener('click', () => {
  sciPanel.classList.toggle('visible');
});

// Scientific function buttons
sciButtons.forEach(btn => btn.addEventListener('click', () => {
  const func = btn.dataset.func;
  if (func === 'sqrt') appendChar('sqrt(');
  else if (func === 'square') appendChar('^2');
  else if (func === 'recip') appendChar('1/(');
  else if (func === 'PI') appendChar('PI');
  else appendChar(func + '(');  // e.g. sin(, cos(, tan(
  updateDisplay();
}));
