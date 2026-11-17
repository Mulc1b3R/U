import os
import re
import json
import hashlib
import webbrowser
import urllib.request
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

HOST       = "127.0.0.1"
PORT       = 8765
OLLAMA_URL = "http://localhost:11434/api/chat"
CORE_KEYS  = {"GENESIS_ID", "IDENTITY", "VOICE_AND_CADENCE", "PHILOSOPHY"}

def parse_bio(filepath):
    text = Path(filepath).read_text(encoding="utf-8")
    core = {"GENESIS_ID": "", "IDENTITY": "", "VOICE_AND_CADENCE": "", "PHILOSOPHY": ""}
    blocks = []
    current_header = None
    buf = []

    def flush():
        if not current_header or not buf:
            return
        body = "\n".join(buf).strip()
        if current_header in CORE_KEYS:
            core[current_header] = body
        elif ":" in current_header:
            cat, title = current_header.split(":", 1)
            blocks.append({"category": cat.strip(), "title": title.strip(), "text": body})
        else:
            blocks.append({"category": "MEMORY", "title": current_header.strip(), "text": body})

    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^\[([A-Z0-9_:\-\s]+)\]$", line)
        if m:
            flush()
            current_header = m.group(1).strip()
            buf = []
        else:
            buf.append(line)
    flush()
    return core, blocks

def retrieve_blocks(query, blocks, top_k=3):
    q_words = set(re.findall(r"[a-z0-9]{3,}", query.lower()))
    if not q_words or not blocks:
        return blocks[:top_k]
    scored = []
    for b in blocks:
        b_words = set(re.findall(r"[a-z0-9]{3,}", f"{b['category']} {b['title']} {b['text']}".lower()))
        scored.append((len(q_words & b_words), b))
        scored.sort(key=lambda x: x[0], reverse=True)

    return [b for _, b in scored[:top_k]]

class BioHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def send_json(self, obj, code=200):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def serve_file(self, fname, ctype):
        data = Path(fname).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/":
            self.serve_file("bio_ui.html", "text/html; charset=utf-8")
        elif self.path == "/bio_app.js":
            self.serve_file("bio_app.js", "application/javascript; charset=utf-8")
        elif self.path == "/bio_hex.js":
            self.serve_file("bio_hex.js", "application/javascript; charset=utf-8")
        elif self.path == "/api/bios":
            self.send_json({"files": sorted(f.name for f in Path(".").glob("*.bio"))})
        elif self.path.startswith("/api/bio_info"):
            fname = urllib.request.unquote(self.path.split("file=")[-1])
            safe_path = Path(os.path.basename(fname))
            if not safe_path.exists():
                self.send_json({"error": "File not found"}, 404)
                return
            core, blocks = parse_bio(safe_path)
            self.send_json({
                "genesis_id": core["GENESIS_ID"],
                "identity": core["IDENTITY"],
                "voice": core["VOICE_AND_CADENCE"],
                "philosophy": core["PHILOSOPHY"],
                "blocks": blocks
            })

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length).decode("utf-8"))

        if self.path == "/api/save_bio":
            raw_name = os.path.basename(body.get("file", "untitled.bio")).strip()
            if not raw_name.endswith(".bio"):
                raw_name += ".bio"
            gid = body.get("genesis_id", "").strip()
            if not gid:
                gid = hashlib.sha256(os.urandom(32)).hexdigest()            
            lines = [
                "# =====================================================================",
                "# SOVEREIGN .BIO ARCHIVE — AUTHORED IN PLAIN ENGLISH BY THE INDIVIDUAL",
                "# =====================================================================",
                "",
                "[GENESIS_ID]",
                gid,
                "",

                "[IDENTITY]",
                body.get("identity", ""),
                "",
                "[VOICE_AND_CADENCE]",
                body.get("voice", ""),
                "",
                "[PHILOSOPHY]",
                body.get("philosophy", ""),
                ""
            ]
            for b in body.get("blocks", []):
                cat = re.sub(r"[^A-Z0-9_]", "_", b.get("category", "MEMORY").upper())
                title = re.sub(r"[^A-Z0-9_\-\s]", "", b.get("title", "UNTITLED").upper()).strip()
                lines.extend([f"[{cat}: {title}]", b.get("text", ""), ""])

            Path(raw_name).write_text("\n".join(lines), encoding="utf-8")
            self.send_json({"ok": True, "file": raw_name})

        elif self.path == "/api/chat":
            safe_path = Path(os.path.basename(body["file"]))
            core, blocks = parse_bio(safe_path)
            recalled = retrieve_blocks(body["message"], blocks, top_k=1)

            mem_text = "\n\n".join(f"- [{b['category']}: {b['title']}]: {b['text']}" for b in recalled)
            sys_prompt = (
                "You ARE the person described below. Speak strictly in the first person ('I', 'my', 'me') as yourself. "
                "NEVER refer to 'the file', 'the archive', 'the text', or 'my records'—answer naturally from lived memory. "
                "Stay completely faithful to your voice, cadence, philosophy, and factual memories below without inventing facts.\n\n"
                f"=== GENESIS ID ===\n{core['GENESIS_ID']}\n\n"
                f"=== IDENTITY ===\n{core['IDENTITY']}\n\n"
                f"=== VOICE & CADENCE ===\n{core['VOICE_AND_CADENCE']}\n\n"
                f"=== PHILOSOPHY ===\n{core['PHILOSOPHY']}\n\n"
                f"=== RECALLED MEMORIES ===\n{mem_text}"
            )
            msgs = [{"role": "system", "content": sys_prompt}] + body.get("history", []) + [
                {"role": "user", "content": body["message"]}
            ]

            self.send_response(200)
            self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "close")
            self.end_headers()
            self.close_connection = True


            meta_line = json.dumps({"recalled": [b["title"] for b in recalled]}) + "\n"
            self.wfile.write(meta_line.encode("utf-8"))
            self.wfile.flush()

            try:
                payload = json.dumps({
                    "model": body["model"],
                    "messages": msgs,
                    "stream": True,
                    "think": False,
                    "options": {"num_ctx": 2048, "num_predict": 220}
                }).encode("utf-8")
                req = urllib.request.Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=120) as resp:
                    for raw_line in resp:
                        if not raw_line.strip():
                            continue
                        chunk = json.loads(raw_line.decode("utf-8"))
                        token = chunk.get("message", {}).get("content", "")
                        if token:
                            self.wfile.write((json.dumps({"token": token}) + "\n").encode("utf-8"))
                            self.wfile.flush()
            except Exception as e:
                err_line = json.dumps({"error": f"Make sure HYDRA_V7.exe / Ollama is running ({e})"}) + "\n"
                self.wfile.write(err_line.encode("utf-8"))
                self.wfile.flush()


if __name__ == "__main__":
    url = f"http://{HOST}:{PORT}"
    print(f"🧬 Sovereign .BIO Browser Console running at {url}")
    webbrowser.open(url)
    HTTPServer((HOST, PORT), BioHandler).serve_forever()
