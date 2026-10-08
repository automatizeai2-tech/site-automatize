# Relatório do build · site da Automatize.AI (08/10/2026)

**Brief:** autoral, sob delegação criativa explícita do Pettrus (respostas por voz; ver BRIEF.md).

**Gramática:** Mundo contínuo (worldflight). Por que as outras sete perderam: plano-sequência corta em atos e o pedido foi "mundo contínuo"; editorial pede cortes secos e página de rosto; superfície viva exigiria o produto rodando numa tela própria (ele roda no WhatsApp); pôster tipográfico descarta a prova visual do produto; galeria é para coleções; palco dividido serviria só à comparação; lista de cortes é pulso, e a marca pede calma.

**Movimento-assinatura:** o telefone que você conduz. Um telefone em HTML real atravessa a página; o scroll avança a conversa (10 mensagens numa clínica ilustrativa, rotulada) e, na última perna, o telefone vira o do visitante: a mensagem "Quero saber como funciona no meu negócio" já está escrita e o botão abre o WhatsApp da agência.

**Portão de impressão digital:** registro vazio antes deste build; passa por construção. Linha acrescentada.

**Jornada (ordem do site atual, como pedido):** A mensagem chega → Resultados reais → O que muda → Como funciona → Falar com a gente (rodapé dentro).

**Curva pretendida:** reconhecimento/alívio → assombro (pico) → clareza → confiança → intimidade/resolução.

**Curva sentida (scroll a frio nas folhas de contato, desktop e celular):** curiosidade → ordem/satisfação → leitura → ritmo → chegada. Diferenças: (1) o começo lê mais como "curiosidade" do que "reconhecimento": a dor (recepção no almoço) aparece só na segunda mensagem do telefone; mantive, porque o alívio em seguida é o que o brief pede, mas é o ponto a ajustar se o Pettrus quiser mais dor no hero. (2) O pico lê como "ordem" (a parede se montando e as barras subindo) mais do que "assombro": é o momento de maior mudança visual e o maior trecho de scroll, como planejado. O fechamento resolve: a câmera para e o botão fica.

**Partitura:** 5 pernas, uma velocidade (0,22 vh/s): 2,2 · 3,08 · 2,2 · 2,2 · 2,2 vh; seam 0,16; janelas no BRIEF.md.

**Assets:** tudo próprio. Mundo renderizado em Remotion (`mundo/`), 1920x1080 e 1080x1920, 54 s cada, cortado em 5 pernas por modo; h264 GOP 8 (desktop, encode.sh) e GOP 4 (celular, 720x1280); WebM/VP9 720p como fallback para navegadores sem h264 (o JS da página troca a extensão quando `canPlayType` h264 é vazio). Pôsteres WebP extraídos dos mp4 codificados. Logo vetorizado em SVG (claro/escuro/símbolo) a partir do JPG. Fontes Sora e Inter auto-hospedadas. Nenhum gasto em kie.ai.

**Verificado (harness da skill, Chromium headless 1194 com os WebM):**
- Desktop 1440x900: 48 posições; nenhum scroll morto; as 5 pernas chegam à opacidade total e pintam quadro real; contraste de todos os blocos ≥ 4,5:1 no pior quadro.
- Celular 390x844: idem; contraste ok; números e cabeçalho do telefone sem quebra.
- Movimento reduzido: nenhum clipe baixado, pôsteres e textos chegam à opacidade total, sem transform.
- worldflight-assert: 23 de 24. A única falha é "a perna que sai só libera quando está totalmente coberta": no pixel exato do fim da costura (y = 2052 px) a perna anterior ainda está em 1 e cai a 0 no pixel seguinte; é arredondamento de ponto flutuante no engine (`t < c1 + S/2`), invisível ao olho e não editável por projeto.

**O que o harness não cobre, e não foi verificado:** iPhone real (decodificador, Baixo Consumo, toque). `references/device-diag.html` deve ser publicado ao lado do site no primeiro relato de celular. O harness reporta "CLIPE CONGELADO" para pernas de worldflight paradas no último quadro enquanto estão ocultas; é a checagem do modo de atos aplicada a pernas, não um defeito visível (as checagens específicas do worldflight passam).

**Pendências para o Pettrus:** ver o site no ar; decidir se mantém o vídeo antigo (fora do Brand Book); confirmar fontes Sora+Inter; fechar agosto da OdontoLuz antes de usar 23,1% em peça nova; domínio/subdomínio na Hostinger.
