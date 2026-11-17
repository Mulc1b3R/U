# U
embed your personality and memories in an ai - a digital twin containing individuals data and memories...
## ⚠️ Data Sovereignty & Security Warning

**Your `.bio` file is your personal property and your complete digital likeness. Treat it like your passport, private diary, and house keys combined.**

* **Keep Your `.bio` File Strictly Offline:** Never upload your personal `.bio` file to public GitHub repositories, cloud storage, or third-party websites.
* **Beware of Harvesting & Impersonation:** Because `.bio` files are written in open, human-readable plain English, anyone who obtains your file can read your private memories or load your persona into an AI model without your permission.
* **Local Execution Only:** This engine is engineered to run **100% offline** on your own local hardware (`127.0.0.1`). Only share a `.bio` file directly with trusted family members or heirs on encrypted/offline media when you intentionally choose to pass your archive on.


# 🧬 Sovereign `.bio` Hologram Engine (v1.0)

A zero-dependency, offline-first digital twin and personal legacy runtime powered by plain-English `.bio` archives and local open-weight language models.

Created by **Mojo (`Mulc1b3R`)** — establishing a human-readable, self-authored file standard where individuals own their voice, philosophy, and lived memories outright with zero cloud scraping, zero corporate lock-in, and zero subscriptions.
### 🔐 256-Bit Genesis Block Lineage (`[GENESIS_ID]`)
* **Genesis Archive `#01` (`0000...0001`):** The 64-character hexadecimal ID consisting of **63 zeros followed by `1`** (`0000000000000000000000000000000000000000000000000000000000000001`) marks the original reference archive created by the author.
* **Automatic Unique Hex IDs for Every New `.bio` File:** Whenever you click **`+ Create New .bio File`** (or save a new archive), `bio_hex.js` and `bio_web.py` automatically generate and stamp a unique **64-character (256-bit) cryptographic hex ID** into your file's `[GENESIS_ID]` header—giving every individual archive its own permanent fingerprint.

---

## ✨ Core Philosophy & Architecture

* **Plain-English Sovereign Files (`.bio`):** Every archive is stored in clean, human-readable text blocks (`[GENESIS_ID]`, `[IDENTITY]`, `[VOICE_AND_CADENCE]`, `[PHILOSOPHY]`, and `[MEMORY: ...]`). No proprietary vector databases or binary formats—readable in Notepad today or fifty years from now.
* **256-Bit Genesis Block Lineage (`[GENESIS_ID]`):** Each `.bio` file carries a 64-character (256-bit) hexadecimal identifier. Genesis Archive `#0000...0001` marks the original reference specification; every newly created `.bio` file is automatically stamped with a unique SHA-256 / cryptographic hex fingerprint.
* **Consent Built Into the File System:** Unlike cloud digital-twin platforms that scrape private messages or social feeds, a `.bio` archive exists only when the individual authors their own memories directly.
* **Zero External Python Dependencies:** Runs entirely on Python's built-in standard library (`http.server`, `json`, `re`, `hashlib`, `urllib`) paired with a lightweight local browser UI and live token streaming.

---

## 📂 Repository Files

| File | Role |
| :--- | :--- |
| `bio_web.py` | Local Python HTTP server, `.bio` parser, keyword RAG retriever, and live NDJSON token streamer |
| `bio_ui.html` | Lightweight dark-mode browser shell |
| `bio_app.js` | Interactive chat console and plain-English `.bio` block author/editor |
| `bio_hex.js` | 256-bit (64-character) cryptographic hex ID generator (`window.crypto.getRandomValues`) |
| `template.bio` | Clean starter `.bio` archive ready to duplicate and author in the browser |

---

## 🤖 Compatible Local Models (Hugging Face)

This engine connects to any local Ollama-compatible endpoint (`http://localhost:11434/api/chat`) and runs smoothly even on low-power mini PCs (such as an Intel N95).

Download open-weight models directly from their official Hugging Face repositories:

* **Gemma (Google):** [https://huggingface.co](https://huggingface.co)
* **Qwen (Alibaba Cloud):** [https://huggingface.co](https://huggingface.co)
* **DeepSeek:** [https://huggingface.co](https://huggingface.co)

*(Update the model names in `bio_app.js` to match the local model tags configured in your Ollama / local inference runner.)*

---

## 🚀 Quick Start

1. **Start your local inference server** (Ollama or compatible local runner listening on `http://localhost:11434`).
2. **Clone this repository:**
   ```bash
   https://github.com/Mulc1b3R/U.git
   cd name of folder
   ```
3. **Launch the Sovereign `.bio` Console:**
   ```bash
   python bio_web.py
   ```
4. Your browser will open automatically at **`http://127.0.0.1:8765`**. Click **`+ Create New .bio File`** or **`Edit / Create .bio`** to author your own archive in plain English.

---

## 📄 `.bio` File Specification Example

```text
# =====================================================================
# SOVEREIGN .BIO ARCHIVE — AUTHORED IN PLAIN ENGLISH BY THE INDIVIDUAL
# =====================================================================

[GENESIS_ID]
0000000000000000000000000000000000000000000000000000000000000001

[IDENTITY]
Name, origins, craft, and core life background written in plain English.

[VOICE_AND_CADENCE]
How the person speaks—rhythm, humour, directness, and regional phrasing.

[PHILOSOPHY]
Core principles and outlook on life, work, and technology.

[MEMORY: CHILDHOOD]
First-person memories, places, family, and formative moments.
```

---

## 🧠 Model Setup (Ollama / Hugging Face `.gguf`)

`bio_web.py` connects to any local Ollama-compatible server listening on `http://localhost:11434/api/chat`. **Do not place large model weights inside this repository folder**—Ollama manages model storage in its own local registry.

### Option A: Quick Install via Ollama CLI
Install [Ollama](https://ollama.com), pull your preferred open-weight models, and tag them to match the dropdown in `bio_app.js` (`local-gemma`, `local-qwen`, `local-deepseek`):

```bash
ollama pull gemma4:e4b
ollama cp gemma4:e4b local-gemma

ollama pull qwen3:8b
ollama cp qwen3:8b local-qwen

ollama pull deepseek-r1:8b
ollama cp deepseek-r1:8b local-deepseek
```

### Option B: Import a `.gguf` File Downloaded From Hugging Face
1. Download a quantized `.gguf` model from Hugging Face (e.g. `model.gguf`).
2. Create a one-line file named `Modelfile` in the same folder:
   ```text
   FROM ./model.gguf
   ```
3. Register it under the matching dropdown tag:
   ```bash
   ollama create local-gemma -f Modelfile
   ```


## 📜 License

Released under the **Apache License 2.0** — free to inspect, fork, self-host, and preserve forever.
MADE IN YORKSHIRE
