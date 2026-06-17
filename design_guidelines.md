# Manual de Identidade Visual e Diretrizes de Design (Design Guidelines) — MKPainel

Este documento serve como referência de design system, especificações de componentes e guias de layout para a implementação da interface do **MKPainel**. Ele foi elaborado com base nos arquivos de protótipo em `design/` (especialmente `styles.css` e os arquivos `.jsx`).

---

## 1. Paleta de Cores (Color Palette)
As cores do MKPainel foram concebidas para passar credibilidade corporativa, com estados semânticos claros para métricas críticas e alertas.

### 1.1 Cores Neutras (Neutrais)
Utilizadas para fundo da aplicação, painéis, bordas e hierarquia de texto. Possuem uma tonalidade sutilmente fria (`slate`).
*   **Background Geral (`--bg`):** `#f7f8fa` — Fundo principal das páginas.
*   **Surface (`--surface`):** `#ffffff` — Fundo de cartões (cards), tabelas e painéis internos.
*   **Surface Secundário (`--surface-2`):** `#fafbfc` — Utilizado para cabeçalhos de tabela, estados de hover em listas e fundos de cards secundários.
*   **Borda Comum (`--border`):** `#e4e7ec` — Linhas divisórias leves, bordas de tabelas e cartões.
*   **Borda Forte (`--border-strong`):** `#d0d5dd` — Bordas de inputs, botões secundários e elementos interativos.
*   **Texto Principal (`--ink-1`):** `#0f172a` — Títulos principais, valores de KPIs e texto de alta importância.
*   **Texto Secundário (`--ink-2`):** `#344054` — Descrições, labels e textos de apoio.
*   **Texto Terciário (`--ink-3`):** `#667085` — Subtítulos de gráficos, datas, metadados e ícones neutros.
*   **Texto Desabilitado / Apoio (`--ink-4`):** `#98a2b3` — Linhas divisórias internas, textos secundários e placeholders de inputs.

### 1.2 Cores de Marca (Brand Colors)
Tom de azul corporativo ativo usado para CTAs primários, estados selecionados e destaques da marca.
*   **Brand 50 (`--brand-50`):** `#eff4ff` — Fundo de itens ativos no menu lateral (Sidebar) e badges informativos.
*   **Brand 100 (`--brand-100`):** `#d1e0ff` — Bordas de cards de IA, focos e sombras leves de seleção.
*   **Brand 500 (`--brand-500`):** `#2e5bff` — Azul primário de foco de inputs, marcações e linhas ativas.
*   **Brand 600 (`--brand-600`):** `#1f47e6` — Cor padrão de botões primários (CTAs) e links de navegação.
*   **Brand 700 (`--brand-700`):** `#1a3bbf` — Cor de hover para botões primários e cabeçalhos de relatórios.
*   **Brand Ink (`--brand-ink`):** `#0a1f5c` — Azul marinho profundo usado na tela de login e textos internos da marca.

### 1.3 Cores Semânticas (Semantic Colors)
Usadas para feedbacks visuais, badges de status, variações de ROAS e tendências de performance.

| Canal Semântico | Variável | Cor Hex | Uso Comum / Exemplo |
| :--- | :--- | :--- | :--- |
| **Sucesso / ROAS Alto** | `--green-50` <br> `--green-500` <br> `--green-700` | `#ecfdf3` <br> `#12b76a` <br> `#027a48` | Badges ativos, ROAS $\ge 4.0x$, tendências de crescimento (`.up`), sinalizador em tempo real (`.live-dot`). |
| **Atenção / ROAS Médio** | `--amber-50` <br> `--amber-500` <br> `--amber-700` | `#fffaeb` <br> `#f79009` <br> `#b54708` | Contas próximas de acabar o saldo (2 a 7 dias), ROAS entre $2.5x$ e $3.9x$, alertas médios. |
| **Crítico / Sem Saldo** | `--red-50` <br> `--red-500` <br> `--red-700` | `#fef3f2` <br> `#f04438` <br> `#b42318` | Contas sem saldo ($0$ a $1$ dia restante), ROAS $< 2.5x$, alertas críticos, tendências de queda (`.down`). |

### 1.4 Cores de Plataformas de Anúncios
Estilizações específicas para identificar rapidamente a origem dos dados:
*   **Google Ads (`--google`):** `#1a73c2`
*   **Meta Ads (`--meta`):** `#4267b2`

---

## 2. Tipografia e Dimensões
A legibilidade de tabelas de dados numéricos é a maior prioridade na interface.

