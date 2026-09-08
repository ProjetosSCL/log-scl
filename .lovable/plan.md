## Objetivo

Automatizar a rotina diária: em vez de aplicar filtros e tirar print manualmente para cada par Contratante × Prestador, gerar todos os prints de uma vez a partir da Tabela Operacional e compartilhar direto no WhatsApp.

## Fluxo do usuário

1. Na **Tabela Operacional**, clicar no novo botão **"Exportar prints"** (ao lado de _Print_ / _Tela cheia_).
2. Abre um modal **"Prints diários"** listando todas as combinações Contratante × Prestador detectadas nos dados filtrados atualmente (respeita filtros de data/cidade já aplicados).
3. Cada linha do modal mostra:
   - Checkbox (marcada por padrão)
   - Contratante — Prestador
   - Quantidade de OS
   - Miniatura pequena da tabela gerada
4. Botões no rodapé:
   - **Gerar prints** → renderiza as imagens em memória e habilita as ações abaixo
   - **Compartilhar no WhatsApp** (aparece após gerar)
   - **Baixar todos (.zip)** como alternativa
5. Ao clicar em **Compartilhar no WhatsApp**:
   - **Mobile / navegadores com Web Share API de arquivos** (Chrome Android, Safari iOS): abre a folha nativa de compartilhamento com todas as imagens anexadas → escolher WhatsApp → escolher contato/grupo → enviar (1 toque final).
   - **Desktop**: abre um assistente passo-a-passo. Para cada par:
     - Imagem copiada automaticamente para o clipboard
     - Botão "Abrir WhatsApp Web" (`https://web.whatsapp.com/`) e instrução: colar (Ctrl/Cmd+V) no chat desejado
     - Botão "Próxima" avança para a próxima imagem
   - Motivo: a API do WhatsApp Web não aceita anexar imagens via URL; clipboard + colar é a forma mais rápida sem extensão.

## Geração das imagens

- Reaproveitar o `PivotTable` existente renderizado num container off-screen (posição fixa fora da viewport, mesma largura da tabela em foco).
- Para cada par selecionado:
  - Aplicar filtros `contratante=[X], prestador=[Y]` combinados com os filtros já ativos.
  - Renderizar, aguardar layout (`requestAnimationFrame` duplo), capturar com `html-to-image` `toPng` (mesmo helper já usado em `handleScreenshot`).
  - Nome do arquivo: `CONTRATANTE-PRESTADOR-YYYY-MM-DD.png` (ex: `TON-MACAU-2026-07-03.png`).
- Cabeçalho da imagem inclui o título "Contratante — Prestador" e a data, para casar com o formato dos prints atuais do WhatsApp.

## Onde mudar

Arquivos novos:

- `src/components/dashboard/BatchExportDialog.tsx` — modal, lista de pares, geração e ações de compartilhar/baixar.
- `src/lib/batch-export.ts` — utilitários: enumerar pares, renderizar off-screen, `toPng`, empacotar em zip (`jszip`), Web Share API, clipboard.

Arquivos alterados:

- `src/routes/tabela-operacional.tsx` — novo botão "Exportar prints" na barra de ações; abre o dialog passando `filters` e `all`.
- `package.json` — adicionar `jszip` (zip fallback).

Sem alterações em `mock-data`, filtros, ou lógica de negócio.

## Detalhes técnicos

- Detecção de suporte: `navigator.canShare?.({ files: [file] })` decide entre Web Share ou fluxo desktop.
- Clipboard de imagem: `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`.
- Off-screen render: portal para `<div style="position:fixed; left:-99999px; top:0; width:1280px">` para garantir largura consistente independente do zoom atual.
- Progresso: barra "Gerando X de N…" durante a captura em lote.
- Erros individuais não abortam o lote — par com erro é marcado com aviso e pulado.

## Limitações honestas (fora do escopo)

- Não é possível abrir o WhatsApp Web já com imagem anexada — é uma restrição do próprio WhatsApp, sem workaround via navegador. O clipboard + colar é o mais próximo de "1 clique".
- Envio 100% automatizado (sem clicar em "enviar" no WhatsApp) exigiria WhatsApp Business API, o que é um projeto separado — posso planejar depois se quiser.
