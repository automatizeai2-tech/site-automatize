# BRIEF · site da Automatize.AI

**Autoral, sob delegação criativa explícita** (Pettrus, 08/10/2026, por voz).
As respostas literais dele estão entre aspas. O que ele delegou está marcado
como *decisão autoral*. Nada abaixo foi inventado como citação.

O build fica na raiz do repositório `automatizeai2-tech/site-automatize`
(index.html, assets/, engine). Esta pasta guarda só o brief e o relatório,
porque o GitHub Pages serve a raiz.

## Evidência x suposição

- **Evidência:** Brand Book v1.2, missão/visão/valores, registro de resultados
  (`claude/registro-clientes-resultados.md`), site atual no Lovable (ordem das
  seções), vídeo "Sobre" (Remotion), logo (JPG), decisão do prazo oficial e do
  número 8781.
- **Suposição autoral:** vibe, referências, curva de energia, pico,
  movimento-assinatura, família estética, assets gerados pela própria agência
  (mundo renderizado em Remotion, sem kie.ai).
- **Conflito registrado:** Pettrus pediu "manter o vídeo que está lá". O
  `hero-bg.mp4` atual mostra robôs humanoides num escritório (cena gerada). O
  Brand Book proíbe robôs e IA como conceito abstrato; nas instruções do
  projeto, em conflito vale o Brand Book. Além disso o arquivo não é
  alcançável a partir do ambiente de build. Decisão: o vídeo antigo fica fora;
  o hero mostra o produto funcionando. Pettrus foi avisado e pode reverter
  anexando o arquivo.

## As oito perguntas

1. **Vibe e referências.** *Decisão autoral:* **preciso, luminoso, calmo,
   humano, premium.** Referências (nenhuma é site): a luz de manhã de uma
   recepção de clínica bem cuidada; uma loja Apple vazia às 9h (ordem, vidro,
   silêncio, uma coisa por vez); a capa do álbum *In Rainbows* ao contrário
   (cor contida, não explosão). O Brand Book manda o modo claro para o site,
   então o mundo é claro: Névoa e branco, tinta Marinho, acento Oceano.

2. **Jornada, nas palavras dele.** "A jornada seção por seção seja a ordem
   que a gente tem hoje, dentro do site que está publicado no Lovable."
   Ordem atual: Hero → Resultados reais → O que muda no seu atendimento →
   Como funciona (4 passos) → Chamada para o WhatsApp → Rodapé (Instagram,
   assinatura). Mantida como cinco waypoints; o rodapé vira parte do
   fechamento.

3. **Curva de energia.** "Eu deixo por escolha sua." *Decisão autoral:*
   começa quieta (uma mensagem chegando na hora do almoço), sobe até o pico
   nos Resultados, baixa para a comparação (clareza, lida), sobe de leve nos
   passos (ritmo de caminhada) e pousa quieta no fechamento.

4. **Sensação e o único momento.** "O visitante deve sentir felicidade, uma
   vontade de continuar utilizando o site, porque ele é muito chamativo,
   diferente de coisas que ele vê no dia a dia." *Decisão autoral do único
   momento:* ver a enxurrada de mensagens se organizar sozinha e os números
   reais pousarem na tela (Resultados). Curva completa abaixo.

5. **Uma coisa que nenhum outro site faz.** "Eu deixo isso para você. Eu
   quero algo que mantenha o vídeo que está lá, mas traga inovações."
   *Decisão autoral (movimento-assinatura):* **o telefone que você conduz.**
   Um único telefone, em HTML de verdade, atravessa a página inteira. Rolar
   avança a conversa dentro dele, mensagem por mensagem, do primeiro "oi" ao
   agendamento confirmado. No fim, o mesmo telefone vira o seu: a última
   mensagem já está escrita e o botão de enviar abre o WhatsApp da
   Automatize.AI. Nenhum dispositivo do kit faz isso; é JS da página lendo
   `--sc-seg` e `--sc-segp`.

