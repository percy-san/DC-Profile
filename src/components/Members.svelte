<script type="text/javascript">
	const Members = [
  {
    id:1, name:'Jiu',
    position:'Leader,visual',
    birthday:'May 17, 1994',
    instagram:'https://www.instagram.com/minjiu__u/',
    profileDark:'jiu.jpg'
    
  },
  {
    id:2,
    name: 'Sua',
    position:'Main dancer, Lead Rapper',
    birthday:'August 10, 1994',
    instagram:'https://www.instagram.com/sualelbora/',
    profileDark: 'sua.jpg'
    
  },

  {
    id:3,
    name: 'Siyeon',
    position:'Main vocalist',
    birthday:'October 1, 1995',
    instagram:'https://www.instagram.com/______s2ing/',
    profileDark:'siyeon.jpg' 
    
  },
  {
    id:4,
    name: 'Handong',
    position:'Sub vocalist',
    birthday:'March 26, 1996',
    instagram:'https://www.instagram.com/0.0_handong/' ,
    profileDark:'handong.jpg'
    
  },
  {
    id:5,
    name:'Yoohyeon',
    position:'Lead vocalist',
    birthday:'January 7, 1997',
    instagram:'https://www.instagram.com/ms.yoohyeonkim/' ,
    profileDark:'yoohyeon.jpg' 
    
  },
  {
    id:6,
    name:'Dami',
    position:'Main rapper, Lead dancer',
    birthday:'March 7, 1997',
    instagram:'https://www.instagram.com/00ld_ami/',
    profileDark:'dami.jpg'
    
  },
  {
    id:7,
    name: 'Gahyeon',
    position:'Maknae, Lead rapper',
    birthday:'February 3, 1999',
    instagram:'https://www.instagram.com/fox._.zzlo_/',
    profileDark:'gahyeon.jpg'

  },
]

	

</script>

<!--HTML-->
<div class="uk-position-relative uk-visible-toggle uk-light" tabindex="-1" uk-slider="clsActivated: uk-transition-active; center: true; autoplay: true " loading="lazy">
	 <ul class="uk-slider-items uk-grid">
	 	{#each Members as member (member.id)}
		 	<li class="uk-width-3-4">
	            <div class="uk-panel" uk-scrollspy="cls: uk-animation-fade; delay: 100; repeat: true">
	                <a  href="#modal-media-image" uk-toggle><img src={`../img/${member.profileDark}`} width="100%" height="500" alt="member photo"></a>
	                <div class="uk-overlay uk-overlay-primary uk-position-bottom uk-text-center uk-transition-slide-bottom">
	                    <h3 class="uk-margin-remove name uk-text-large .uk-text-bold">{member.name}</h3>
	                    <p class="uk-margin-remove">{member.position}</p>
	                </div>
	            </div>
              <div id="modal-media-image" class="uk-flex-top" uk-modal>
                <div class="uk-modal-dialog uk-width-auto uk-margin-auto-vertical">
                    <button  class="uk-modal-close-outside" type="button" uk-close></button>
                    <img src={`../img/${member.profileDark}`} width="1800" height="1200" alt="">
                </div>
            </div>  
	        </li>
              
		{/each}
	 </ul>
	  <a class="uk-position-center-left uk-position-small uk-hidden-hover" href="#" uk-slidenav-previous uk-slider-item="previous"></a>
    <a class="uk-position-center-right uk-position-small uk-hidden-hover" href="#" uk-slidenav-next uk-slider-item="next"></a>
</div>	
		
	



<!--<div class="uk-text-center uk-child-width-1-2@s uk-grid-match" uk-grid>
		{#each Members as member (member.id)}
			<div class="uk-card uk-card-hover uk-card-default ">
	    		<div class="uk-card-media-top">
	        		<img src={`../img/${member.profileDark}`} style="width:100%; " alt="member-img">
	    		</div>
	    	<div class="uk-card-body">
	    		<p>{member.name}</p>
	    		<p>{member.position}</p>
	    	</div>
	    	</div>				
		{/each}
	</div>-->
	
		



<!--CSS-->
<style type="text/css">

  @font-face {
      font-family:haunting_attractionregular;
      src: url(haunting_attractionregular.woff);
  }

  .name{
    font-family:haunting_attractionregular;
  }

	.members-area{
		display: grid;
		justify-content: space-evenly;
  		justify-items: center;
 		align-content: space-evenly;
  		align-items: center;
  		margin-left:10px;
	}


	.uk-card-body{
		background-color:#101820;
		color:#f2c763; 

	}
  p{
    color: #f2c763;
  }


	
</style>