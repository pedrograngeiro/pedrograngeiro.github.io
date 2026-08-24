---
title: 'FocoBonde: quando estudar junto virou um bot no Discord'
description: 'A história das lives de Pomodoro durante a pandemia, da comunidade reunida em torno da Clara e do bot criado para manter o ritmo coletivo quando a transmissão terminava.'
publishedAt: 2026-08-23
updatedAt: 2026-08-23
tags:
  - pomodoro
  - discord
  - comunidades-online
  - pandemia
  - open-source
draft: false
featured: false
---

# FocoBonde: quando estudar junto virou um bot

Durante a pandemia, estudar deixou de ser apenas uma atividade individual. Sem a mudança de ambiente, o caminho até a biblioteca ou a presença silenciosa de outras pessoas, era fácil perder a fronteira entre começar, continuar e parar. O dia acontecia inteiro no mesmo lugar.

Foi nesse período que passei a frequentar lives de Pomodoro. A principal era a da [Clara Matheus, na Twitch](https://www.twitch.tv/claramatheus). Na tela, o cronômetro alternava blocos de foco e descanso. Ao redor dele, o chat criava algo que o relógio sozinho não oferecia: companhia.

Da brincadeira com a palavra “foco” nasceu o nome **FocoBonde**. Era uma forma leve de reconhecer o grupo que voltava, estudava junto e compartilhava o mesmo ritmo. Não era uma turma reunida pela mesma matéria ou pela mesma prova. O ponto em comum era mais básico e, naquele momento, mais valioso: todo mundo estava tentando fazer o que precisava ser feito.

## Um relógio também pode ser um encontro

A técnica Pomodoro costuma ser explicada como um protocolo pessoal: escolher uma tarefa, trabalhar por 25 minutos, fazer uma pausa curta e repetir. Depois de alguns ciclos, descansar por mais tempo.

Nas lives, a técnica ganhava outra dimensão. O início da contagem era um compromisso público, ainda que informal. Durante o bloco de foco, saber que outras pessoas também estavam trabalhando diminuía a sensação de isolamento. Na pausa, o chat voltava a se mover. Cada ciclo tinha começo, meio e fim visíveis.

O valor da live não estava apenas em medir minutos. Estava em criar presença e cadência. Alguém iniciava o relógio; um grupo aceitava aquele intervalo; no final, todos recebiam o mesmo sinal para respirar e retornar.

Essa experiência se estendeu por meses, atravessando o período das Olimpíadas de Tóquio e continuando por algum tempo depois. As transmissões faziam parte de uma rotina que ajudava a organizar dias difíceis de distinguir entre si.

## Quando a live terminava

Uma comunidade formada em uma plataforma raramente permanece apenas nela. Quando a Clara não estava em live, algumas pessoas do grupo se reuniam no Discord. O canal mudava, mas a vontade era a mesma: continuar focando em conjunto.

Havia, porém, uma ausência prática. Na Twitch, o cronômetro e a condução da transmissão organizavam as etapas. No Discord, alguém precisava olhar a hora, avisar o início da pausa, lembrar a volta e contar quantos ciclos já tinham passado.

Foi daí que surgiu o [FocoBot](https://github.com/pedrograngeiro/FocoBot). A motivação não era criar mais um aplicativo de produtividade. Já existiam cronômetros. O que faltava era levar para o espaço da comunidade o ritual que funcionava na live.

O bot deveria ser simples: receber um comando no chat, iniciar um período de foco, avisar a pausa e continuar os ciclos. Sua utilidade vinha menos da novidade técnica e mais do lugar onde operava. Em vez de cada pessoa abrir seu próprio timer, o grupo compartilhava um relógio dentro do ambiente em que já conversava.

## “Rodando na base da gambiarra mas rodando”

O histórico do repositório começa em **23 de abril de 2021**. A mensagem do primeiro commit resume bem o espírito de um projeto que nasceu para resolver uma necessidade imediata:

> Rodando na base da gambiarra mas rodando.

No dia seguinte vieram as dependências e as primeiras limpezas. Em 26 de abril, o código principal já estava sendo reorganizado, surgiram testes para a função de tempo e a integração com o Discord passou a usar o conceito de `Cog`, que separa comandos e eventos em um componente próprio.

Essa sequência diz muito sobre aprender construindo. Primeiro, era preciso fazer o bot responder. Em seguida, o uso expunha problemas: comandos repetidos, contagem de tempo, estados do cronômetro, organização do código. Cada dificuldade dava nome à próxima mudança.

Durante maio, os commits registram correções no paralelismo, tradução de funções, contagem de rodadas e definição dos intervalos de 25 minutos de foco, 5 de pausa curta e 10 de pausa longa. O projeto não avançava como um exercício abstrato. As regras eram as mesmas que o grupo tentava praticar no Discord.

## O som que devolvia o grupo à sala

No começo, o bot usava mensagens no chat para anunciar foco e descanso. Em **2 de setembro de 2021**, uma contribuição de Guilherme Dias adicionou alertas de áudio. O FocoBot passou a entrar no canal de voz e tocar sons no início e no fim das etapas.

Essa mudança aproximava o Discord da experiência da live. Ninguém precisava vigiar o chat ou manter outra janela visível. O aviso chegava ao mesmo espaço sonoro ocupado pela comunidade.

Também é um detalhe que revela o caráter coletivo do projeto. O bot não foi apenas uma ideia sobre pessoas; ele recebeu contribuição de alguém que estava disposto a melhorar a experiência compartilhada. Código aberto, nesse caso, não era somente uma licença ou um repositório público. Era uma forma de deixar a comunidade participar do objeto que usava.

## O que realmente estávamos automatizando

É tentador descrever o FocoBot apenas por suas funções: contar segundos, alternar etapas, enviar mensagens e tocar áudio. Mas essa lista não explica por que ele precisava existir.

O bot automatizava um pequeno trabalho de coordenação. Antes dele, uma pessoa teria de assumir o relógio e interromper a própria tarefa para conduzir o grupo. Depois dele, a regra ficava a cargo de um participante previsível, sempre disponível e incapaz de se distrair com o que estava estudando.

Isso liberava todos para participar da mesma forma. Ninguém precisava ser o apresentador da sessão. Bastava entrar no canal, iniciar o ciclo e aceitar o ritmo comum.

Também havia uma motivação emocional. Durante a pandemia, muitas ferramentas digitais tentaram reproduzir pedaços do cotidiano que haviam desaparecido: a sala, o escritório, o intervalo e a presença casual. O FocoBot fazia isso em escala mínima. Ele não simulava um ambiente inteiro; apenas marcava o momento de trabalhar e o momento de voltar a conversar.

Às vezes, uma automação é valiosa justamente porque preserva espaço para relações humanas. Quanto menos o grupo precisava discutir o relógio, mais podia usar a pausa para estar junto.

## Um projeto moldado pelo uso

A primeira versão foi feita para um contexto específico. Havia um servidor, uma sessão e comandos iniciados por `!`. O objetivo declarado no README era ser simples, leve e funcional. Essa simplicidade combinava com o problema: não havia necessidade de contas, painel administrativo, ranking ou banco de dados.

Ao revisitar o projeto em 2026, mantive essa identidade e atualizei a implementação. O bot passou a aceitar também comandos de barra, ganhou pausa, retomada, salto de etapa, configuração de tempos, mensagem de progresso e sessões independentes por servidor. A base foi migrada para a geração atual do `discord.py`, e os comportamentos centrais receberam novos testes.

O vocabulário original permaneceu. `!começar` e `!foco` continuam válidos, mesmo ao lado de `/comecar`. Preservar esses comandos é preservar um pouco da maneira como o bot era chamado por quem o usava.

Essa revisão posterior não reescreve a origem. Pelo contrário: torna visível a distância entre o primeiro protótipo e o que aprendi depois sobre programação assíncrona, estado, concorrência e testes. O [artigo técnico sobre o FocoBot](/blog/por-dentro-do-focobot/) explora essa arquitetura em detalhes.

## O repositório como memória

Nem toda lembrança de uma comunidade aparece no código. O Git não registra as conversas durante as pausas, as tarefas que cada pessoa tentava concluir ou o alívio de encontrar companhia em um período isolado. Ele registra outra camada: as datas em que um problema técnico foi enfrentado, os nomes dados às funções e a chegada de uma contribuição.

O intervalo entre abril e setembro de 2021 está preservado em commits. Ele coincide com o período em que as lives, o Discord e o FocoBonde faziam parte da rotina. Lido anos depois, o repositório funciona como uma cronologia parcial — incompleta como toda memória, mas concreta o suficiente para devolver o contexto.

Há algo bonito em o primeiro commit não tentar parecer definitivo. “Rodando na base da gambiarra mas rodando” não descreve apenas o código. Descreve a urgência de fazer uma ideia funcionar para pessoas reais. A organização veio depois, guiada pelo que o uso ensinou.

## O que ficou daquele período

O FocoBot nasceu porque uma rotina dependia de uma presença e precisava continuar quando essa presença não estava ao vivo. A resposta foi transformar parte do ritual em software, sem tentar substituir a comunidade que lhe dava sentido.

Do ponto de vista técnico, o projeto foi uma oportunidade de aprender Python, eventos assíncronos, bots, testes e áudio no Discord. Do ponto de vista pessoal, ele foi a materialização de uma experiência de estudo coletivo durante a pandemia.

As duas histórias são inseparáveis. O código existe porque havia um grupo; o grupo encontrou no código uma maneira de preservar seu ritmo. O nome FocoBonde capturava justamente isso: foco não como isolamento, mas como algo que podia ser praticado em companhia.

Anos depois, o bot permanece no GitHub. Talvez seu artefato mais importante não seja o cronômetro, e sim a lembrança de que uma ferramenta pequena pode nascer de uma necessidade humana muito específica — e carregar essa história mesmo depois que o relógio chega a zero.
