<script type="text/javascript">
	import Tabs from '../shared/Tabs.svelte'
	

	let tabItems = [
    	{ label: "Studio Album", value: 1 },
    	{ label: "Mini Album", value: 2 },
    	{ label: "Single Album", value: 3 },
  	];
	
  	let currentTab;

	const StudioAlbums = [
  		{ id:1, name:'The Beginning of the End', date:'September 11, 2019', cover:"Beginning_of_the_end.jpg",
  		  albumInfo:'The Beginning of the End is the first Japanese album and the first studio album by Dreamcatcher released in September 11, 2019',
  		  tracks:[
  		  	{name:'fdsfdsfs'},
  		  	{name:'fdsfdsfs'}
  		  	]

  		  
  		 
  		},

  		{ id:2, name:'Dystopia: The Tree of Language',date:'February 18, 2020',cover:"Tree_of_Language.jpg"},

  		{ id:3, name:'Apocalypse: Save us', date:'April 12, 2022', cover:"Apocalypse_Save_us.jpg" }
  	]

  	const MiniAlbums = [
  		{id:1, name:'Prequel', date:'July 27, 2017', cover:"Prequel.jpg" },

  		{id:2, name:'Nightmare - Escape the ERA', date:'May 10, 2018', cover:"Escape_The_Era.png" },

  		{id:3, name:'Alone in the city', date:'September 20, 2018 ', cover:"Alone_In_The_City.jpg" },

  		{id:4, name:'The End of Nightmare', date:'February 13, 2019',cover:"The_End_Of_Nightmare.jpg" },

  		{id:5, name:'Raid of Dream', date:'September 18, 2019',cover:"Raid_of_Dream.png" },

  		{id:6, name:'Dystopia: Lose Myself', date:'Aug 17, 2020',cover:"Dystopia_Lose_Myself.jpg" },

  		{id:7, name:'Dystopia : Road to Utopia', date:'January 26, 2021',cover:"Dystopia_Road_to_Utopia.jpg" },

  		{id:8, name:'Summer Holiday', date:'July 30, 2021 ',cover:"Summer_Holiday.jpg" }	
  	]

  	const SingleAlbums = [
  		{ id:1, name:'Nightmare', date:'January 13, 2017', cover:"Nightmare.png"},

  		{ id:2, name:'Fall Asleep in the Mirror',date:'April 5, 2017',cover:"Fall_Asleep_in_The_Mirror.png"},

  		{ id:3, name:'What (Japanese Ver.)', date:'November 21, 2018', cover:"What_Japanese.png" },

  		{ id:4, name:'Piri ~ Fue wo Fuke ~', date:'March 13, 2019', cover:"PIRI_Japanese.jpg" },

  		{ id:5, name:'Endless Night', date:' March 11, 2020', cover:"Endless_Night.jpg" },

  		{ id:6, name:'Eclipse', date:' March 24, 2021.', cover:"Eclipse.png" }



  	]


	
</script>

<!--HTML-->
<Tabs bind:activeTabValue={currentTab} items={tabItems} />
<code class="language-text"></code>

	{#if 1 === currentTab}
		<div class="uk-child-width-1-2@s uk-child-width-1-3@m uk-text-center uk-grid-match" uk-grid>
			{#each StudioAlbums as studio (studio.id)}
				 <div>
			       <div class="uk-card uk-card-hover uk-card-default">
			            <div class="uk-card-media-top">
			                <img src={`../img/albums/${studio.cover}`} alt="cover">
			            </div>
			            <div class="uk-card-body">
			                <h3 class="uk-card-title">{studio.name}</h3>
			                <p>{studio.date}</p>
			            </div>
			        </div>
			    </div>
			{/each}
		</div>

	{/if}

	{#if 2 === currentTab}
		<div class="uk-child-width-1-2@s uk-child-width-1-3@m uk-text-center uk-grid-match" uk-grid>
			{#each MiniAlbums as mini (mini.id)}
				 <div>
			        <div class="uk-card uk-card-hover uk-card-default">
			            <div class="uk-card-media-top">
			                <img src={`../img/albums/${mini.cover}`} alt="cover">
			            </div>
			            <div class="uk-card-body">
			                <h3 class="uk-card-title">{mini.name}</h3>
			                <p>{mini.date}</p>
			            </div>
			        </div>
			    </div>
			{/each}
		</div>
	{/if}

	{#if 3 === currentTab}
		<div class="uk-child-width-1-2@s uk-child-width-1-3@m uk-text-center uk-grid-match" uk-grid>
			{#each SingleAlbums as single (single.id)}
				 <div>
			        <div class="uk-card uk-card-hover uk-card-default">
			            <div class="uk-card-media-top">
			                <img src={`../img/albums/${single.cover}`} alt="cover">
			            </div>
			            <div class="uk-card-body">
			                <h3 class="uk-card-title">{single.name}</h3>
			                <p>{single.date}</p>
			            </div>
			        </div>
			    </div>
			{/each}
		</div>
	{/if}

<!--CSS-->
<style type="text/css">
	@font-face {
  		font-family:haunting_attractionregular;
  		src: url(haunting_attractionregular.woff);
	}

	.uk-card-title{
		font-family:haunting_attractionregular;
	}

	
</style>