# Impressões digitais

Todo site que você constrói com a **scroll-craft** ganha uma linha aqui,
acrescentada depois de publicado. O registro existe para que o seu próximo
build possa provar que é uma página diferente, e não uma repaginação de uma que
você já fez.

Este arquivo é **seu**. Ele começa vazio de propósito: o portão trata de não
repetir *a si mesmo*, então não tem nada a dizer até você ter construído algo.

As regras e o portão vivem em `references/uniqueness.md` da skill. Versão
curta:

**Um build novo precisa diferir de TODAS as linhas abaixo em pelo menos 4 das 6
dimensões.** Quatro contra cada linha individualmente, não quatro na média da
tabela. Se um build planejado falhar, mude o plano. Nunca edite uma linha para
abrir espaço para ele.

As seis dimensões são: **gramática**, **tratamento de navegação**, **dispositivo
do hero**, **forma da sequência de atos**, **padrão de fechamento**,
**movimento-assinatura**.

A dimensão 6 é gratuita, porque um movimento-assinatura é único por definição.
Então o portão na prática pede três a mais entre as cinco restantes, e um build
que muda só a gramática e o mundo vai falhar.

---

## O registro

| Build | Gramática | Tratamento de navegação | Dispositivo do hero | Forma da sequência de atos | Padrão de fechamento | Movimento-assinatura | Mundo | Porta |
|---|---|---|---|---|---|---|---|---|
| automatize (site da agência, out/2026) | Mundo contínuo (worldflight) | Mapa: trilho lateral fixo com 5 waypoints clicáveis + logo; no celular vira linha de pontos no topo | Posição de estabelecimento no voo: mensagens chegando, texto à esquerda, telefone em HTML à direita com a conversa começando | 5 pernas, 54 s de filme (10/14/10/10/10), 11,88 vh + 1, pico na perna 2 | A câmera pousa numa clareira branca e o telefone vira input real (mensagem pronta + enviar para o WhatsApp); rodapé dentro do bloco final | O telefone que você conduz: um só telefone em HTML atravessa a página, o scroll avança a conversa mensagem por mensagem e no fim o telefone é o do visitante | A sala de atendimento: espaço claro Névoa, painéis de vidro, mensagens-cartão sem texto, barras, marcos de luz (Remotion, sem kie.ai) | Claro (Brand Book) |


---

## O que está tomado

Acrescente um marcador aqui sempre que um build reivindicar algo que um build
posterior deve evitar reutilizar: uma gramática, um tratamento de navegação, um
padrão de fechamento, um movimento-assinatura, uma faixa de quantidade e
duração de atos. As colunas compartilhadas são o que o próximo build herda como
restrição, então escrevê-las é o objetivo inteiro.

- **Mundo contínuo com telefone em HTML conduzido pelo scroll** (automatize). O próximo site de cliente não pode repetir o telefone persistente nem o mapa em trilho lateral de 5 pontos; e se usar mundo contínuo, precisa diferir em hero, fechamento e forma das pernas.
- **Fechamento "a câmera pousa e o objeto vira input real"** (automatize).
- **Faixa de 5 pernas / ~12 vh** (automatize).

---

## Acrescentando uma linha

Depois de publicar, adicione uma linha à tabela e um marcador em **O que está
tomado** se o build reivindicou algo novo. Preencha todas as colunas. Diga o que
o build compartilha com as linhas existentes.

As linhas são só de acréscimo. Um build que foi substituído permanece na tabela,
porque o espaço que ele ocupa continua ocupado.

---

## Exemplo trabalhado

O autor da skill manteve um registro de doze builds em oito gramáticas de
página. Se você quiser ver como fica uma tabela preenchida, e quais formas
tendem a colidir, leia o `EXAMPLES.md` no repositório do scroll-craft. Trate-o
apenas como ilustração: aquelas linhas são builds de outra pessoa e **não**
restringem os seus.
