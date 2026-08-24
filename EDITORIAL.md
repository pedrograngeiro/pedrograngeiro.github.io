# Publicação de conteúdo

O portfólio pode ser administrado pelo [Pages CMS](https://app.pagescms.org/),
que edita os arquivos do repositório sem adicionar banco de dados ao site.

## Primeiro acesso

1. Entre no Pages CMS usando sua conta do GitHub.
2. Instale o GitHub App do Pages CMS apenas para este repositório.
3. Abra o repositório `pedrograngeiro.github.io`.

A configuração editorial fica em [`.pages.yml`](./.pages.yml). Imagens enviadas
pelo editor são armazenadas em `public/images/articles` e inseridas no conteúdo
com URLs públicas.

## Coleções

- **Artigos:** textos Markdown com editor visual e modo de código-fonte.
- **Artigos avançados (MDX):** textos com imports, componentes Astro ou JSX,
  editados como código MDX para preservar a sintaxe.
- **Projetos:** estudos de caso com papel, tecnologias, resultado, repositório e
  demonstração.
- **Pensamentos (MDX):** notas do jardim digital, incluindo o estado de
  maturidade e componentes Astro.

Os arquivos `modelo-artigo.mdx` e `modelo-projeto.mdx` são modelos internos e
não aparecem no CMS.

## Fluxo de publicação

1. Crie o conteúdo com a opção **Rascunho** ativada.
2. Salve e revise quantas vezes forem necessárias.
3. Preencha a data, as tags e os campos específicos da coleção.
4. Desative **Rascunho** para publicar.
5. O commit criado pelo CMS aciona o deploy do GitHub Pages.

Antes de salvar um item MDX, preserve os imports e os componentes existentes.
Uma alteração sintaticamente inválida será rejeitada pelo build do Astro e não
substituirá a última versão publicada com sucesso.
