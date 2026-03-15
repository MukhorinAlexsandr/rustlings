# -*- coding: utf-8 -*-
"""Analyze textbook.json for unexplained code elements in chapters 1-25."""

import json
import re
import sys

# Fix UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Elements to check for (first appearance in code without explanation)
SYMBOLS = {
    '!': 'macro (println!, vec!, etc)',
    '?': 'operator (Result/Option)',
    '..': 'range (exclusive)',
    '..=': 'range (inclusive)',
    '=>': 'match/closure',
    '::': 'path (module::item)',
    '[]': 'array/index',
    '{}': 'block/struct',
    '<>': 'generics',
    '&': 'reference',
    '*': 'dereference',
    '->': 'return type',
}

# Russian/English terms that indicate explanation
EXPLAINED_TERMS = {
    '{}': ['блок', 'скобк', 'фигурн', 'block', 'brace', 'функци', 'тело'],
    '::': ['::', 'путь', 'path', 'модул', 'module', 'двоеточи'],
    '..': ['..', 'диапазон', 'range', 'от', 'до'],
    '->': ['->', 'возврат', 'return', 'тип'],
    '&': ['&', 'ссылк', 'reference', 'заимств'],
    '*': ['*', 'разымен', 'dereference'],
    '=>': ['=>', 'match', 'стрелка', 'closure', 'замыкан'],
}

KEYWORDS = [
    'println!', 'print!', 'vec!', 'format!', 'dbg!', 'panic!',
    'unwrap', 'expect', 'Some', 'None', 'Ok', 'Err',
    'match', 'impl', 'String::from', 'Option', 'Result',
    'mut', '&str', '&mut', 'fn ', 'let ', 'return',
]

ATTRIBUTES = re.compile(r'#\[[^\]]+\]')

def extract_explanations(sections):
    """Extract all text content from text, note, tip, analogy sections."""
    text_parts = []
    for s in sections:
        if s.get('type') in ('text', 'note', 'tip', 'analogy'):
            if 'content' in s:
                text_parts.append(s['content'])
            if 'title' in s:
                text_parts.append(s['title'])
    return ' '.join(text_parts).lower()

def extract_code(sections):
    """Extract all code from code sections."""
    code_parts = []
    for s in sections:
        if s.get('type') == 'code':
            code_parts.append(s.get('content', s.get('code', '')))
    return '\n'.join(code_parts)

def find_unexplained(chapter_id, chapter_title, sections):
    """Find code elements not explained in the chapter text."""
    explanations = extract_explanations(sections)
    code = extract_code(sections)
    
    unexplained = []
    
    # Check symbols
    for sym, desc in SYMBOLS.items():
        if sym not in code:
            continue
        explained = False
        if sym in EXPLAINED_TERMS:
            explained = any(term in explanations for term in EXPLAINED_TERMS[sym])
        elif sym == '!':
            explained = any(t in explanations for t in ['макрос', 'macro', 'println', '!'])
        elif sym == '?':
            explained = any(t in explanations for t in ['?', 'оператор'])
        elif sym == '..=':
            explained = any(t in explanations for t in ['..=', 'диапазон', 'range'])
        elif sym == '<>':
            explained = any(t in explanations for t in ['<', '>', 'generic', 'обобщ'])
        elif sym == '[]':
            explained = any(t in explanations for t in ['[', ']', 'массив', 'array', 'индекс'])
        else:
            explained = sym in explanations
        if not explained:
            unexplained.append(desc)
    
    # Check keywords/functions
    for kw in KEYWORDS:
        if kw in code:
            kw_lower = kw.lower().replace('!', '')
            if kw_lower not in explanations and kw not in explanations:
                if kw == 'println!':
                    if 'println' not in explanations:
                        unexplained.append(kw)
                elif kw == 'vec!':
                    if 'vec' not in explanations:
                        unexplained.append(kw)
                elif kw == 'format!':
                    if 'format' not in explanations:
                        unexplained.append(kw)
                elif kw == 'unwrap':
                    if 'unwrap' not in explanations:
                        unexplained.append(kw)
                elif kw == 'expect':
                    if 'expect' not in explanations:
                        unexplained.append(kw)
                elif kw == 'Some':
                    if 'some' not in explanations and 'option' not in explanations:
                        unexplained.append(kw)
                elif kw == 'None':
                    if 'none' not in explanations and 'option' not in explanations:
                        unexplained.append(kw)
                elif kw == 'Ok':
                    if 'ok' not in explanations and 'result' not in explanations:
                        unexplained.append(kw)
                elif kw == 'Err':
                    if 'err' not in explanations and 'result' not in explanations:
                        unexplained.append(kw)
                elif kw == 'match':
                    if 'match' not in explanations:
                        unexplained.append(kw)
                elif kw == 'String::from':
                    if 'string' not in explanations and 'from' not in explanations:
                        unexplained.append(kw)
                elif kw == '&str':
                    if 'str' not in explanations and '&str' not in explanations:
                        unexplained.append(kw)
                elif kw == 'mut':
                    if 'mut' not in explanations:
                        unexplained.append(kw)
    
    # Check attributes
    if ATTRIBUTES.search(code):
        if '#' not in explanations and 'атрибут' not in explanations and 'attribute' not in explanations:
            unexplained.append('#[...] (attributes)')
    
    # Deduplicate and return
    return list(dict.fromkeys(unexplained))

def main():
    with open('static/data/textbook.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    report = []
    for ch in data:
        cid = ch.get('id')
        if cid is None or cid > 25:
            continue
        sections = ch.get('sections', [])
        if not sections:
            continue
        
        unexplained = find_unexplained(cid, ch.get('title', ''), sections)
        if unexplained:
            report.append({
                'chapterId': cid,
                'chapterTitle': ch.get('title', ''),
                'unexplained': unexplained
            })
    
    # Deduplicate: if "println!" in unexplained, remove "macro" (redundant)
    for r in report:
        u = r['unexplained']
        if 'println!' in u or 'vec!' in u or 'format!' in u:
            r['unexplained'] = [x for x in u if x != 'macro (println!, vec!, etc)']
        if 'match' in u:
            r['unexplained'] = [x for x in r['unexplained'] if x != 'match/closure']

    with open('report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