6. **Quão longe do minimalista.** "Não tenho muita ideia dessas perguntas."
   *Decisão autoral:* **premium-minimalista com um ponto de calor humano**,
   porque é a família que o Brand Book descreve (claro, direto, não técnico,
   não informal demais) e porque uma agência que vende ordem precisa parecer
   ordenada. Sem brutalismo, sem maximalismo.

7. **Mundo contínuo ou cenas.** "Um mundo contínuo seria um melhor cenário.
   Super interessante." → gramática **Mundo contínuo**, modo worldflight.

8. **Assets.** "Você já possui. O Brand Book já tem todo o material. Missão,
   visão, valores." Assets reais: logo (JPG, vetorizado em SVG para o site),
   paleta e fontes do Brand Book (Sora + Inter, auto-hospedadas), números do
   registro de resultados, vídeo "Sobre" (Remotion). As pernas do voo são
   renderizadas em Remotion pela própria agência (custo zero, sem kie.ai).
   Pettrus é dono de tudo que aparece.

## O mundo

**Nome:** *A sala de atendimento.* Um espaço claro e contínuo, Névoa com luz
branca vinda de cima e da frente, chão de vidro fosco que reflete pouco. Pelo
espaço viajam mensagens: cartões arredondados, sem texto (todo texto é HTML),
em Oceano e Teal translúcidos. A câmera avança sempre para a frente, numa
velocidade só, um dolly lento. Nada entra pelas bordas de surpresa; o que
aparece já estava longe e se aproxima.

Geografia do voo (cinco pernas, uma câmera, um ritmo):

| # | Waypoint | O que a câmera atravessa | O que o telefone mostra (HTML) |
|---|---|---|---|
| 1 | A mensagem chega | Luz de meio-dia. Mensagens surgem ao longe e vêm na direção do visitante, espaçadas, calmas. | 12h47, uma paciente pergunta sobre horário. Ninguém responde... então o Gestor responde. |
| 2 | Resultados reais | **Pico.** A enxurrada aperta, depois se organiza em fileiras e vira uma parede de barras subindo (a curva da OdontoLuz em forma, sem rótulo). | A conversa vira um agendamento confirmado. Os números reais pousam em HTML ao lado. |
| 3 | O que muda | O espaço se divide em duas faixas de luz, uma apagada (manual) e uma acesa (com o Gestor); a câmera passa pelo meio. | Follow-up automático no dia seguinte. |
| 4 | Como funciona | Quatro marcos de luz ao longo do caminho, um a cada passo; a câmera passa por cada um. | Lembrete de consulta e confirmação. |
| 5 | Quero saber como funciona | O espaço abre numa clareira branca e quieta; a câmera para. | Agora é o seu telefone: a conversa com o agente da Automatize.AI, última mensagem pronta para enviar. Rodapé dentro do fechamento. |

## Curva de sensação

```
1  Reconhecimento   meio-dia, a mensagem chega e fica sem resposta; o visitante já viveu isso
   → Alívio         o Gestor responde em segundos, no mesmo telefone
2  Assombro (pico)  a enxurrada se organiza sozinha e os números reais pousam
3  Clareza          dois lados lado a lado, lidos em silêncio, sem imagem brigando
4  Confiança        quatro marcos no caminho, um prazo de verdade (3 dias úteis, 7 de teste)
5  Intimidade       o telefone é o seu; a última mensagem é sua
   → Resolução      a câmera para, o botão fica, o rodapé está ali
```

Nenhum par adjacente repete sensação. Silêncio antes do pico: o fim da perna
1 é o momento mais quieto da página (a conversa respondida, o espaço vazio).

## O pico

> "as mensagens que estavam caindo em cima de mim se organizaram sozinhas e
> os números de verdade apareceram"

Vive na perna 2. Recebe a perna mais longa (14 s de filme contra 10 s das
outras), o único contador da página (números do registro, nada inventado) e o
silêncio da perna 1 antes dele.

## É o site em que...

> é o site em que você rola e a conversa do WhatsApp acontece na sua frente,
> e quando chega no fim o telefone é o seu e só falta apertar enviar.

Movimento-assinatura e frase apontam para o mesmo objeto (o telefone), e o
pico (Resultados) é o que esse telefone produz. Não há segundo pico.

