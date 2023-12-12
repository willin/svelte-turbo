<script lang="ts">
  import { melt, type TableOfContentsElements, type TableOfContentsItem } from '@melt-ui/svelte';

  export let tree: TableOfContentsItem[] = [];
  export let activeHeadingIdxs: number[];
  export let item: TableOfContentsElements['item'];
  export let level = 1;
</script>

<ul class={level === 1 ? 'sticky top-20 z-[99] menu rounded-box' : ''}>
  {#if tree && tree.length}
    {#each tree as heading, i (i)}
      <li class="mt-0 pt-2">
        <a
          href="#{heading.id}"
          use:melt={$item(heading.id)}
          class="hover:text-primary data-[active]:text-primary">
          <!--
            Along with the heading title, the original heading node
            is also passed down, so you can display headings
            however you want.
          -->
          {@html heading.node.innerHTML}
        </a>
        {#if heading.children && heading.children.length}
          <svelte:self tree={heading.children} level={level + 1} {activeHeadingIdxs} {item} />
        {/if}
      </li>
    {/each}
  {/if}
</ul>
