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

function updateDisplay() {
  displayElement.innerText = expression || '0';
}

function appendChar(char) {
  expression += char;
}

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

function sanitizeExpression(expr) {
  return expr
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log\(/g, 'Math.log(')
    .replace(/exp\(/g, 'Math.exp(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/PI/g, 'Math.PI')
    .replace(/(\d+|\([^()]+\))\^2/g, 'Math.pow($1,2)')
    .replace(/(\w+|\([^()]+\))\^(\d+)/g, 'Math.pow($1,$2)');
}

function evaluateExpression(expr) {
  try {
    if (!/^[0-9+\-*/^().\sPIsqrtcosintanglogexp]+$/.test(expr)) throw 'Invalid characters';
    if (!areParenthesesBalanced(expr)) throw 'Unbalanced parentheses';
    expr = sanitizeExpression(expr);
    const result = Function(`"use strict"; return (${expr})`)();
    if (isNaN(result) || !isFinite(result)) throw 'Invalid result';
    return result;
  } catch {
    return 'Error';
  }
}

numberButtons.forEach(btn => btn.addEventListener('click', () => {
  appendChar(btn.dataset.number);
  updateDisplay();
}));

operationButtons.forEach(btn => btn.addEventListener('click', () => {
  appendChar(btn.dataset.operation);
  updateDisplay();
}));

parenButtons.forEach(btn => btn.addEventListener('click', () => {
  appendChar(btn.dataset.paren);
  updateDisplay();
}));

equalsButton.addEventListener('click', () => {
  expression = evaluateExpression(expression).toString();
  updateDisplay();
});

clearButton.addEventListener('click', () => {
  expression = '';
  updateDisplay();
});

deleteButton.addEventListener('click', () => {
  expression = expression.slice(0, -1);
  updateDisplay();
});

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

sciToggle.addEventListener('click', () => {
  sciPanel.classList.toggle('visible');
});

sciButtons.forEach(btn => btn.addEventListener('click', () => {
  const func = btn.dataset.func;
  if (func === 'sqrt') appendChar('sqrt(');
  else if (func === 'square') appendChar('^2');
  else if (func === 'recip') appendChar('1/(');
  else if (func === 'PI') appendChar('PI');
  else appendChar(func + '(');
  updateDisplay();
}));
