import { useState, useCallback } from "react";
import { MiniToolLayout } from "@/components/layout/MiniToolLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useToolView } from "@/hooks/use-track";
import { Database, Copy, Trash2, Download, Maximize2, Minimize2, ShieldCheck } from "lucide-react";

const faqs = [
  { q: "What does a SQL formatter do?", a: "A SQL formatter reformats SQL queries with consistent indentation, capitalized keywords, and aligned clauses, making them easier to read, review, and maintain." },
  { q: "Does formatting change the query behavior?", a: "No. SQL formatters only change whitespace and keyword casing. The logic, performance, and output of the query are identical." },
  { q: "Is my SQL safe to paste here?", a: "Yes. All processing happens entirely in your browser — nothing is sent to a server. You can safely paste queries containing sensitive table names, column names, or data." },
  { q: "Which SQL dialects are supported?", a: "This formatter works with standard SQL and most major dialects including PostgreSQL, MySQL, SQLite, SQL Server, and Oracle. The formatting is dialect-agnostic — keywords are capitalized and structure is indented consistently." },
];

const relatedTools = [
  { title: "JSON Formatter", href: "/tools/json-formatter", description: "Format and validate JSON instantly." },
  { title: "HTML Formatter", href: "/tools/html-formatter", description: "Beautify and format HTML code." },
  { title: "CSS Minifier & Formatter", href: "/tools/css-minifier", description: "Minify and format CSS code." },
];

const EXAMPLE_SQL = `select u.id, u.name, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at >= '2024-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 0 order by total_spent desc limit 50;`;

const KEYWORDS = [
  "SELECT","FROM","WHERE","JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN","FULL JOIN","OUTER JOIN","CROSS JOIN",
  "ON","AND","OR","NOT","IN","EXISTS","LIKE","BETWEEN","IS NULL","IS NOT NULL",
  "GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","UNION","UNION ALL","INTERSECT","EXCEPT",
  "INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","CREATE TABLE","DROP TABLE","ALTER TABLE",
  "ADD COLUMN","DROP COLUMN","TRUNCATE","AS","DISTINCT","CASE","WHEN","THEN","ELSE","END",
  "COUNT","SUM","AVG","MIN","MAX","COALESCE","NULLIF","CAST","CONVERT",
  "ASC","DESC","PRIMARY KEY","FOREIGN KEY","REFERENCES","CONSTRAINT","INDEX","UNIQUE","NOT NULL","DEFAULT",
  "WITH","RECURSIVE","EXPLAIN","ANALYZE","BEGIN","COMMIT","ROLLBACK","TRANSACTION",
];

function formatSQL(sql: string): string {
  let s = sql.replace(/\s+/g, " ").trim();

  const sortedKW = [...KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sortedKW) {
    const re = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    s = s.replace(re, kw);
  }

  const mainClauses = ["SELECT","FROM","WHERE","GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET",
    "INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","UNION","UNION ALL","INTERSECT","EXCEPT",
    "JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN","FULL JOIN","OUTER JOIN","CROSS JOIN","WITH"];

  for (const clause of mainClauses) {
    const re = new RegExp(`\\b(${clause.replace(/ /g, "\\s+")})\\b`, "g");
    s = s.replace(re, `\n$1`);
  }

  const lines = s.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: string[] = [];

  for (const line of lines) {
    const isSubClause = /^(ON|AND|OR)\b/i.test(line);
    if (isSubClause) {
      result.push(`  ${line}`);
    } else {
      result.push(line);
    }
  }

  return result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function minifySQL(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

type Mode = "format" | "minify";

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const { toast } = useToast();
  useToolView("sql-formatter");

  const run = useCallback((m: Mode) => {
    if (!input.trim()) return;
    setMode(m);
    setOutput(m === "format" ? formatSQL(input) : minifySQL(input));
  }, [input]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!" });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query.sql";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!" });
  };

  const handleClear = () => { setInput(""); setOutput(""); setMode(null); };
  const loadExample = () => { setInput(EXAMPLE_SQL); setOutput(""); setMode(null); };

  return (
    <MiniToolLayout
      seoTitle="SQL Formatter & Beautifier Online Free"
      seoDescription="Format and beautify SQL queries online for free. Instant keyword capitalization and indentation. 100% client-side — your queries never leave your browser."
      icon={Database}
      badge="Developer Tool"
      title="SQL Formatter & Beautifier"
      description="Format messy SQL queries with proper indentation and capitalized keywords, or minify them for embedding. All processing happens in your browser."
      faqs={faqs}
      relatedTools={relatedTools}
      affiliateCategory="all"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Input SQL</span>
              <button onClick={loadExample} className="text-[11px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Load example</button>
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(""); setMode(null); }}
              placeholder={"Paste your SQL query here...\n\nselect * from users where active = true"}
              spellCheck={false}
              className="w-full min-h-[320px] md:min-h-[400px] resize-y rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/35"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              Output {mode ? `(${mode === "format" ? "formatted" : "minified"})` : ""}
            </span>
            <div className={`relative w-full min-h-[320px] md:min-h-[400px] rounded-xl border bg-muted/20 overflow-auto transition-all ${output ? "border-border/60" : "border-border/40 border-dashed"}`}>
              {output ? (
                <pre className="px-4 py-3.5 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">{output}</pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-6">
                  <Database className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/50">Output appears here</p>
                  <p className="text-xs text-muted-foreground/35">Paste SQL and click Format or Minify</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => run("format")} disabled={!input.trim()} className="text-xs shadow-sm shadow-primary/20 gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" /> Format SQL
          </Button>
          <Button variant="outline" onClick={() => run("minify")} disabled={!input.trim()} className="text-xs border-border/60 gap-1.5">
            <Minimize2 className="h-3.5 w-3.5" /> Minify SQL
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!output} className="text-xs border-border/60 gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download .sql
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!input && !output} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[{ icon: ShieldCheck, label: "100% client-side" }, { icon: Database, label: "Keyword capitalization" }, { icon: Maximize2, label: "Smart indentation" }].map(({ icon: Ic, label }) => (
            <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1">
              <Ic className="h-3 w-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </MiniToolLayout>
  );
}
