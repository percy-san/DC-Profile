<script>
	import Hero from './components/Hero.svelte'
	import Profile from './components/Profile.svelte'
	import Discography from './components/Discography.svelte'
	import Media from './components/Media.svelte'
	import Footer from './shared/Footer.svelte'
	
</script>

<!--HTML-->
<main>
	<Hero />
	<div class="content">

		<div class="section" id="profile">
			<h1 class="section-header uk-text-bold">PROFILE</h1>
			<hr class="uk-divider-icon">
			<Profile />
		</div>

		<div class="section" id="discography" uk-scrollspy="cls: uk-animation-fade; target: .uk-card; delay: 200; repeat: false">
			<h1 class="section-header uk-text-bold">DISCOGRAPHY</h1>
			<hr class="uk-divider-icon">
			<Discography/>	
		</div>
		

		<div class="section" id="media" uk-scrollspy="cls: uk-animation-slide-bottom; delay: 200; repeat: false" >
			<h1 class="section-header uk-text-bold">Media</h1>
			<hr class="uk-divider-icon">
			<Media />
		</div>

	</div>
	<Footer />

	

	
</main>


<!--CSS-->
<style type="text/css">
	@font-face {
  		font-family:haunting_attractionregular;
  		src: url(haunting_attractionregular.woff);
	}
	main{
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		font-family:haunting_attractionregular;
	}
	.section{
		margin-top: 3rem;
	}


	.section-header{
		font-family:haunting_attractionregular;
		text-align: center;
		font-size: 3rem;
	}

	.content{
		padding: 30px;
	}

	
	

</style>

