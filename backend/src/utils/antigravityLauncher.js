const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const logger = require('./logger');

class AntigravityLauncher {
  /**
   * Find the Antigravity IDE executable on the machine
   */
  static getBinaryPath() {
    const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\AGP KOHAT\\AppData\\Local';
    const candidates = [
      path.join(localAppData, 'Programs', 'Antigravity IDE', 'bin', 'antigravity-ide.cmd'),
      path.join(localAppData, 'Programs', 'Antigravity IDE', 'Antigravity IDE.exe'),
      'C:\\Users\\AGP KOHAT\\AppData\\Local\\Programs\\Antigravity IDE\\bin\\antigravity-ide.cmd',
      'C:\\Users\\AGP KOHAT\\AppData\\Local\\Programs\\Antigravity IDE\\Antigravity IDE.exe'
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return 'antigravity-ide';
  }

  /**
   * Open file at specific line in Google Antigravity IDE
   */
  static async openFileAtLine(fullFilePath, lineNumber = 1) {
    const bin = AntigravityLauncher.getBinaryPath();
    const cleanPath = path.resolve(fullFilePath);
    const target = `${cleanPath}:${lineNumber}`;
    const command = `"${bin}" -r -g "${target}"`;

    logger.info(`Launching Google Antigravity for coding: ${command}`);

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.warn(`Antigravity open-file warning: ${error.message}`);
          // Fallback to start URI
          const uri = `vscode://file/${cleanPath.replace(/\\/g, '/')}:${lineNumber}`;
          exec(`start "" "${uri}"`, () => {});
          return resolve({ success: true, mode: 'uri_fallback', uri });
        }
        resolve({ success: true, mode: 'cli_direct', target });
      });
    });
  }

  /**
   * Open entire project folder / workspace in Google Antigravity IDE
   */
  static async openWorkspace(projectPath) {
    const bin = AntigravityLauncher.getBinaryPath();
    const cleanPath = path.resolve(projectPath);
    const command = `"${bin}" -r "${cleanPath}"`;

    logger.info(`Opening workspace in Google Antigravity: ${command}`);

    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          logger.warn(`Antigravity open-workspace warning: ${error.message}`);
          return resolve({ success: false, error: error.message });
        }
        resolve({ success: true, projectPath: cleanPath });
      });
    });
  }

  /**
   * Launch active Google Antigravity Agent chat session with file context & prompt
   */
  static async launchAgentChat(fullFilePath, promptText) {
    const bin = AntigravityLauncher.getBinaryPath();
    const cleanPath = path.resolve(fullFilePath);
    const safePrompt = (promptText || 'Refactor SEO issues in this file').replace(/"/g, '\\"');
    const command = `"${bin}" chat -r -a "${cleanPath}" "${safePrompt}"`;

    logger.info(`Launching Google Antigravity Agent Chat: ${command}`);

    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          logger.warn(`Antigravity agent chat warning: ${error.message}`);
          return resolve({ success: false, error: error.message });
        }
        resolve({ success: true, file: cleanPath, prompt: safePrompt });
      });
    });
  }
}

module.exports = AntigravityLauncher;
