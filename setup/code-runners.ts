import { defineCodeRunnersSetup } from "@slidev/types";

const gocciaRuntime = `
type Token =
  | { kind: "Keyword"; value: "const" }
  | { kind: "Identifier"; value: string }
  | { kind: "Punctuation"; value: "=" | "+" | ";" }
  | { kind: "Number"; value: number };

type ASTNode =
  | { type: "Program"; body: ASTNode[] }
  | { type: "VariableDeclaration"; name: string; init: ASTNode }
  | { type: "BinaryExpression"; op: "+"; left: ASTNode; right: ASTNode }
  | { type: "NumericLiteral"; value: number };

type Parser = {
  take(value?: Token["value"]): Token;
  identifier(): string;
  expression(): ASTNode;
};

const __gocciaTalkGlobal = globalThis as typeof globalThis & {
  createTokens?: (source: string) => Token[];
  createParser?: (tokens: Token[]) => Parser;
  createAST?: (tokens: Token[]) => ASTNode;
};

__gocciaTalkGlobal.createTokens ??= (source: string): Token[] => {
  const parts = source.match(/[A-Za-z_]\\w*|\\d+|[=+;]/g) ?? [];

  return parts.map((value): Token => {
    if (value === "const") return { kind: "Keyword", value };
    if (/^\\d+$/.test(value)) return { kind: "Number", value: Number(value) };
    if (value === "=" || value === "+" || value === ";") {
      return { kind: "Punctuation", value };
    }
    return { kind: "Identifier", value };
  });
};

__gocciaTalkGlobal.createParser ??= (tokens: Token[]): Parser => {
  let position = 0;

  const take = (value?: Token["value"]) => {
    const token = tokens[position++];
    if (value !== undefined && token.value !== value) {
      throw new Error(\`Expected \${value}, got \${token.value}\`);
    }
    return token;
  };

  const parseNumber = (): ASTNode => ({
    type: "NumericLiteral",
    value: Number(take().value),
  });

  const parseExpression = (): ASTNode => {
    let left = parseNumber();

    while (tokens[position]?.value === "+") {
      take("+");
      left = { type: "BinaryExpression", op: "+", left, right: parseNumber() };
    }

    return left;
  };

  return {
    take,
    identifier: () => String(take().value),
    expression: parseExpression,
  };
};

__gocciaTalkGlobal.createAST ??= (tokens: Token[]): ASTNode => {
  const parser = __gocciaTalkGlobal.createParser!(tokens);

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
`;

export default defineCodeRunnersSetup((runners) => {
  const runTypeScript = runners.ts;

  return {
    ts: (code, context) => runTypeScript(`${gocciaRuntime}\n${code}`, context),
    typescript: (code, context) => runTypeScript(`${gocciaRuntime}\n${code}`, context),
  };
});
