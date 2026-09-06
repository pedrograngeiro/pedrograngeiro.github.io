---
title: 'Pulso Territorial: monitoramento de conectividade no RJ com Python e JavaScript'
description: 'Da consulta externa ao estado no mapa: como o protótipo trata falhas de coleta, medições antigas e limites de cobertura ao investigar quedas de conexão no Rio de Janeiro.'
publishedAt: 2026-09-06
tags:
  - python
  - visualizacao-de-dados
  - dados-geograficos
  - conectividade
  - engenharia-de-software
draft: false
featured: false
---

Imagine esta sequência: às 14h, uma sonda de conexão associada a um município do Rio de Janeiro tem uma medição disponível. Às 14h05, a consulta à API falha por timeout. O mapa deve indicar que o município perdeu internet?

Não há informação suficiente para isso. O timeout ocorreu entre o nosso servidor e a API de coleta. Ele não informa o estado da conexão que a sonda estava medindo.

O **Pulso Territorial**, inicialmente chamado **Mapa do Silêncio**, foi criado para investigar quedas de conectividade no RJ, com interesse em situações como enchentes e deslizamentos. Identificar possíveis interrupções pode ajudar a direcionar verificações. Para isso, o sistema precisa separar uma queda observada de uma falha no caminho da coleta.

O projeto começou com uma simulação de silêncio digital e incorporou consultas reais de conectividade. Este artigo documenta essa evolução após a integração das fontes e a revisão da interface. O protótipo já trata falhas de coleta separadamente, mas ainda não identifica com precisão validada áreas isoladas nem emite alertas de desastre.

## Da consulta à informação exibida no mapa

Vamos acompanhar o caminho do RIPE Atlas. Uma sonda é um dispositivo que executa testes de rede a partir de uma conexão específica. O protótipo consulta resultados existentes de dois testes de ping IPv4; não cria novas medições.

O fluxo passa por cinco etapas:

1. **Consulta.** O navegador solicita `/api/ripe` ao servidor Python. O consumidor em `ripe.py` usa o catálogo público e os resultados dos testes, respeitando o cache da fonte.
2. **Normalização.** O backend trata a resposta externa e preserva os horários das medições. Uma consulta bem-sucedida agora pode trazer um resultado antigo; horário de coleta e horário de medição não são equivalentes.
3. **Associação territorial.** O módulo `territory.py` cruza coordenadas aproximadas com a malha municipal do IBGE. Pontos a menos de 1 km de uma borda ficam sem associação, para reduzir atribuições ambíguas.
4. **Resposta local.** O servidor entrega JSON com resumos municipais, situação da coleta e informação de cache. Coordenadas das sondas e endereços IP não entram nessa resposta.
5. **Apresentação.** O frontend combina a disponibilidade da fonte com a situação das amostras. O mapa mostra onde há observação recente, antiga ou ausente.

Voltando ao exemplo: se a consulta das 14h05 falhar e houver uma coleta anterior aproveitável, ela pode continuar visível, identificada como antiga. O sistema não fabrica uma medição de valor zero para preencher o intervalo.

Isso permite consultar a última informação disponível sem confundir seu horário com o da tentativa mais recente.

## Falha de coleta e resultado da medição são coisas diferentes

A lógica precisa responder a duas perguntas separadas:

- **Conseguimos coletar dados utilizáveis?** A consulta funcionou, falhou ou só temos cache antigo?
- **O que os dados permitem observar?** Há amostra recente, resultado antigo, queda de uma métrica ou informação insuficiente?

Uma requisição HTTP bem-sucedida não garante uma medição recente. Da mesma forma, uma requisição com erro não invalida o fato de que havia uma medição anterior; apenas impede tratá-la como evidência do estado atual.

| Situação | O que sabemos | Tratamento no protótipo |
| --- | --- | --- |
| A API falhou e existe cache anterior | A última coleta funcionou; a atualização falhou | Identificar os dados como antigos |
| A API falhou e não existe coleta aproveitável | Não conseguimos consultar a fonte | Mostrar indisponibilidade |
| A consulta funcionou, mas os testes são antigos | A fonte respondeu, sem amostra recente | Mostrar ausência de medição recente |
| Não há sondas associadas ao município | A fonte não oferece observação local naquele recorte | Mostrar “sem observação” |
| Na simulação, há queda detectada e a fonte está saudável | As regras do cenário identificaram um desvio | Mostrar silêncio digital no cenário sintético |

**Se a API cai e o código preenche a medição com zero, podemos gerar um falso positivo de apagão.** Os dados deste protótipo ficam em memória, mas o erro seria o mesmo ao gravar esse zero em um banco.

Zero observado, dado ausente e falha de coleta precisam continuar distintos. Um zero válido também exige interpretação: seu significado depende da métrica. Zero perda de pacotes, por exemplo, não significa falta de conexão.

## O que cada fonte consegue dizer

O mapa reúne informações com escalas diferentes. As consultas reais ficam separadas dos detectores sintéticos.

| Fonte | Uso no projeto | O que não podemos concluir |
| --- | --- | --- |
| IODA | Consultar séries de conectividade e eventos do estado do RJ | Qual município perdeu conexão |
| RIPE Atlas | Consultar testes de sondas públicas e mostrar cobertura de observação | Que o resultado representa todos os moradores e provedores |
| Cloudflare Radar | Exibir ocorrências reportadas e menções relacionadas ao RJ | Que uma menção delimita a área afetada |

Na tela do IODA, a variação compara o último valor com a mediana dos valores anteriores da janela. A mediana é a referência central dessa amostra, não um padrão histórico validado para aquele horário. A comparação descreve uma mudança; não calcula probabilidade de desastre.

