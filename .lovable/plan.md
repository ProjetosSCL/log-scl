## Diagnóstico

No print do drawer:
- **Endereço:** "Paracatu · MG" → é o fallback `${cidade} · ${estado}` aplicado em `normalizeRows` quando `r.endereco` vem vazio.
- **Técnico:** "Não atribuído" → fallback de `csv-import.ts` quando a coluna não é encontrada.
- **Serviço:** "." e **Grupo Serviço** vazio → coluna não mapeada ou valor literal "." na origem.
- **Prestador:** "Mg - Paracatu Fra…" → truncado mas plausível.

Causa raiz: `parseRelatorioCsv` em `src/lib/csv-import.ts` reconhece apenas uma lista curta de nomes de cabeçalho por campo. Cabeçalhos comuns em exportações de relatório de OS (Logradouro, Rua, Endereço Cliente, Técnico Responsável, Nome Técnico, Tipo Serviço, Tipo de Serviço, Grupo de Serviço, Empresa Prestadora, Polo Atendimento etc.) não estão na lista, então `findCol` retorna -1 e o valor sai vazio.

Não há bug de renderização no `OsDrawer` — ele exibe corretamente o que existe no objeto OS. O conserto é no import.

## Plano

### 1. Ampliar candidatos de cabeçalho em `src/lib/csv-import.ts`

Adicionar sinônimos comuns para cada campo crítico em `findCol(...)`:

- **endereco:** `Endereço`, `Endereco`, `Logradouro`, `Rua`, `Endereço Cliente`, `Endereço Completo`, `Local`, `Local Atendimento`
- **tecnico:** `Técnico`, `Tecnico`, `Tecnico Responsavel`, `Técnico Responsável`, `Nome Tecnico`, `Atendente`, `Responsavel`
- **servico:** `Serviço`, `Servico`, `Tipo Servico`, `Tipo de Servico`, `Tipo Serviço`, `Descrição Serviço`, `Servico Solicitado`
- **grupoServico:** `Grupo Servico`, `Grupo de Servico`, `Grupo Serviço`, `Grupo de Serviço`, `Categoria Serviço`, `Família Serviço`, `Familia`
- **prestador:** `Prestador`, `Empresa Prestadora`, `Polo`, `Polo Atendimento`, `Parceiro`, `Fornecedor`
- **contratante:** `Contratante`, `Cliente Contratante`, `Empresa Contratante`, `Tomador`
- **observacoes:** acrescentar `Descrição`, `Descricao`, `Detalhes`, `Notas`
- **dataLimite:** acrescentar `Data SLA`, `Prazo Limite`, `Data Vencimento`
- **dataAtendimento:** acrescentar `Data Execução`, `Data Execucao`, `Data Visita`

### 2. Limpar valores "ruído" do CSV

Em `csv-import.ts`, depois do `get(...)`:
- Tratar `"."`, `"-"`, `"N/A"`, `"NA"`, `"--"` e strings só com pontuação como vazio (helper `cleanCell`).
- Aplicar em `servico`, `grupoServico`, `endereco`, `observacoes`, `tecnico`, `prestador`.

### 3. Melhorar fallback de endereço em `normalizeRows` (`src/lib/mock-data.ts`)

- Se `r.endereco` está vazio, exibir `"—"` em vez de `${cidade} · ${estado}`. Assim o usuário percebe que a coluna não veio no CSV e não confunde com a Cidade/UF que já é mostrada ao lado no drawer.

### 4. Feedback visível na importação (`src/routes/configuracoes.tsx` ou onde está o ImportCSV)

Já existe `detectedColumns` no `ParseResult`. Garantir que após importar, o toast/painel mostre claramente quais campos ficaram com "—" (não detectados), para o usuário renomear a coluna no CSV ou reimportar. Sem alterar layout — só reforçar a mensagem.

### 5. Manter `OsDrawer` como está

Sem mudanças funcionais; apenas valores corretos vão chegar nele.

## Arquivos afetados

- `src/lib/csv-import.ts` — ampliar `cols`, adicionar `cleanCell`.
- `src/lib/mock-data.ts` — fallback de `endereco` para `"—"`.
- `src/routes/configuracoes.tsx` (ou local do importador) — destacar campos não mapeados no resultado.

## Observação

Para validar 100% o mapeamento real, seria útil ver 1 linha de cabeçalho do CSV que está sendo importado. Mesmo sem isso, o aumento da cobertura de sinônimos cobre os formatos mais comuns de relatórios de OS no Brasil e resolve o caso do print.

Confirma para implementar?