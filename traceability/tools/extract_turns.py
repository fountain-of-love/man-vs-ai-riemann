#!/usr/bin/env python3
"""Extract the turns of the ChatGPT conversation exports into JSONL.

Usage (from the repository root):
    python3 -I traceability/tools/extract_turns.py [REPO_ROOT] [OUT_FILE]

Each conversation is a series of exports named <series>_<major>.<minor>.html:
the live one in the root, older ones in snapshots/. OUT_FILE names the series
and the version to extract up to: traceability/<series>_<version>.jsonl.
Exports newer than that version are ignored, so every derived file stays
reproducible after the conversation grows. Without OUT_FILE, every existing
traceability/*.jsonl is regenerated.

Writes one JSON object per turn of that version, with the keys
id, at, type, actor, data. Read-only towards the research files.

- id      message id from the export
- at      null: the exports carry no timestamps (a gap, recorded, not filled)
- type    "message"
- actor   "user" or "assistant"
- data    seq, text (math as LaTeX), first_seen_in, attachments (if any)

Connection-status placeholders ("No internet", "Retrying...") are not turns and
are skipped. The script fails if a turn's text differs between exports.
"""
import glob, json, os, re, sys
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
SKIP = {'script','style','svg','button','template','audio','noscript'}
BLOCK = {'p','div','h1','h2','h3','h4','h5','h6','pre','blockquote','ol','ul','table','section','hr'}


class Turns(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.turns, self.cur, self.depth, self.stack = [], None, 0, []
        self.skip = self.katexskip = self.inmath = 0
        self.mathblock, self.texbuf = False, None

    def out(self, x):
        self.cur['buf'].append(x)

    def handle_starttag(self, t, a):
        a = dict(a)
        if t in VOID:
            if self.cur is not None and t == 'br':
                self.out('\n')
            return
        cls = (a.get('class') or '').split()
        self.stack.append((t, cls))
        if self.cur is None:
            if t == 'li' and 'data-message-role' in a:
                att = a.get('data-message-attachments')
                self.cur = {'role': a['data-message-role'], 'id': a.get('id'),
                            'recovery': 'data-conversation-recovery' in a,
                            'attachments': json.loads(att) if att else [], 'buf': []}
                self.depth = len(self.stack)
            return
        if self.skip or self.katexskip:
            if t in SKIP: self.skip += 1
            if 'katex-html' in cls: self.katexskip += 1
            return
        if t in SKIP: self.skip += 1; return
        if 'katex-html' in cls: self.katexskip += 1; return
        if t == 'math':
            self.inmath += 1; self.mathblock = a.get('display') == 'block'
        if t in ('td', 'th'): self.out(' | ')
        if t == 'tr': self.out('\n')
        if t == 'annotation' and a.get('encoding') == 'application/x-tex':
            self.texbuf = []; return
        if t == 'li': self.out('\n- ')
        elif t in BLOCK: self.out('\n')
        if t == 'pre': self.out('```\n')

    def handle_endtag(self, t):
        if t in VOID or not self.stack:
            return
        _, cls = self.stack.pop()
        if self.cur is None:
            return
        if len(self.stack) < self.depth:
            self.finish(); return
        if t in SKIP and self.skip: self.skip -= 1; return
        if 'katex-html' in cls and self.katexskip: self.katexskip -= 1; return
        if self.skip or self.katexskip: return
        if t == 'annotation' and self.texbuf is not None:
            tex = ''.join(self.texbuf).strip(); self.texbuf = None
            self.out(f'\n$$ {tex} $$\n' if self.mathblock else f'${tex}$'); return
        if t == 'math': self.inmath -= 1
        if t == 'tr': self.out(' |')
        if t == 'pre': self.out('\n```')
        if t in BLOCK: self.out('\n')

    def handle_data(self, d):
        if self.cur is None or self.skip or self.katexskip: return
        if self.texbuf is not None: self.texbuf.append(d); return
        if self.inmath: return
        self.out(d)

    def finish(self):
        t = ''.join(self.cur.pop('buf'))
        t = re.sub(r'[ \t ]+\n', '\n', t)
        t = re.sub(r'\n{3,}', '\n\n', t).strip()
        t = re.sub(r'^(\s*)-[ \t]*\n+[ \t]*', r'\1- ', t, flags=re.M)
        t = re.sub(r'\n\s*\| ', '\n| ', t)
        t = re.sub(r'\n{3,}', '\n\n', t).strip()
        self.cur['text'] = t
        self.turns.append(self.cur); self.cur = None


def turns_of(path):
    p = Turns()
    with open(path, encoding='utf-8') as f:
        p.feed(f.read())
    return [t for t in p.turns if not t['recovery']]


def version(path):
    return tuple(int(x) for x in re.search(r'_(\d+)\.(\d+)\.html$', path).groups())


def extract(root, out):
    m = re.match(r'^(.+)_(\d+)\.(\d+)\.jsonl$', os.path.basename(out))
    if not m:
        sys.exit(f'{out}: name must be <series>_<major>.<minor>.jsonl')
    series, upto = m.group(1), (int(m.group(2)), int(m.group(3)))
    pattern = glob.escape(series) + '_*.html'
    exports = [e for e in glob.glob(os.path.join(root, 'snapshots', pattern)) +
               glob.glob(os.path.join(root, pattern))
               if re.search(r'_\d+\.\d+\.html$', e) and version(e) <= upto]
    exports.sort(key=version)
    if not exports or version(exports[-1]) != upto:
        sys.exit(f'no export {series}_{upto[0]}.{upto[1]}.html in the root or snapshots/')

    by_export = [(os.path.basename(e), turns_of(e)) for e in exports]
    final = {t['id']: t['text'] for t in by_export[-1][1]}
    first = {}
    for name, turns in by_export:
        for t in turns:
            first.setdefault(t['id'], name)
            if t['id'] in final and final[t['id']] != t['text']:
                sys.exit(f'turn {t["id"]} differs between {name} and {by_export[-1][0]}')

    with open(out, 'w', encoding='utf-8') as f:
        for i, t in enumerate(by_export[-1][1], 1):
            data = {'seq': i, 'text': t['text'], 'first_seen_in': first[t['id']]}
            if t['attachments']:
                data['attachments'] = [{k: a[k] for k in ('name', 'mimeType', 'size', 'width', 'height') if k in a}
                                       for a in t['attachments']]
            rec = {'id': t['id'], 'at': None, 'type': 'message', 'actor': t['role'], 'data': data}
            f.write(json.dumps(rec, ensure_ascii=False) + '\n')
    print(f'{len(by_export[-1][1])} turns from {len(exports)} exports -> {out}')


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    if len(sys.argv) > 2:
        extract(root, sys.argv[2])
    else:
        for out in sorted(glob.glob(os.path.join(root, 'traceability', '*.jsonl'))):
            extract(root, out)


if __name__ == '__main__':
    main()