### 2.1 Fontes
*   **Sans-serif (`--font-sans`):** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`
    *   *Propriedades aplicadas ao body:* `-webkit-font-smoothing: antialiased; font-feature-settings: "ss01", "cv11";` (ativa conjuntos estilísticos do Inter para clareza em caracteres numéricos e alfabéticos).
*   **Monospace (`--font-mono`):** `"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace`
    *   *Propriedades:* `font-feature-settings: "tnum", "zero";` (ativa números tabulares e zero cortado). Usada exclusivamente em tabelas financeiras, valores de KPI e relatórios para manter os dígitos alinhados verticalmente.

### 2.2 Tamanhos e Pesos de Texto Comuns
*   **Body padrão:** `14px` (Line-height: `1.5`, peso `400` ou `500`).
*   **Textos de Metadados / Badges:** `11px` ou `12px` (Line-height: `1.5`, peso `600` ou `700`, frequentemente uppercase).
*   **Títulos de Seção (`.section-h h2`):** `16px` (Peso `700`, letter-spacing `-0.01em`).
*   **Títulos Principais (Topbar / Cards):** `18px` ou `20px` (Peso `700`, letter-spacing `-0.01em`).
*   **Valores de KPI Principais:** `28px` (Monospace, peso `700`, line-height `1.1`).
*   **Valores de KPI Densos (Mini):** `22px` (Monospace, peso `700`).

### 2.3 Espaçamentos e Margens do Layout (Layout Shell)
*   **Sidebar (Menu Lateral):** Largura de `240px` (Desktop). Reduz para `220px` em tablets. Em dispositivos móveis ($\le 768px$), vira um drawer off-canvas deslizante com largura de `280px` (ou `max-width: 86vw`).
*   **Topbar (Barra Superior):** Altura fixa de `64px` (Desktop/Tablet) e `56px` (Mobile).
*   **Padding Interno da Área Principal (`.main`):**
    *   *Desktop:* `24px 28px 40px`
    *   *Tablet:* `20px 20px 32px`
    *   *Mobile:* `16px 14px 100px`
*   **Arredondamento de Bordas (Border Radius):**
    *   Pequeno (`--radius-sm`): `6px` (Ex: guias/abas internas, botões compactos)
    *   Padrão (`--radius`): `8px` (Ex: botões regulares, inputs, linhas de alerta)
    *   Grande (`--radius-lg`): `12px` (Ex: cartões de KPI, tabelas, blocos gráficos)
    *   Extra Grande (`--radius-xl`): `16px` (Ex: painéis de onboarding)

### 2.4 Breakpoints Responsivos
*   **Tablet (`max-width: 1024px`):** Transforma grids de KPIs de 4 colunas em 2 colunas; grids de gráficos laterais empilham verticalmente.
*   **Mobile (`max-width: 768px`):** O menu lateral é ocultado e ativado por um botão hambúrguer fixado no topo esquerdo (`.sidebar-mobile-trigger`). As tabelas adquirem rolagem horizontal (`overflow-x: auto`) com a **primeira coluna (Cliente/Campanha) fixada horizontalmente** (`position: sticky; left: 0`).
*   **Micro Mobile (`max-width: 380px`):** Grids de KPIs empilham em 1 coluna única.

---

## 3. Estilização de Componentes Principais

### 3.1 KPI Cards (`.kpi`)
Responsáveis por apresentar os indicadores de performance consolidados.
*   **Estrutura HTML/React:**
    ```jsx
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className={`kpi-delta ${trend}`}> {delta} </span>
        <span>{note}</span>
      </div>
      <svg className="kpi-spark">...</svg>
    </div>
    ```
*   **Detalhes Visuais:**
    *   Fundo branco (`#ffffff`), borda leve (`#e4e7ec`), cantos arredondados de `12px`.
    *   **Sparkline de Fundo (`.kpi-spark`):** SVG posicionado de forma absoluta no canto inferior direito (`width: 100px`, `height: 40px`, `opacity: 0.6`, `pointer-events: none`). O traço do sparkline varia de cor baseando-se no acento semântico (Azul: marca; Verde: positivo; Vermelho/Laranja: negativo).
    *   **Micro-interação (Pulsação de Números):** A classe `.num-pulse` associada a animações CSS `pulseUp` (verde) e `pulseDown` (vermelho) faz o número piscar temporariamente e deslocar-se verticalmente ao receber novas atualizações via WebSocket/Sincronização.

### 3.2 Tabelas de Campanhas e Contas (`.table`)
Tabelas otimizadas para leitura rápida de dados consolidados.
*   **Classes e Elementos:**
    *   Cabeçalho (`thead th`): Texto em `11px`, peso `600`, em maiúsculas com espaçamento entre letras (`letter-spacing: 0.05em`), fundo em cinza claro (`var(--surface-2)`) e borda inferior.
    *   Células (`tbody td`): Altura confortável com padding `14px 16px`, texto em `13px`. Variações numéricas alinhadas à direita com a classe `.mono`.
    *   Indicadores de Plataforma (`.platform-pill`): Elemento oval flexível contendo um círculo colorido (`.platform-dot.google` / `.platform-dot.meta`) e a inicial do canal ("G" ou "M").
    *   Vencedor ROAS: Valores com alto retorno ($\ge 4.0x$) ganham realce em verde forte (`var(--green-700)`).
