import vscode from 'vscode';
import type { StitchProvider } from './extension.provider.mjs';
import {
  SemanticTokenModifier,
  SemanticTokenType,
  semanticTokensLegend,
} from './semanticTokens.mjs';

export class GameMakerSemanticTokenProvider
  implements vscode.DocumentSemanticTokensProvider
{
  constructor(readonly provider: StitchProvider) {}

  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
  ): vscode.SemanticTokens | undefined {
    const project = this.provider.getProject(document);
    if (!project) {
      return;
    }
    // const resource = project.filepathToResource(document);
    // const resourceFile = resource?.fileFromPath(document);
    // if (!resourceFile) {
    //   return;
    // }
    const resourceFile: any = null;

    const tokensBuilder = new vscode.SemanticTokensBuilder(
      semanticTokensLegend,
    );
    const identifiers = resourceFile.identifiers;

    const completions = [
      { label: 'hello' },
      // ...(project?.completions.values() || []),
      // ...this.provider.globalCompletions,
    ].reduce((acc, item) => {
      const name = item.label;
      acc[name] = item;
      return acc;
    }, {} as { [identifier: string]: vscode.CompletionItem });

    for (const [identifier, locations] of identifiers) {
      // What kind of token is this?
      const completion = completions[identifier];
      if (!completion) {
        continue;
      }

      let tokenType: SemanticTokenType | undefined;
      const tokenModifiers: SemanticTokenModifier[] = ['global'];
      const isBuiltIn = false; //this.provider.spec.identifiers.has(identifier);
      const isResource = false; //project.resourceNames.has(identifier);
      if (isBuiltIn) {
        tokenModifiers.push('defaultLibrary');
      }

      switch (completion.kind) {
        case vscode.CompletionItemKind.Constructor:
          tokenType = 'class';
          break;
        case vscode.CompletionItemKind.Function:
          tokenType = 'function';
          break;
        case vscode.CompletionItemKind.Variable:
          tokenType = 'variable';
          break;
        case vscode.CompletionItemKind.Constant:
          tokenType = isBuiltIn || isResource ? 'variable' : 'macro';
          if (isResource) {
            tokenModifiers.push('asset');
          }
          break;
        case vscode.CompletionItemKind.Enum:
          tokenType = 'enum';
          break;
      }
      if (!tokenType) {
        continue;
      }
      for (const location of locations) {
        tokensBuilder.push(location.range, tokenType, tokenModifiers);
      }
    }
    const tokens = tokensBuilder.build();
    return tokens;
  }

  register() {
    return vscode.languages.registerDocumentSemanticTokensProvider(
      'gml',
      this,
      semanticTokensLegend,
    );
  }
}
