import vscode from 'vscode';

export async function activate(ctx: vscode.ExtensionContext): Promise<void> {
  const imported = await import('./language.mjs');
  await imported.GmlProvider.activate(ctx);
}