*   **Rolagem Sticky no Mobile:** No arquivo `styles.css:L1814-1816`, é garantido que a coluna do nome do cliente/campanha permaneça visível à esquerda durante o arraste da tabela em telas pequenas.

### 3.3 Painel de Sugestões de IA (`.ai-card`)
Apresenta relatórios acionáveis de inteligência artificial.
*   **Design:**
    *   Fundo em gradiente suave: `linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)`.
    *   Borda azulada `var(--brand-100)` para denotar processamento de inteligência.
    *   Gradiente radial decorativo simulando brilho de IA no canto superior direito.
*   **Itens Internos (`.ai-item`):**
    *   Fundo branco translúcido (`rgba(255, 255, 255, 0.7)`) e borda fina azulada.
    *   Exibição em destaque do impacto estimado no ROAS (`.ai-item-impact`, em verde monospace).
    *   Botões de ação rápida integrados (`.ai-action-btn` e `.ai-action-btn.ghost`).

### 3.4 Fluxo de Integração / Onboarding (`.onb-card`)
Componente central para configuração inicial do cliente (Conexão de contas com 1 clique).
*   **Fluxo do Stepper (`.onb-stepper`):**
    *   Relação de passos interligados por linhas finas (`.onb-step-line`).
    *   Indicadores circulares (`.onb-step-num`). Círculos concluídos recebem cor verde (`var(--green-500)`) e o ícone de check. Círculo ativo recebe a cor azul da marca (`var(--brand-600)`).
*   **Status de Conexão (`.connect-row`):**
    *   Fundo cinza claro (`var(--surface-2)`) por padrão.
    *   Ao autorizar, transiciona para a classe `.connected` (borda verde `#12b76a` e fundo esverdeado `#ecfdf3`) ou `.scanning` (borda azul de marca).
*   **Descoberta Automática de Contas (`.discover`):**
    *   Banner de alerta de marca exibindo em tempo real a importação histórica com uma barra de progresso horizontal (`var(--brand-600)`).

### 3.5 Alerta de Contas sem Saldo (Low Funds Card - `.lowfunds-card`)
Painel em grid que consolida as contas cujos fundos acabarão em até 7 dias.
*   **Cabeçalho (`.lowfunds-head`):**
    *   Possui um gradiente sutil avermelhado no topo (`linear-gradient(90deg, var(--red-50), transparent)`).
    *   Exibe um contador em destaque com o número de contas críticas.
*   **Grid de Contas (`.lowfunds-grid`):**
    *   Exibe cards menores com o saldo restante (em destaque com `.lowfunds-balance`).
    *   Pílula indicadora de dias restantes (`.lowfunds-days-pill`): Muda de cor com base na urgência (Vermelho $\le 1$ dia; Laranja $\le 3$ dias; Verde $\le 7$ dias).
    *   Barra de consumo horizontal (`.lowfunds-bar-fill`): Representa visualmente o tempo de vida do saldo baseado no consumo diário médio de anúncios.

---

## 4. Layouts de Páginas

### 4.1 Main Dashboard (Visão Geral)
*   **Estrutura:** Sidebar esquerda + Topbar superior (título da página, indicador de data, botões de exportação) + Corpo principal.
*   **Componentes integrados:**
    1.  **Tickbar de Sincronização (`.tickbar`):** Fixada no topo da área útil caso a opção de dados em tempo real esteja ativa. Exibe o círculo pulsante `.live-dot` e metadados de sincronização rápida.
    2.  **Filter Bar:** Barra horizontal de chips interativos (`.filter-chip`) para segmentação por plataforma (Todas, Google Ads, Meta Ads) e janelas temporais ("Hoje", "7d", "30d", "90d").
    3.  **Low Funds Panel:** Bloco vermelho de aviso de créditos.
    4.  **KPI Grid:** Consolidação financeira de gasto, conversões, cliques e CTR.
    5.  **Chart Grid (Gastos por Hora / Funil):** O gráfico principal de linhas e a barra de funil horizontal ocupam o topo.
    6.  **AI & Alertas:** Grade secundária contendo os cartões de insights de IA e a pilha de notificações de erro/atenção da agência.
    7.  **Tabela de Clientes:** Listagem final com sparkline de tendência de ROAS.

