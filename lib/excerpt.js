// Inline nodes nest: a link carries its label in a `content` array rather than
// a `text` field. Flatten every level so linked words reach the excerpt.
function inlineText(nodes) {
  let text = '';
  for (const node of nodes || []) {
    if (typeof node === 'string') {
      text += node;
      continue;
    }
    if (!node || typeof node !== 'object') continue;
    if (typeof node.text === 'string') text += node.text;
    else if (Array.isArray(node.content)) text += inlineText(node.content);
  }
  return text;
}

// Extract a short plain-text excerpt ("starting lines") from BlockNote blocks.
export function excerptFromBlocks(blocks, max = 200) {
  if (!Array.isArray(blocks)) return '';
  const out = [];
  const walk = (list) => {
    for (const b of list || []) {
      if (out.join(' ').length >= max) return;
      // Skip non-prose blocks.
      if (b?.type && ['image', 'video', 'audio', 'file', 'codeBlock', 'table', 'equation'].includes(b.type)) continue;
      const txt = inlineText(b?.content).trim();
      if (txt) out.push(txt);
      if (b?.children?.length) walk(b.children);
    }
  };
  walk(blocks);
  const text = out.join(' ').replace(/\s+/g, ' ').trim();
  const chars = Array.from(text);
  return chars.length > max ? chars.slice(0, max).join('').replace(/\s+\S*$/, '') + '…' : text;
}
