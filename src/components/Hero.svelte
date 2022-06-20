<script>
	import Nav from './Nav.svelte'
	import Footer from '../shared/Footer.svelte'
	import HeroText from '../shared/HeroText.svelte'
	
</script>

<!--HTML-->
<div class="Hero">
	<div class="uk-position-relative">
	    <div class="uk-position-relative uk-visible-toggle uk-light" tabindex="-1" uk-slideshow ="animation:slide; autoplay: true; autoplay-interval: 6000 ">
		    <ul class="uk-slideshow-items">
		        <li>
		            <img src="../img/group-img-min.jpg" alt="group" uk-cover>
		            <div class="uk-position-center uk-position-small uk-text-center uk-light">
		                <p class="uk-margin-remove"><HeroText/></p>
		                
		            </div>
		        </li>
		        <li>
		            <img src="../img/group-black-min.jpg" alt="group-dark" uk-cover>
		            <div class="uk-position-center uk-position-small uk-text-center uk-light">
		                <p class="uk-margin-remove"><HeroText/></p>
		            </div>
		        </li>
		        <li>
		            <img src="../img/group-white-min.jpg" alt="group-white" uk-cover>
		            <div class="uk-position-center uk-position-small uk-text-center uk-light">
		               <p class="uk-margin-remove"><HeroText/></p>
		            </div>
		        </li>
		    </ul>
		    <a class="uk-position-center-left uk-position-small uk-hidden-hover" href="#" uk-slidenav-previous uk-slideshow-item="previous"></a>
		    <a class="uk-position-center-right uk-position-small uk-hidden-hover" href="#" uk-slidenav-next uk-slideshow-item="next"></a>
		</div>
		<Nav />

</div>


</div>


<!--CSS-->
<style type="text/css">

</style>
