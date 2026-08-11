// ---- history.js: simple snapshot-based undo/redo stack for the canvas ----

const HistoryStack = (() => {
  let undoStack = [];
  let redoStack = [];
  const MAX_STATES = 40;

  function push(dataUrl) {
    undoStack.push(dataUrl);
    if (undoStack.length > MAX_STATES) undoStack.shift();
    redoStack = []; // any new action clears redo history
  }

  function undo(currentDataUrl) {
    if (undoStack.length <= 1) return null; // nothing before current state
    redoStack.push(undoStack.pop());
    return undoStack[undoStack.length - 1];
  }

  function redo() {
    if (!redoStack.length) return null;
    const next = redoStack.pop();
    undoStack.push(next);
    return next;
  }

  function reset(initialDataUrl) {
    undoStack = [initialDataUrl];
    redoStack = [];
  }

  function canUndo() { return undoStack.length > 1; }
  function canRedo() { return redoStack.length > 0; }

  return { push, undo, redo, reset, canUndo, canRedo };
})();
