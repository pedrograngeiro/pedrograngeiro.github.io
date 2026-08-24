# Publicação de artigos

O blog pode ser administrado pelo [Pages CMS](https://app.pagescms.org/), que
edita os arquivos Markdown diretamente no repositório sem adicionar um banco de
dados ao site.

## Primeiro acesso

1. Entre no Pages CMS usando sua conta do GitHub.
2. Instale o GitHub App do Pages CMS apenas para este repositório.
3. Abra o repositório e selecione **Artigos**.

A configuração editorial fica em [`.pages.yml`](./.pages.yml). Novos artigos
são criados em `src/content/blog` com frontmatter compatível com a coleção do
Astro. Imagens enviadas pelo editor são armazenadas em
`public/images/articles` e inseridas no texto com URLs públicas.

## Fluxo de publicação

1. Crie o texto com a opção **Rascunho** ativada.
2. Salve e revise o artigo quantas vezes forem necessárias.
3. Desative **Rascunho** para publicá-lo.
4. O commit criado pelo CMS aciona o deploy normal do GitHub Pages.

O artigo `da-imagem-ao-grafo-editavel.mdx` e o modelo de artigo ficam fora do
editor visual porque usam, ou podem usar, recursos avançados de MDX. Eles devem
continuar sendo editados diretamente no código para preservar imports e
componentes Astro.
