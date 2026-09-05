---
title: 'Por dentro do FocoBot: arquitetura de um Pomodoro assíncrono para Discord'
description: 'Como um cronômetro comunitário evoluiu para um bot em Python com máquina de estados, ciclos assíncronos, áudio, comandos híbridos e sessões isoladas por servidor.'
publishedAt: 2026-08-23
updatedAt: 2026-08-23
tags:
  - python
  - discord
  - bots
  - programacao-assincrona
  - testes
draft: false
featured: true
---

O [FocoBot](https://github.com/pedrograngeiro/FocoBot) começou em 2021 com uma função bastante concreta: manter no Discord o ritmo de foco que uma comunidade já praticava em lives. O bot deveria iniciar 25 minutos de trabalho, sinalizar uma pausa curta de 5 minutos e, depois de alguns ciclos, oferecer uma pausa maior.

A regra parece simples quando escrita em uma linha. Em software, ela abre uma sequência de perguntas: quem controla o cronômetro? O que acontece quando alguém envia o mesmo comando duas vezes? Como pausar sem perder o tempo decorrido? Dois servidores podem usar o bot ao mesmo tempo? Como tocar um alerta sem bloquear a contagem?

Este artigo desmonta a implementação atual do projeto e mostra como essas perguntas foram transformadas em componentes. A [história que motivou o bot](/blog/focobonde-quando-estudar-junto-virou-um-bot/) está em um texto separado; aqui, o foco é a engenharia.

## 1. O domínio antes do Discord

No centro do projeto existe um `Timer` que não sabe o que é canal, mensagem, usuário ou áudio. Ele conhece apenas a duração máxima, a quantidade de segundos transcorridos e um estado.

```python
class TimerStatus(Enum):
    INITIALIZED = 1
    RUNNING = 2
    STOPPED = 3
    EXPIRED = 4
    PAUSED = 5
```

Essa separação é pequena, mas importante. O cronômetro pode ser testado sem conexão com o Discord e sem esperar 25 minutos reais. Cada chamada a `tick()` representa a passagem de um segundo; quando `ticks` alcança `max_ticks`, o estado muda de `RUNNING` para `EXPIRED`.

As transições permitidas formam uma máquina de estados enxuta:

```text
INITIALIZED ── start() ──→ RUNNING ── tick() ──→ EXPIRED
                              │  ↑
                         pause() resume()
                              ↓  │
                            PAUSED

RUNNING ou PAUSED ── stop() ──→ STOPPED
RUNNING ou PAUSED ── expire() ──→ EXPIRED
```

`pause()` só funciona durante uma execução; `resume()` só funciona quando o timer está pausado; e `tick()` não altera o contador fora do estado `RUNNING`. O comando de pular uma etapa reaproveita `expire()`, em vez de criar uma segunda forma de encerrar o tempo.

Também existem duas visões do mesmo contador: tempo decorrido e tempo restante. Ambas são formatadas por uma função pura baseada em `divmod`, sem depender de data, fuso horário ou relógio do sistema.

```python
@staticmethod
def format_ticks(ticks: int) -> str:
    minutes, seconds = divmod(ticks, 60)
    return f"{minutes:02d}:{seconds:02d}"
```

Essa escolha torna o comportamento previsível, embora traga uma limitação que veremos adiante.

## 2. Configuração como dado validado

As regras do Pomodoro ficam em uma `dataclass` imutável:

```python
@dataclass(frozen=True, slots=True)
class PomodoroConfig:
    focus_minutes: int = 25
    short_break_minutes: int = 5
    long_break_minutes: int = 10
    rounds_before_long_break: int = 4
```

Além de documentar os valores padrão, a classe valida limites: foco entre 1 e 180 minutos, pausas entre 1 e 60 e pausa longa a cada 1 a 12 ciclos. O restante do código não precisa repetir essas verificações.

No Discord, o comando `/configurar 50 10 20 3`, por exemplo, produz uma nova configuração apenas se o usuário tiver a permissão **Gerenciar Servidor**. Se um ciclo estiver em andamento, os valores entram em vigor na próxima etapa. Isso evita alterar silenciosamente a duração de um timer já iniciado.

A configuração é mantida em memória. Portanto, ela dura enquanto o processo do bot estiver ativo, mas volta ao padrão após uma reinicialização. Persistência em arquivo ou banco de dados seria uma evolução possível; para o escopo atual, a ausência dessa camada mantém a instalação simples e explicita que o bot não administra um histórico permanente dos usuários.

## 3. Uma sessão para cada servidor

A primeira versão do FocoBot tinha um único timer e um único contador de rodadas dentro do `Cog`. Isso funcionava para o servidor da comunidade, mas criava uma restrição estrutural: qualquer outro servidor compartilharia o mesmo estado.

Na implementação atual, o estado mutável foi reunido em `PomodoroSession`:

```python
@dataclass(slots=True)
class PomodoroSession:
    timer: Timer = field(default_factory=Timer)
    round: int = 0
    phase: str = "aguardando"
    timer_message: discord.Message | None = None
    timer_color: int = 0
    starting: bool = False
```

O `DiscordCog` mantém dois mapas indexados pelo identificador do servidor:

```python
self.sessions: dict[int, PomodoroSession] = {}
self.configurations: dict[int, PomodoroConfig] = {}
```

O isolamento por `guild_id` permite que servidores diferentes executem ciclos simultâneos, cada um com seu timer, sua rodada e seus tempos. Dentro de um mesmo servidor continua existindo uma única sessão, o que combina com outra regra do Discord: o bot só pode manter uma conexão de voz por servidor.

O campo `starting` fecha uma janela de concorrência. Conectar a um canal de voz envolve operações assíncronas; sem essa trava, dois comandos enviados quase juntos poderiam passar pela checagem de “timer ativo” antes que o primeiro ciclo começasse. Ao marcar a sessão como em inicialização, o segundo comando é rejeitado enquanto a conexão está sendo criada.

## 4. O ciclo assíncrono

O comando `comecar` verifica se foi usado em um servidor, recupera a sessão correta e exige que a pessoa esteja em um canal de voz. Depois, conecta ou move o bot para esse canal e entrega o controle a `run_cycle()`.

O fluxo pode ser resumido assim:

```text
!comecar ou /comecar
        ↓
validar servidor, sessão e canal de voz
        ↓
conectar ao canal
        ↓
iniciar foco + tocar alerta
        ↓
esperar expiração, parada ou comando de controle
        ↓
pausa curta ── ou ── pausa longa a cada quatro ciclos
        ↓
registrar rodada e reiniciar o fluxo
```

Cada etapa chama `run_stage()`. O método define a fase, inicia o timer, toca o áudio correspondente e envia uma mensagem incorporada. Em seguida, aguarda um segundo com `asyncio.sleep(1)` e avança o contador.

O `await` é o detalhe decisivo: enquanto uma sessão espera o próximo segundo, o loop de eventos pode processar comandos, editar mensagens e atender outros servidores. Não há uma thread dedicada para cada cronômetro.

O bot suporta comandos para pausar, retomar, pular, parar e encerrar. “Parar” preserva a contagem de rodadas; “encerrar” também zera essa contagem. Essa diferença traduz uma distinção da rotina real: interromper uma sessão por alguns minutos não é o mesmo que encerrar o período de estudo.

## 5. Feedback sem poluir o chat

Um timer compartilhado precisa ser observável. Enviar uma nova mensagem a cada segundo seria ilegível e aumentaria desnecessariamente o volume de chamadas à API do Discord. O FocoBot envia um único `embed` e o edita a cada cinco segundos.

```text
◐ Foco
████░░░░░░░░

Restante: 15:00
Decorrido: 10:00
Status: Rodando

Round 2 • atualização a cada 5 segundos
```

A barra possui 12 posições e é calculada pela razão entre tempo decorrido e duração total. Quatro caracteres — `◐`, `◓`, `◑` e `◒` — criam um indicador discreto de movimento. Estados especiais substituem a animação por símbolos estáticos de pausa, parada ou conclusão.

Quando a edição falha por uma exceção HTTP, o erro é registrado e a referência à mensagem é descartada. O cronômetro continua. Essa degradação é deliberada: perder a apresentação visual não deve interromper a etapa em execução.

Os alertas sonoros usam `FFmpegPCMAudio` e `PCMVolumeTransformer`. Há arquivos distintos para início do foco, pausa curta e pausa longa, reproduzidos no canal de voz com volume reduzido. O FFmpeg fica fora do pacote Python e precisa estar disponível no `PATH` da máquina que hospeda o bot.

## 6. Comandos antigos e novos na mesma interface

O FocoBot nasceu com comandos prefixados por `!`, como `!começar`, `!parar` e `!tempo`. A versão atual usa `hybrid_command` do `discord.py`: a mesma função pode ser chamada pelo prefixo tradicional ou como comando de barra.

O comando canônico é `/comecar`, sem acento, mas os aliases `!começar`, `!comecar` e `!foco` preservam o vocabulário usado pela comunidade. Essa compatibilidade exigiu habilitar o **Message Content Intent**, pois o bot ainda precisa ler o conteúdo das mensagens para reconhecer o prefixo.

No carregamento, `setup_hook()` registra o `Cog` de forma assíncrona e sincroniza a árvore de comandos com o Discord. A migração acompanha a API 2.x do `discord.py` sem obrigar quem já conhecia o bot a reaprender sua interface.

## 7. O que os testes protegem

A suíte separa três níveis de comportamento.

No domínio, os testes verificam inicialização, contagem, expiração, formatação, pausa, retomada, parada e rejeição de duração negativa. Na configuração, confirmam os valores clássicos e os limites aceitos. Na integração com Discord, usam objetos simulados para validar:

- registro dos comandos prefixados e de barra;
- presença dos arquivos de áudio;
- cálculo e apresentação da barra de progresso;
- edição da mensagem existente;
- isolamento de configurações e sessões por servidor;
- execução concorrente de etapas com `asyncio.gather`;
- rejeição de uma segunda inicialização;
- controle de permissão para alterar os tempos.

Os testes não precisam entrar em um servidor real nem esperar o relógio correr. O `asyncio.sleep` é substituído por uma função que apenas devolve o controle ao loop de eventos, e as mensagens são representadas por mocks assíncronos. Isso mantém a suíte rápida e concentra cada teste em uma regra observável.

## 8. Limitações técnicas

A arquitetura atual é adequada a um bot comunitário pequeno, mas não tenta esconder seus limites.

O tempo é contado pelo número de retornos de `asyncio.sleep(1)`. Sob carga, cada retorno pode ocorrer um pouco depois de um segundo; ao longo de uma sessão, esse atraso pode acumular. Uma versão mais rigorosa deveria guardar um instante monotônico de início e calcular o restante pela diferença entre relógios, usando os ticks apenas para atualizar a interface.

Sessões e configurações vivem no processo. Uma reinicialização perde rodadas, timers ativos e personalizações. Persistir esses dados exigiria definir como restaurar uma etapa interrompida e qual relógio usar durante o período offline — uma decisão de produto, não apenas a inclusão de um banco.

A mensagem é atualizada a cada cinco segundos por sessão. Essa frequência é confortável para poucos servidores, mas precisaria ser revista em uma instalação ampla por causa dos limites da API. Também não existe coordenação distribuída: executar duas instâncias do bot criaria dois conjuntos independentes de estado.

Por fim, os testes cobrem a lógica e a integração simulada, mas não substituem um teste real de permissões, conexão de voz, FFmpeg e sincronização de comandos no Discord.

## 9. Executando o projeto

O projeto requer Python 3.10 ou mais recente, FFmpeg e uma aplicação criada no Discord Developer Portal. Depois de configurar o token em `.env`, o fluxo local é curto:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m FocoBot
```

O token deve ser informado somente como variável `BOT_TOKEN`; ele não pertence ao código nem ao histórico do Git. No portal do Discord, o bot precisa de permissões para mensagens e voz, do `Message Content Intent` para os comandos com `!` e do escopo `applications.commands` para os comandos de barra.

## 10. Conclusão

O aspecto mais interessante do FocoBot não é a contagem de 25 minutos. É a tradução de um ritual coletivo para um pequeno sistema concorrente: uma máquina de estados controla o tempo, uma configuração valida as regras, uma sessão isola cada servidor e um `Cog` conecta tudo à interface do Discord.

O projeto também registra uma evolução comum em software. A primeira versão resolveu uma necessidade local com um único timer; os problemas encontrados durante o uso revelaram onde criar fronteiras, como preservar compatibilidade e o que merecia testes. A arquitetura não nasceu pronta — ela foi sendo extraída do comportamento que a comunidade precisava manter.

Essa origem ajuda a explicar por que o bot continua simples. Ele não tenta transformar foco em uma plataforma completa. Faz uma coisa específica: sustenta o ritmo de pessoas que decidiram estudar juntas, mesmo quando não havia uma live conduzindo o relógio.
