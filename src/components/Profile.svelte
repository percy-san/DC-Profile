<script type="text/javascript">
	import Members from './Members.svelte'
	
</script>

<div class="profile ">
	<h2 class="group-profile-header">Group Profile<hr></h2>
	<div class="uk-child-width-1-2@m info" uk-grid>
		<div class="left"  uk-grid uk-scrollspy="cls: uk-animation-fade; delay: 100; repeat: false" >
			<p class="uk-text-normal uk-text-large uk-text-center">Dreamcatcher (드림캐쳐) is a seven member group consisting of: JiU, SuA, Siyeon, Handong, Yoohyeon, Dami, and Gahyeon, with each member representing a nightmare or fear. The group debuted on January 13, 2017 with the single album Nightmare, under Happyface Entertainment. They are currently under Dreamcatcher Company.</p>
		</div>
		<div class="right"  uk-grid uk-scrollspy="cls: uk-animation-fade; delay: 100; repeat: false">
			<img class="profile-img" src="../img/group-white-min.jpg">
		</div>
	</div>

	<div class="members">
		<h2 class="group-profile-header">Members<hr></h2>
		<Members/>

	</div>

</div>


<style type="text/css">
	@font-face {
  		font-family:haunting_attractionregular;
  		src: url(haunting_attractionregular.woff);
	}

	.group-profile-header{
		position: relative;
		width: 150px;
		font-family:haunting_attractionregular;
	}
	
	.left, img {
		display: flex;
		align-items: center;
	}


	hr{
		position: absolute;
		width: 50%;
		border: 2px solid black;
	}


	
</style>