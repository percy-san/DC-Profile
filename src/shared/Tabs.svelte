<script>
  import { onMount } from "svelte";

  export let items = [];
  export let activeTabValue;

  onMount(() => {
    // Set default tab value
    if (Array.isArray(items) && items.length && items[0].value) {
      activeTabValue = items[0].value;
    }
  });

  const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>

<ul >
  {#if Array.isArray(items)}
    {#each items as item}
      <li class={activeTabValue === item.value ? 'active' : ''} >
        <p on:click={handleClick(item.value)}>{item.label}</p>
      </li>
    {/each}
  {/if}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }

  p {
    font-size:25px;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  p:hover {
    text-decoration:underline;
    text-decoration-color:    #f2c763;
  }

  li.active > p {
    color:#8a2a2b;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
</style>