### 4.2 Account Detail (Detalhes do Cliente)
*   **Estrutura:** Sidebar esquerda + Topbar expandida + Área principal.
*   **Topbar Expandida:**
    *   Barra de breadcrumb no topo para fácil navegação ("Contas / Nome do Cliente").
    *   Avatar gigante do cliente (`.acct-logo` de `56px` com iniciais).
    *   Ações proeminentes: Compartilhar painel com o cliente (Link externo), Baixar PDF e Otimizar com IA.
    *   Barra de abas inferior ("Visão geral", "Campanhas", "Audiência", "Criativos", "Configurações").
*   **Área Principal (Aba Visão Geral):**
    *   Métricas agregadas do cliente selecionado.
    *   Desempenho analítico detalhado por plataforma (Google vs Meta lado a lado).
    *   Tabela de campanhas específicas do cliente com indicador de status semântico.

### 4.3 Client View (Público/Branded)
*   **Objetivo:** Interface compartilhável e limpa voltada para o cliente final. Oculta dados sensíveis internos da agência.
*   **Estrutura:**
    1.  **Preview Banner:** Barra azul superior permanente informando que se trata de uma pré-visualização. Contém botão de retorno para a agência.
    2.  **Branded Header:** Exibe logo e nome do cliente, período e dados de contato da agência gestora.
    3.  **Hero Stat Block:** Caixa com fundo escuro profundo (`#0f172a`), textura de grid técnico, exibindo em fonte de `56px` a receita total gerada. Apresenta realce em pílula azul para investimento, conversões, CPA e ROAS médio.
    4.  **Highlights Grid (`.cv-highlights`):** 3 colunas exibindo cards verdes com ícones semânticos para as maiores conquistas do período.
    5.  **Planos de Ação / Próximos Passos:** Lista vertical numerada descrevendo as ações humanas que a agência executará na semana seguinte.
    6.  **WhatsApp CTA:** Botão verde oficial do WhatsApp (`#25d366`) centralizado no rodapé para falar diretamente com o gestor da conta.

### 4.4 Login Screen
*   **Estrutura:** Grid dividido em 2 colunas simétricas (`.login-page`).
*   **Coluna da Esquerda (Apresentação):**
    *   Fundo gradiente corporativo escuro (`#0a1f5c` a `#2e5bff`).
    *   Marca com símbolo gráfico em relevo.
    *   Pitch comercial da plataforma com estatísticas importantes (Ex: volume de capital gerido).
*   **Coluna da Direita (Formulário):**
    *   Formulário centralizado com largura máxima de `380px`.
    *   Inputs de email e senha com padding de `12px 16px` (`.input-lg`) e foco com brilho azul translúcido.
    *   CTAs secundários de OAuth (Google e Meta Ads) integrados na parte inferior para login simplificado.

---

## 5. Mapeamento de Arquivos de Protótipo e Classes

Para consulta dos desenvolvedores durantes os commits de CSS e marcação JSX:

| Componente | Arquivo JSX de Origem | Classe CSS Principal | Arquivo de Estilo |
| :--- | :--- | :--- | :--- |
| Shell da App | `components.jsx` | `.app`, `.sidebar`, `.topbar` | `styles.css:L75-327` |
| KPI Cards | `dashboard.jsx` | `.kpi`, `.kpi-spark`, `.kpi-delta` | `styles.css:L330-388` |
| Low Funds Panel | `dashboard.jsx` | `.lowfunds-card`, `.lowfunds-item` | `styles.css:L1519-1650` |
| Tabelas e Pills | `dashboard.jsx` | `.table`, `.acct-cell`, `.platform-pill` | `styles.css:L775-829` |
| Insights de IA | `dashboard.jsx` | `.ai-card`, `.ai-item`, `.ai-action-btn` | `styles.css:L860-932` |
| Alertas | `alerts-page.jsx` | `.alerts-stack`, `.alert`, `.alert.amber` | `styles.css:L830-858` |
| Comparador (Vs) | `comparison.jsx` | `.versus-hero`, `.versus-side`, `.versus-divider` | `styles.css:L994-1082` |
| Combates (Battle) | `comparison.jsx` | `.battle-grid`, `.battle-card`, `.battle-row` | `styles.css:L1083-1153` |
| WhatsApp Mocks | `whatsapp.jsx` | `.wa-grid`, `.wa-phone`, `.wa-bubble` | `styles.css:L1359-1517` |
| Relatórios WL | `reports.jsx` | `.report-templates`, `.report-card`, `.wl-report` | `styles.css:L1208-1357` |
| Login Layout | `login.jsx` | `.login-page`, `.login-left`, `.login-right` | `styles.css:L407-564` |
| Onboarding | `onboarding.jsx` | `.onb-page`, `.onb-stepper`, `.connect-row` | `styles.css:L565-691` |
