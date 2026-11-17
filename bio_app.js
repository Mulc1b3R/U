let history = [];
const UI = {};

function el(tag, parent, props={}) {
  const node = document.createElement(tag);
  Object.assign(node, props);
  if (parent) parent.appendChild(node);
  return node;
}

function buildApp() {
  const side = el('div', document.body, { id: 'sidebar' });
  el('h1', side, { textContent: '🧬 .BIO Hologram' });

  const tabs = el('div', side, { className: 'tabs' });
  UI.tabChat = el('button', tabs, { textContent: 'Chat', className: 'active', onclick: () => switchView('chat') });
  UI.tabEdit = el('button', tabs, { textContent: 'Edit / Create .bio', className: 'btn-sec', onclick: () => switchView('edit') });

  el('label', side, { textContent: 'Active .bio Archive' });
  UI.bioSel = el('select', side, { onchange: loadBioInfo });

  el('label', side, { textContent: 'Local HYDRA Engine' });
  UI.modSel = el('select', side);
  ['local-gemma', 'local-qwen', 'local-deepseek'].forEach(m => el('option', UI.modSel, { value: m, textContent: m }));

  el('button', side, { textContent: '+ Create New .bio File', className: 'btn-sec', onclick: newBioPrompt });
  el('button', side, { textContent: 'Clear Chat Session', className: 'btn-sec', onclick: resetChat });

  const idCard = el('div', side, { className: 'card' });
  el('label', idCard, { textContent: 'Core Identity' });
  UI.idPrev = el('div', idCard, { textContent: 'Loading...', style: 'color:var(--muted)' });

  const memCard = el('div', side, { className: 'card' });
  UI.memLbl = el('label', memCard, { textContent: 'Indexed Archive Blocks (0)' });
  UI.memTags = el('div', memCard);

  const main = el('div', document.body, { id: 'main' });

  UI.chatView = el('div', main, { id: 'chat-view' });
  UI.chat = el('div', UI.chatView, { id: 'chat' });
  const bar = el('div', UI.chatView, { id: 'input-bar' });
  UI.prompt = el('input', bar, { placeholder: 'Speak to the .bio archive...', style: 'flex:1;font-size:14px', onkeydown: e => { if (e.key === 'Enter') sendMsg(); } });
  UI.sendBtn = el('button', bar, { textContent: 'Send', style: 'width:120px', onclick: sendMsg });

  UI.editView = el('div', main, { id: 'editor-view' });
  const topRow = el('div', UI.editView, { style: 'display:flex;justify-content:space-between;align-items:center' });
  el('h2', topRow, { textContent: 'Author & Edit Plain-English .bio Archive', style: 'font-size:16px;color:var(--accent)' });
  el('button', topRow, { textContent: '💾 Save .bio File', style: 'width:200px', onclick: saveBio });

  const gFile = el('div', UI.editView, { className: 'ed-group' });
  el('label', gFile, { textContent: 'Archive Filename' });
  UI.edFile = el('input', gFile, { placeholder: 'mojo.bio' });

  const gId = el('div', UI.editView, { className: 'ed-group' });
  el('label', gId, { textContent: '1. Core Identity' });
  UI.edId = el('textarea', gId, { rows: 3 });

  const gVoice = el('div', UI.editView, { className: 'ed-group' });
  el('label', gVoice, { textContent: '2. Voice & Cadence' });
  UI.edVoice = el('textarea', gVoice, { rows: 3 });

  const gPhil = el('div', UI.editView, { className: 'ed-group' });
  el('label', gPhil, { textContent: '3. Core Philosophy' });
  UI.edPhil = el('textarea', gPhil, { rows: 3 });

  const blkHdr = el('div', UI.editView, { style: 'display:flex;justify-content:space-between;align-items:center' });
  el('label', blkHdr, { textContent: '4. Memories, Sensory Anchors, Quirks & Stories', style: 'margin:0' });
  el('button', blkHdr, { textContent: '+ Add Block', style: 'width:auto;padding:7px 14px', onclick: () => addBlockCard() });

  UI.edBlocks = el('div', UI.editView, { style: 'display:flex;flex-direction:column;gap:12px' });
  el('button', UI.editView, { textContent: '💾 Save .bio Archive to Disk', onclick: saveBio });
}

function switchView(mode) {
  UI.chatView.style.display = mode === 'chat' ? 'flex' : 'none';
  UI.editView.style.display = mode === 'edit' ? 'flex' : 'none';
  UI.tabChat.className = mode === 'chat' ? 'active' : 'btn-sec';
  UI.tabEdit.className = mode === 'edit' ? 'active' : 'btn-sec';
}

async function init(selectFile=null) {
  const res = await fetch('/api/bios');
  const data = await res.json();
  UI.bioSel.innerHTML = '';
  data.files.forEach(f => el('option', UI.bioSel, { value: f, textContent: f }));
  if (selectFile && data.files.includes(selectFile)) UI.bioSel.value = selectFile;
  if (data.files.length) await loadBioInfo();
}

