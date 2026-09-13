const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

class LocalFilePatcher {
  /**
   * Safely apply a code fix to a local file
   */
  static applyFix({ projectPath, filePath, lineNumber, replacementCode, originalCode }) {
    if (!projectPath || !filePath || !replacementCode) {
      throw new Error('Project path, file path, and replacement code are required.');
    }

    const resolvedRoot = path.resolve(projectPath);
    const resolvedFile = path.resolve(resolvedRoot, filePath);

    // Boundary security check: prevent directory traversal
    const relative = path.relative(resolvedRoot, resolvedFile);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Security check failed: File path is outside project root.');
    }

    if (!fs.existsSync(resolvedFile)) {
      throw new Error(`Target file does not exist: ${resolvedFile}`);
    }

    const content = fs.readFileSync(resolvedFile, 'utf-8');
    const lines = content.split('\n');

    // Create automatic safety backup
    const backupFile = `${resolvedFile}.bak`;
    try {
      fs.writeFileSync(backupFile, content, 'utf-8');
      logger.info(`Safety backup created at ${backupFile}`);
    } catch (e) {
      logger.warn(`Could not create backup file: ${e.message}`);
    }

    let modifiedContent = '';

    if (originalCode && content.includes(originalCode.trim())) {
      // Direct substring match
      modifiedContent = content.replace(originalCode.trim(), replacementCode.trim());
    } else if (lineNumber && lineNumber >= 1 && lineNumber <= lines.length + 1) {
      // Line-based replacement or insertion
      const idx = lineNumber - 1;
      const originalLine = lines[idx] || '';

      if (replacementCode.startsWith('+ ')) {
        // Insertion
        const cleanInsert = replacementCode.replace(/^\+\s*/, '');
        lines.splice(idx, 0, cleanInsert);
      } else {
        lines[idx] = replacementCode;
      }
      modifiedContent = lines.join('\n');
    } else {
      // Fallback: append inside <head> or at end
      if (content.includes('</head>')) {
        modifiedContent = content.replace('</head>', `  ${replacementCode}\n</head>`);
      } else {
        modifiedContent = `${content}\n${replacementCode}\n`;
      }
    }

    fs.writeFileSync(resolvedFile, modifiedContent, 'utf-8');
    logger.info(`Successfully patched file: ${resolvedFile}`);

    return {
      success: true,
      filePath,
      absolutePath: resolvedFile,
      backupPath: backupFile,
      patchedAt: new Date().toISOString()
    };
  }
}

module.exports = LocalFilePatcher;
