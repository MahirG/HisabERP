import { promises as fs } from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOTS = ["app", "components"];
const EXTENSIONS = new Set([".tsx", ".jsx"]);
const VISIBLE_ATTRIBUTES = new Set(["placeholder", "title", "aria-label", "alt"]);
const VISIBLE_PROPERTY_NAMES = new Set([
  "title", "shortTitle", "description", "label", "heading", "eyebrow", "summary",
  "subtitle", "intro", "message", "empty", "emptyState", "statusLabel", "tooltip",
  "buttonLabel", "actionLabel", "helperText", "caption", "copy"
]);
const IGNORE_FILES = new Set(["components/language-provider.tsx"]);
const IGNORED_ELEMENTS = new Set(["code", "pre", "script", "style"]);
const CANONICAL_TEXT = [
  /^(?:https?:\/\/|\/|\.\/|\.\.\/)/,
  /^[A-Za-z]+\/[A-Za-z_]+$/,
  /^(?:USD|ETB|EUR|AED|KES|aal1|aal2)$/i,
  /^(?:GET|POST|PUT|PATCH|DELETE)$/,
  /^[A-Z0-9_:-]+$/
];

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

function normalize(value) {
  return decodeEntities(String(value)).replace(/\s+/g, " ").trim();
}

function isHumanCopy(value) {
  const text = normalize(value);
  if (!text || text.length < 2 || !/[A-Za-z]/.test(text)) return false;
  if (CANONICAL_TEXT.some((pattern) => pattern.test(text))) return false;
  if (/^[A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)*$/.test(text) && !/[a-z]{3,}\s+[a-z]{3,}/i.test(text) && text.length < 18) return false;
  if (/^(?:ready|warning|critical|success|error|pending|complete)$/i.test(text)) return false;
  if (/^[.#][A-Za-z0-9_-]+/.test(text)) return false;
  if (/^\{.+\}(?:\s+\{.+\})+$/.test(text)) return false;
  return true;
}

function templateToSource(node) {
  if (ts.isNoSubstitutionTemplateLiteral(node)) return normalize(node.text);
  if (!ts.isTemplateExpression(node)) return "";
  let result = node.head.text;
  node.templateSpans.forEach((span, index) => { result += `{${index}}${span.literal.text}`; });
  return normalize(result);
}

async function listFiles(root) {
  const output = [];
  async function walk(current) {
    let entries;
    try { entries = await fs.readdir(current, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (EXTENSIONS.has(path.extname(entry.name))) output.push(full);
    }
  }
  await walk(root);
  return output;
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function elementName(node) {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText();
  return "";
}

function isInsideIgnoredElement(node) {
  let current = node.parent;
  while (current) {
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) {
      if (IGNORED_ELEMENTS.has(elementName(current).toLowerCase())) return true;
    }
    current = current.parent;
  }
  return false;
}

function isVisibleJsxExpression(node) {
  if (!ts.isJsxExpression(node.parent)) return false;
  const container = node.parent.parent;
  return ts.isJsxElement(container) || ts.isJsxFragment(container);
}

function addFinding(findings, sourceFile, file, node, kind, raw) {
  if (isInsideIgnoredElement(node)) return;
  const source = normalize(raw);
  if (!isHumanCopy(source)) return;
  findings.push({ source, file: file.split(path.sep).join("/"), line: lineOf(sourceFile, node), kind });
}

function scanFile(file, content) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings = [];
  function visit(node) {
    if (ts.isJsxText(node)) addFinding(findings, sourceFile, file, node, "jsx-text", node.getText(sourceFile));

    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(sourceFile);
      if (VISIBLE_ATTRIBUTES.has(name)) addFinding(findings, sourceFile, file, node, `attribute:${name}`, node.initializer.text);
    }

    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && isVisibleJsxExpression(node)) {
      addFinding(findings, sourceFile, file, node, "jsx-expression", node.text);
    }

    if (ts.isTemplateExpression(node) && isVisibleJsxExpression(node)) {
      addFinding(findings, sourceFile, file, node, "jsx-template", templateToSource(node));
    }

    if (ts.isPropertyAssignment(node)) {
      const propertyName = node.name.getText(sourceFile).replace(/["']/g, "");
      if (VISIBLE_PROPERTY_NAMES.has(propertyName)) {
        if (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) {
          addFinding(findings, sourceFile, file, node.initializer, `copy-property:${propertyName}`, node.initializer.text);
        } else if (ts.isTemplateExpression(node.initializer)) {
          addFinding(findings, sourceFile, file, node.initializer, `copy-template:${propertyName}`, templateToSource(node.initializer));
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return findings;
}


const files = (await Promise.all(ROOTS.map(listFiles))).flat().filter(
  file => !IGNORE_FILES.has(file.split(path.sep).join("/"))
);
const findings=[];
for (const file of files) findings.push(...scanFile(file,await fs.readFile(file,"utf8")));
const unique = new Map();
for(const entry of findings) {
  const previous=unique.get(entry.source);
  if(previous) previous.locations.push({file:entry.file,line:entry.line,kind:entry.kind});
  else unique.set(entry.source,{source:entry.source,locations:[{file:entry.file,line:entry.line,kind:entry.kind}]});
}
const strings=[...unique.values()].sort((a,b)=>a.source.localeCompare(b.source));
const report={
  generatedAt:new Date().toISOString(),
  scannedFiles:files.length,
  uniqueStrings:strings.length,
  supportedLanguages:["en"],
  sourceStrings:strings,
  errors:[],
};
await fs.writeFile("i18n-audit-report.json",`${JSON.stringify(report,null,2)}\n`);
console.log(`English UI audit: ${strings.length} visible source strings in ${files.length} files.`);
if(process.argv.includes("--check") && report.errors.length)process.exitCode=1;