async function loadBioInfo() {
  const file = UI.bioSel.value;
  if (!file) return;
  const res = await fetch('/api/bio_info?file=' + encodeURIComponent(file));
  const info = await res.json();
  UI.idPrev.textContent = info.identity || '(No [IDENTITY] block)';
  UI.memLbl.textContent = `Indexed Archive Blocks (${info.blocks.length})`;
  UI.memTags.innerHTML = '';
  info.blocks.forEach(b => el('span', UI.memTags, { className: 'tag', textContent: b.title }));

  UI.edFile.value = file;
  UI.edId.value = info.identity || '';
  UI.edVoice.value = info.voice || '';
  UI.edPhil.value = info.philosophy || '';
  UI.edBlocks.innerHTML = '';
  info.blocks.forEach(b => addBlockCard(b.category, b.title, b.text));
  resetChat();
}

function addBlockCard(category='MEMORY', title='', text='') {
  const card = el('div', UI.edBlocks, { className: 'ed-group block-item' });
  const row = el('div', card, { className: 'mem-row' });
  const catSel = el('select', row, { className: 'b-cat', style: 'width:220px' });
  ['MEMORY', 'SENSORY_ANCHOR', 'QUIRK_AND_CONTRADICTION', 'PET_HATE', 'TURNING_POINT', 'UNFINISHED_BUSINESS'].forEach(c => {
    el('option', catSel, { value: c, textContent: c, selected: c === category });
  });
  el('input', row, { className: 'b-title', placeholder: 'Short title', value: title });
  el('button', row, { className: 'btn-del', textContent: 'Remove', onclick: () => card.remove() });
  el('textarea', card, { className: 'b-text', rows: 3, placeholder: 'Write in plain English...', value: text });
}

function newBioPrompt() {
  const name = prompt('Enter new .bio filename:', 'new_person.bio');
  if (!name) return;
  UI.edFile.value = name.endsWith('.bio') ? name : name + '.bio';
  UI.edId.value = ''; UI.edVoice.value = ''; UI.edPhil.value = '';
  UI.edBlocks.innerHTML = '';
  addBlockCard('MEMORY', 'EARLY_MEMORIES', '');
  switchView('edit');
}

async function saveBio() {
  const filename = UI.edFile.value.trim();
  if (!filename) return alert('Enter a filename.');
  const blocks = Array.from(document.querySelectorAll('.block-item')).map(el => ({
    category: el.querySelector('.b-cat').value,
    title: el.querySelector('.b-title').value.trim() || 'UNTITLED',
    text: el.querySelector('.b-text').value.trim()
  })).filter(b => b.text.length > 0);
  const res = await fetch('/api/save_bio', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: filename, identity: UI.edId.value.trim(), voice: UI.edVoice.value.trim(), philosophy: UI.edPhil.value.trim(), blocks })
  });
  const data = await res.json();
  if (data.ok) { await init(data.file); switchView('chat'); }
  else alert('Save failed: ' + (data.error || 'Unknown error'));
}

function resetChat() { history = []; UI.chat.innerHTML = ''; }

function appendMsg(role, text, recalled=[]) {
  const div = el('div', UI.chat, { className: 'msg ' + (role === 'user' ? 'user' : 'bio') });
  let hdr = role === 'user' ? 'YOU' : UI.bioSel.value.toUpperCase();
  if (recalled.length) hdr += '  •  Recalled: ' + recalled.join(', ');
  el('div', div, { className: 'meta', textContent: hdr });
  el('div', div, { textContent: text });
  UI.chat.scrollTop = UI.chat.scrollHeight;
}

async function sendMsg() {
  const text = UI.prompt.value.trim();
  if (!text) return;
  UI.prompt.value = ''; appendMsg('user', text);
  UI.sendBtn.disabled = true; UI.sendBtn.textContent = '...';

  const bubble = el('div', UI.chat, { className: 'msg bio' });
  const metaEl = el('div', bubble, { className: 'meta', textContent: UI.bioSel.value.toUpperCase() });
  const bodyEl = el('div', bubble, { textContent: '▍' });
  let fullReply = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: UI.bioSel.value, model: UI.modSel.value, message: text, history: history.slice(-2) })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        const msg = JSON.parse(line);
        if (msg.recalled && msg.recalled.length) {
          metaEl.textContent = UI.bioSel.value.toUpperCase() + '  •  Recalled: ' + msg.recalled.join(', ');
        }
        if (msg.token) {
          fullReply += msg.token;
          bodyEl.textContent = fullReply + '▍';
          UI.chat.scrollTop = UI.chat.scrollHeight;
        }
        if (msg.error) bodyEl.textContent = '⚠️ ' + msg.error;
      }
    }
    bodyEl.textContent = fullReply || bodyEl.textContent.replace('▍', '');
    if (fullReply) history.push({ role: 'user', content: text }, { role: 'assistant', content: fullReply });
  } catch (e) {
    bodyEl.textContent = '⚠️ Local server error: ' + e;
  }

  UI.sendBtn.disabled = false; UI.sendBtn.textContent = 'Send'; UI.prompt.focus();
}


buildApp();
init();