## Silêncio autoral

Entre o fim da perna 1 e o começo da perna 2 (último 15% da perna 1) o
telefone fica parado na conversa respondida e o espaço quase vazio. É
intencional: é o respiro antes do pico. A verificação deve ler isso como
pausa, não como scroll morto (o filme continua avançando devagar, então o
harness verá movimento; a pausa é do texto, não da câmera).

## Regras herdadas do Brand Book (regras duras deste build)

- Nome "Automatize.AI"; modo claro; Sora títulos, Inter texto.
- Números só do registro, com período: 229 agendamentos (Társila, mai a
  ago/2026), 11,7% → 23,1% (OdontoLuz, abr a ago parcial), 69h50 (Joseli, até
  18/08), 1.199 encaminhamentos (X1, até 18/08), "mais de 4.800 leads".
  Encaminhamento nunca vira conversão. Joseli nunca vira conversão.
- Conversas do telefone levam a marca "Conversa ilustrativa".
- Nunca robôs, cérebros, fundador. Protagonista: o agente atendendo.
- CTA único: "Quero saber como funciona no meu negócio" → wa.me 8781.
- Prazo: entrega em até 3 dias úteis e 7 dias de teste grátis.
- Sem travessão longo; frases de até 20 palavras; títulos de até 12.
- Sem "diagnóstico", "auditoria", "consultoria".

## Gramática, portão e partitura (Etapa 2)

**Gramática: Mundo contínuo (worldflight).** As outras sete perderam porque:
plano-sequência fílmico corta em atos e o pedido foi literalmente "um mundo
contínuo"; editorial em capítulos pede cortes secos e página de rosto, o
oposto; superfície viva exigiria o produto real rodando (o Gestor roda no
WhatsApp, não numa tela própria); pôster tipográfico descarta a prova visual
do produto; galeria é para coleção de objetos, e a agência vende um produto
só; palco dividido serviria à comparação, mas é uma seção de cinco; lista de
cortes rítmica é pulso, e a marca pede calma.

**Movimento-assinatura:** o telefone que você conduz (ver pergunta 5).

**Portão de impressão digital:** registro vazio (`scrollcraft/FINGERPRINTS.md`,
primeiro build). Passa por construção. Linha a acrescentar depois de publicar:
mundo contínuo · navegação-mapa em trilho lateral com cinco waypoints ·
hero = posição de estabelecimento dentro do voo com telefone em HTML ·
5 pernas, 54 s de filme, 11,88 vh + 1 · fechamento = a câmera pousa e o
telefone vira input real · telefone conduzido pelo scroll.

**Partitura (uma velocidade: 0,22 vh por segundo de filme):**

| Perna | Waypoint | Filme | Peso (vh) | Início (vh) | Fração do trilho | Janela de texto |
|---|---|---|---|---|---|---|
| 1 | A mensagem chega | 10 s | 2,20 | 0,00 | 0,000 a 0,185 | `hero` |
| 2 | Resultados reais (pico) | 14 s | 3,08 | 2,20 | 0,185 a 0,444 | `0.20 0.43 0.2 0.25` |
| 3 | O que muda | 10 s | 2,20 | 5,28 | 0,444 a 0,630 | `0.46 0.62 0.2 0.25` |
| 4 | Como funciona | 10 s | 2,20 | 7,48 | 0,630 a 0,815 | `0.645 0.805 0.2 0.25` |
| 5 | Quero saber como funciona | 10 s | 2,20 | 9,68 | 0,815 a 1,000 | `0.835 1 0.25 0` |

Total 11,88 vh de pesos; trilho de 12,88 vh. `data-sc-seam="0.16"`,
`data-sc-lerp="0.12"` (worldflight.md §7c). Pernas mobile em 9:16 renderizadas
nativas, GOP 4.

Checagens: um ritmo só (peso ÷ segundos = 0,22 em todas); o pico tem a perna
mais longa por margem visível (3,08 contra 2,20); silêncio antes do pico no
fim da perna 1; o fechamento pousa e segura (janela `rOut` 0).