No RIPE Atlas, um teste pode falhar em uma conexão enquanto outro provedor da mesma cidade continua funcionando. Também pode haver um problema no caminho até o destino testado. Por isso, uma sonda sem resposta não basta para pintar o município inteiro como desconectado.

A interface mostra a malha dos 92 municípios, mas alguns não têm amostras. “Com medição recente” significa que existe um teste recente, não que a internet está normal em toda a cidade.

O consumidor do Cloudflare Radar depende de token no processo do servidor. Sem a credencial, retorna `not_configured`. A integração está implementada, mas sua consulta autenticada ainda precisa ser validada com uma credencial válida.

Para indicar uma possível interrupção municipal com mais confiança, ainda será necessário avaliar concordância entre amostras, diversidade de conexões, duração da mudança e cobertura anterior. Essa combinação não está automatizada no protótipo.

## Por que manter a simulação separada

A demonstração usa atividade digital, chuva e relatos sintéticos de seis municípios do RJ. Ela serve para testar detecção e reprodução temporal com entradas conhecidas.

O gerador e o leitor de replay produzem um documento comum. A função `analyze_dataset(document)` calcula referências de atividade, detecta desvios e reúne evidências sem executar I/O.

```text
Gerador ou arquivo de replay
    -> documento normalizado
    -> análise
    -> JSON
    -> mapa e linha do tempo
```

A separação permite reproduzir um problema sem depender de uma API externa. O mesmo documento gera a mesma saída. Ao voltar na linha do tempo, a interface deve remover detecções que ainda não ocorreram naquele instante.

Os dados reais do IODA e do RIPE Atlas não alimentam automaticamente essa análise. Conectividade estadual, resultados de ping e contagens sintéticas de atividade são métricas diferentes. Uni-las exigiria definir uma regra de comparação e validar seu comportamento.

## Escolhas de arquitetura e seus custos

O backend usa Python 3.13 e sua biblioteca padrão. O frontend é vanilla: JavaScript em módulos, SVG e CSS. A demonstração não exige instalação de pacotes PyPI/npm, banco ou fila.

Essa escolha reduz o trabalho para executar o projeto:

```sh
python run.py
```

A aplicação fica disponível em `http://127.0.0.1:8000`. O servidor entrega tanto a interface quanto os endpoints. Os consumidores de fontes ficam em módulos próprios, enquanto `server.py` concentra a camada HTTP. No navegador, a interpretação dos estados fica separada do código de cartografia e dos controles.

O custo dessa estrutura aparece na operação:

- **Cache em memória:** evita consultas repetidas, mas não preserva o histórico entre reinícios.
- **Atualização sob demanda:** simplifica a execução local, mas pode deixar intervalos sem coleta quando ninguém consulta o servidor.
- **Sem framework de mapa:** mantém a implementação pequena, mas deixa projeção, gestos e posicionamento dos tiles sob responsabilidade do projeto.

O mapa-base usa tiles do OpenStreetMap. Se esse serviço falhar, o cenário continua disponível com um aviso de cartografia indisponível. Falha no desenho do mapa também não deve virar falha de observação territorial.

A exportação com `python tools/build_site.py` gera a interface e o cenário sintético em `dist/`. As consultas reais continuam dependendo dos endpoints Python. Publicar os arquivos estáticos não instala um coletor.

## O que os testes precisam proteger

Os testes são mais úteis quando expressam regras de interpretação. Duas suítes da interface verificam comportamentos centrais:

- Em `frontend.test.mjs`, uma fonte degradada deve produzir indisponibilidade, sem percentual de queda nem sequência de silêncio. Medição ausente ou referência esperada igual a zero deve produzir dados insuficientes.
- Em `monitoring.test.mjs`, falha da fonte ou cache antigo deve prevalecer sobre um município anteriormente observado. Ausência de sondas e ausência de resultados recentes permanecem estados distintos. Ocorrências nacionais não passam a ser ocorrências do município selecionado.

Esses testes usam entradas controladas. Eles verificam as regras codificadas, sem demonstrar precisão de detecção em uma interrupção real.

A navegação também recebeu correções: arrastar sobre pontos não deve selecionar municípios por acidente; o zoom mantém a posição geográfica sob o cursor; gestos de pinça permitem continuar o movimento com um dedo; redimensionar a janela preserva o enquadramento. Os testes de navegação cobrem ancoragem, limites de zoom e transições entre gestos.

Para executar as três suítes:

```sh
node --test tests/frontend.test.mjs tests/monitoring.test.mjs tests/map-navigation.test.mjs
```

## Próximos desafios técnicos

A prioridade é avaliar os detectores com séries históricas e interrupções conhecidas. Será necessário medir falsos positivos, falsos negativos e atraso de detecção, separando intervalos sem cobertura de intervalos efetivamente observados.

O baseline — a referência de atividade esperada — precisa considerar horário, dia da semana, sazonalidade e diferenças regionais. Uma redução recorrente durante a madrugada não deve receber o mesmo tratamento de uma queda inesperada em horário de atividade alta.

A coleta também precisa evoluir para execução agendada, histórico persistente e recuperação após reinícios. Isso permitirá investigar se uma lacuna veio da fonte, do coletor ou da ausência de uma medição.

Por fim, combinar fontes exige critérios explícitos de concordância e cobertura, sem atribuir precisão municipal a um sinal estadual. Essas regras precisam ser avaliadas antes de transformar o protótipo em um sistema de alertas.

[Código e instruções no repositório do Pulso Territorial](https://github.com/pedrograngeiro/pulso-territorial).
