import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

export const draculaTheme = EditorView.theme(
  {
    "&": {
      color: "#f8f8f0",
      backgroundColor: "var(--steel-gray)",
      height: "100%",
      fontSize: "18px",
    },
    ".cm-content": {
      caretColor: "#f8f8f0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#f8f8f0",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
      {
        backgroundColor: "#44475a",
      },
    ".cm-gutters": {
      backgroundColor: "#282a36",
      color: "rgb(144, 145, 148)",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "#232436",
    },
    ".cm-lineNumbers": {
      backgroundColor: "var(--ebony-clay)",
      color: "#6d8a88",
      fontSize: "18px",
      minWidth: "40px",
    },
    ".cm-activeLineGutter": {
      color: "#f8f8f2",
      backgroundColor: "#ffffff10",
    },

    ".cm-selectionBackground": {
      backgroundColor: "#44475a80 !important",
    },
  },
  { dark: true }
);

export const draculaHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "#6272a4", fontStyle: "italic" },
  { tag: t.lineComment, color: "#6272a4", fontStyle: "italic" },
  { tag: t.blockComment, color: "#6272a4", fontStyle: "italic" },
  { tag: t.docComment, color: "#6272a4", fontStyle: "italic" },
  { tag: t.keyword, color: "#ff79c6" },
  { tag: t.controlKeyword, color: "#ff79c6" },
  { tag: t.typeName, color: "#8be9fd" },
  { tag: t.className, color: "#8be9fd" },
  { tag: t.namespace, color: "#8be9fd" },
  { tag: t.function(t.variableName), color: "#50fa7b" },
  { tag: t.definition(t.function(t.variableName)), color: "#50fa7b" },
  { tag: t.standard(t.variableName), color: "#50fa7b" },
  { tag: t.variableName, color: "#f8f8f2" },
  { tag: t.definition(t.variableName), color: "#f8f8f2" },
  { tag: t.propertyName, color: "#ffb86c" },
  { tag: t.string, color: "#f1fa8c" },
  { tag: t.character, color: "#f1fa8c" },
  { tag: t.special(t.string), color: "#f1fa8c" },
  { tag: t.number, color: "#bd93f9" },
  { tag: t.float, color: "#bd93f9" },
  { tag: t.bool, color: "#ff79c6" },
  { tag: t.operator, color: "#ff79c6" },
  { tag: t.operatorKeyword, color: "#ff79c6" },
  { tag: t.punctuation, color: "#f8f8f2" },
  { tag: t.bracket, color: "#f8f8f2" },
  { tag: t.paren, color: "#f8f8f2" },
  { tag: t.meta, color: "#f1fa8c" },
  { tag: t.macroName, color: "#f1fa8c" },
  { tag: t.attributeName, color: "#f1fa8c" },
  { tag: t.invalid, color: "#ff5555", background: "#ff555522" },
]);
export const draculaHighlight = syntaxHighlighting(draculaHighlightStyle);
