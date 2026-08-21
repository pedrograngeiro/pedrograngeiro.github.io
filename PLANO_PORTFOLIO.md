# Plano para portfólio, blog e jardim digital

A proposta é organizar o site como três espaços integrados:

- **Portfólio:** o que foi construído.
- **Blog:** ideias desenvolvidas e artigos completos.
- **Jardim digital:** pensamentos curtos, anotações e aprendizados em evolução.

## Stack recomendada

- **Astro + TypeScript**
- **Markdown** para textos simples
- **MDX** quando um artigo precisar de componentes interativos
- **CSS próprio**, com poucas dependências
- **GitHub Pages** inicialmente
- **GitHub Actions** para publicação automática

Astro é adequado para sites de conteúdo e oferece coleções tipadas para organizar Markdown e MDX. O deploy estático no GitHub Pages também possui integração oficial.

- [Documentação de coleções de conteúdo do Astro](https://docs.astro.build/it/guides/content-collections/)
- [Deploy do Astro no GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)

Não adicionar banco de dados ou CMS no começo. Os próprios arquivos serão o conteúdo, e o histórico ficará preservado pelo Git.

## Estrutura do site

```text
/
├── início
├── projetos
│   └── projeto individual
├── blog
│   └── artigo
├── pensamentos
│   └── nota
├── agora
├── sobre
├── contato
└── tags
```

A página inicial deve mostrar rapidamente:

1. Quem você é.
2. O que você faz.
3. Dois ou três projetos importantes.
4. Seus textos e pensamentos mais recentes.
5. Como entrar em contato.

## Organização do conteúdo

```text
src/content/
├── projects/
├── blog/
└── notes/
```

Cada publicação pode ter metadados como:

```yaml
title: "Título"
description: "Resumo curto"
publishedAt: 2026-08-20
updatedAt: 2026-08-20
tags:
  - engenharia-de-software
draft: true
featured: false
```

Para os pensamentos, adicionar um estado:

```yaml
status: seedling # seedling, growing ou evergreen
```

Isso comunica que uma nota pode estar incompleta e continuar evoluindo.

Pensamentos realmente privados devem ficar em outro repositório privado ou sistema de notas. O site receberá apenas aquilo que foi selecionado para publicação.

## Plano de construção

### 1. Identidade e conteúdo

- Escrever uma apresentação de duas ou três frases.
- Escolher três projetos para destacar.
- Preparar uma biografia curta.
- Criar um artigo e três pensamentos iniciais.
- Definir domínio, nome e idioma principal.

### 2. MVP

- Configurar Astro e as coleções de conteúdo.
- Criar layout, cabeçalho e rodapé.
- Implementar início, projetos, blog, pensamentos e sobre.
- Adicionar modo claro e escuro.
- Garantir boa experiência no celular.
- Ocultar automaticamente conteúdos marcados como rascunho.

### 3. Organização e descoberta

- Criar páginas de tags.
- Adicionar busca local.
- Disponibilizar RSS para blog e pensamentos.
- Gerar sitemap e metadados sociais.
- Criar links entre notas relacionadas.
- Exibir datas de publicação e última atualização.

### 4. Publicação

- Criar workflow de deploy.
- Publicar no GitHub Pages.
- Configurar domínio próprio posteriormente.
- Validar acessibilidade, desempenho e links.
- Adicionar uma imagem social padrão.

### 5. Evolução

Depois do lançamento, considerar:

- Newsletter.
- Comentários via GitHub Discussions.
- Estatísticas sem rastreamento invasivo.
- Versão em inglês.
- Página de leituras ou referências.
- Visualização em grafo dos pensamentos relacionados.

## Critérios para lançamento

A primeira versão estará pronta quando possuir:

- Página inicial clara.
- Três projetos documentados.
- Um artigo publicado.
- Três pensamentos publicados.
- Página sobre e contato.
- Navegação funcional no celular.
- RSS, sitemap e metadados básicos.
- Deploy automático funcionando.

## Princípio do projeto

Lançar pequeno e transformar a publicação em hábito:

- O portfólio mostra resultados.
- O blog explica ideias.
- O jardim digital registra o caminho.
