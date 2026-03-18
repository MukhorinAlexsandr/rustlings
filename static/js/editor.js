let EditorView, EditorState, basicSetup, rust, keymap, oneDark;
let editorInstance = null;
let editorReady = false;
let loadPromise = null;
let currentTaskId = null;
let saveTimeout = null;

const STORAGE_PREFIX = 'rustlings_code_';

function saveCodeForTask(taskId, code) {
  if (!taskId) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + taskId, code);
  } catch (_) { /* quota exceeded — ignore */ }
}

export function loadCodeForTask(taskId) {
  if (!taskId) return null;
  try {
    return localStorage.getItem(STORAGE_PREFIX + taskId);
  } catch (_) {
    return null;
  }
}

export function clearCodeForTask(taskId) {
  if (!taskId) return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + taskId);
  } catch (_) { /* ignore */ }
}

function debouncedSave(taskId, code) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveCodeForTask(taskId, code), 400);
}

async function loadCodeMirror() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const [cmMod, langMod, viewMod, themeMod] = await Promise.all([
      import('https://esm.sh/codemirror@6.0.1'),
      import('https://esm.sh/@codemirror/lang-rust@6.0.1'),
      import('https://esm.sh/@codemirror/view@6.35.0'),
      import('https://esm.sh/@codemirror/theme-one-dark@6.1.2'),
    ]);
    EditorView = cmMod.EditorView;
    EditorState = cmMod.EditorState;
    basicSetup = cmMod.basicSetup;
    rust = langMod.rust;
    keymap = viewMod.keymap;
    oneDark = themeMod.oneDark;
    editorReady = true;
  })();
  return loadPromise;
}

function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function buildExtensions(onSubmit) {
  const isDark = getTheme() === 'dark';
  const extensions = [
    basicSetup,
    rust(),
    EditorView.theme({
      '&': {
        fontSize: '0.9rem',
        fontFamily: "'JetBrains Mono', monospace",
      },
      '.cm-content': {
        fontFamily: "'JetBrains Mono', monospace",
      },
      '.cm-gutters': {
        borderRight: 'none',
      },
      '&.cm-focused': {
        outline: 'none',
      },
    }),
    EditorView.lineWrapping,
  ];

  if (isDark) {
    extensions.push(oneDark);
  }

  if (onSubmit) {
    extensions.push(
      keymap.of([
        {
          key: 'Ctrl-Enter',
          mac: 'Cmd-Enter',
          run: () => {
            onSubmit();
            return true;
          },
        },
      ])
    );
  }

  extensions.push(
    keymap.of([
      {
        key: 'Tab',
        run: (view) => {
          const { from, to } = view.state.selection.main;
          view.dispatch({
            changes: { from, to, insert: '    ' },
            selection: { anchor: from + 4 },
          });
          return true;
        },
      },
    ])
  );

  return extensions;
}

export async function createEditor(container, initialValue, onSubmit, taskId) {
  await loadCodeMirror();

  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }

  container.innerHTML = '';
  currentTaskId = taskId || null;

  const saved = loadCodeForTask(currentTaskId);
  const doc = (saved != null && saved !== initialValue) ? saved : (initialValue || '');

  const extensions = buildExtensions(onSubmit);
  extensions.push(
    EditorView.updateListener.of((update) => {
      if (update.docChanged && currentTaskId) {
        debouncedSave(currentTaskId, update.state.doc.toString());
      }
    })
  );

  editorInstance = new EditorView({
    state: EditorState.create({ doc, extensions }),
    parent: container,
  });

  return editorInstance;
}

export function getEditorValue() {
  if (!editorInstance) return '';
  return editorInstance.state.doc.toString();
}

export function setEditorValue(value) {
  if (!editorInstance) return;
  editorInstance.dispatch({
    changes: {
      from: 0,
      to: editorInstance.state.doc.length,
      insert: value || '',
    },
  });
}

export function destroyEditor() {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
}

export function isEditorReady() {
  return editorReady;
}

export function preloadEditor() {
  loadCodeMirror().catch(() => {});
}
