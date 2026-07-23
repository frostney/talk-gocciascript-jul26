---
theme: default
title: What I've learned building a JavaScript engine with AI
info: GocciaScript notes for a London JavaScript meetup.
class: text-center
colorSchema: dark
drawings:
  persist: false
transition: slide-left
duration: 40min
lineNumbers: true
mdc: true
---

# Productionising a JavaScript runtime with AI

JSMonthly July 2026

Johannes Stein

<div class="social-links">github.com/frostney · x.com/frostney_ · linkedin.com/in/johannesstein</div>

<div class="deck-links">
  <a class="primary" href="https://gocciascript.dev">gocciascript.dev</a>
  <a href="https://frostney.github.io/talk-gocciascript-jul26">frostney.github.io/talk-gocciascript-jul26</a>
</div>

<!--
I've been tinkering with a JS engine for about a year. Most of it with AI. Here's what stuck with me.
-->

---

# Where I was coming from

- Big fan of JavaScript
- Curious about of interpreters
- Where else can JavaScript run that's not the browser?

---
layout: image
image: /asteride.png
backgroundSize: contain
---

---

# Things I wanted

- Explicit semicolons
- Arrow functions only
- Strict equality only
- `let` / `const` only
- No `eval`, no `Function`
- Named imports / exports only
- No `for`, `while`, `do...while`

---
layout: image
image: /gocciascript-logo.png
backgroundSize: contain
---

---

# It all starts with the source

```ts
const x = 2 + 2;
```

---

# Lexer

```ts
type Token =
  | { kind: "Keyword"; value: "const" }
  | { kind: "Identifier"; value: string }
  | { kind: "Punctuation"; value: "=" | "+" | ";" }
  | { kind: "Number"; value: number };
```

---

# Lexer

```ts {monaco-run}
const createTokens = (source: string): Token[] => {
  const parts = source.match(/[A-Za-z_]\w*|\d+|[=+;]/g) ?? [];

  return parts.map((value): Token => {
    if (value === "const") return { kind: "Keyword", value };
    if (/^\d+$/.test(value)) return { kind: "Number", value: Number(value) };
    if (value === "=" || value === "+" || value === ";") {
      return { kind: "Punctuation", value };
    }
    return { kind: "Identifier", value };
  });
};

// Add code in the next line
console.log(createTokens(""));
```

---

# Parser

```ts
type ASTNode =
  | { type: "Program"; body: ASTNode[] }
  | { type: "VariableDeclaration"; name: string; init: ASTNode }
  | { type: "BinaryExpression"; op: "+"; left: ASTNode; right: ASTNode }
  | { type: "NumericLiteral"; value: number };
```

---

# Parser

```ts {monaco-run}
const tokens = window.createTokens("const x = 2 + 2;");

const createAST = (tokens: Token[]): ASTNode => {
  const parser = window.createParser(tokens);

  parser.take("const");
  const name = parser.identifier();
  parser.take("=");
  const init = parser.expression();
  parser.take(";");

  return {
    type: "Program",
    body: [{ type: "VariableDeclaration", name, init }],
  };
};

console.log(createAST(tokens));
```

---

# Interpreter

```ts {monaco-run}
const evaluate = (node: ASTNode): number => {
  switch (node.type) {
    case "Program":             return evaluate(node.body[0]);
    case "NumericLiteral":      return node.value;
    case "BinaryExpression":    return evaluate(node.left) + evaluate(node.right);
    case "VariableDeclaration": return evaluate(node.init);
  }
};

const tokens = window.createTokens("const x = 2 + 2;");
const ast = window.createAST(tokens);

console.log(evaluate(ast));
```

---

# Example as spec

```js
const a = 1;
const b = 2;
const c = a + b;
console.log("Sum of a (", a, ") and b (", b, ") is:", c);

// Variables and arrow functions
const greeting = "Hello";
let count = 0;

const greet = (name) => {
  count = count + 1;
  return greeting + ", " + name + "!";
};

console.log(greet("World"));
console.log("Called", count, "times");

```

---

# Then add more examples

```js
class CoffeeShop {
  #name = "Goccia Coffee";
  #beans = ["Arabica", "Robusta", "Ethiopian"];
  #prices = { espresso: 2.5, latte: 4.0, cappuccino: 3.75 };

  getMenu() { return this.#beans.map((bean) => `${bean} blend`); }

  calculateTotal(order) {
    return order.reduce((total, item) => total + (this.#prices[item] ?? 0), 0);
  }

  get name() { return this.#name; }
}

const shop = new CoffeeShop();
const total = shop.calculateTotal(["espresso", "latte"]);

console.log(`Welcome to ${shop.name}!`);
console.log(`Your order total: $${total.toFixed(2)}`);
```

---

# Single-responsibility tests

```js
test("if statement with true condition", () => {
  let executed = false;
  if (true) {
    executed = true;
  }
  expect(executed).toBeTruthy();
});
```

- 11550+ tests run on every PR
- Vitest compatible

---

# Aiming for spec compliance

- Using test262 as the north star
- But: Full compliance requires all ES syntax features

---
layout: image
image: /test262-pass-rate.png
backgroundSize: contain
---

---

# What comes after test262

- Micro benchmarks
- Are We Fast Yet? (https://github.com/smarr/are-we-fast-yet)
- Web Tooling Benchmark

---
layout: image
image: /web-tooling-benchmark.png
backgroundSize: contain
---

---

# Where is the project now?

- 99.8% of Test262 passes
- FFI support
- Sandbox

---

# What's next?

- Performance optimisations
- WASM port
- Embedding and creating custom environments

---
class: text-center
---

# Let's do a demo

<div class="social-links">github.com/frostney · x.com/frostney_ · linkedin.com/in/johannesstein</div>

<div class="deck-links">
  <a class="primary" href="https://gocciascript.dev">gocciascript.dev</a>
  <a href="https://frostney.github.io/talk-gocciascript-jul26">frostney.github.io/talk-gocciascript-jul26</a>
</div>
