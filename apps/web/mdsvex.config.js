import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkGfm from 'remark-gfm';
import remarkGithub from 'remark-github';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const escape_svelty = (str) =>
//     str
//       .replace(/[{}`]/g, (c) => ({ '`': '&#96;', '{': '&#123;', '}': '&#125;' })[c])
//       .replace(/\\([trn])/g, '&#92;$1');

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: 'one-dark-pro'
};

const config = defineConfig({
  extensions: ['.svelte.md', '.md', '.svx'],
  layout: {
    // blog: './path/to/blog/layout.svelte',
    // article: './path/to/article/layout.svelte',
    // _: './path/to/fallback/layout.svelte'
    _: path.resolve(__dirname, './src/components/mdsvex.svelte')
  },
  highlight: false,
  rehypePlugins: [
    rehypeSlug,
    [rehypePrettyCode, rehypePrettyCodeOptions],
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'wrap',
        properties: {
          className: ['anchor']
        }
      }
    ]
  ],
  remarkPlugins: [
    remarkGfm,
    [
      remarkGithub,
      {
        repository: 'willin/svelte-turbo'
      }
    ]
  ],
  smartypants: {
    dashes: 'oldschool'
  }
});

export default config;
