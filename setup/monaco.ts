import { defineMonacoSetup } from "@slidev/types";

const gocciaTypes = `
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

interface Window {
  createTokens(source: string): Token[];
  createParser(tokens: Token[]): Parser;
  createAST(tokens: Token[]): ASTNode;
}
`;

export default defineMonacoSetup((monaco) => {
  const typescript = monaco.languages.typescript as unknown as {
    typescriptDefaults: {
      addExtraLib(content: string, filePath?: string): void;
    };
  };

  typescript.typescriptDefaults.addExtraLib(
    gocciaTypes,
    "file:///goccia-talk.d.ts",
  );

  return {
    editorOptions: {
      lineNumbers: "on",
      wordWrap: "on",
    },
  };
});
