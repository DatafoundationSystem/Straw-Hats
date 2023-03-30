(function ($) {
	
	"use strict";

	// Header Type = Fixed
  $(window).scroll(function() {
    var scroll = $(window).scrollTop();
    var box = $('.header-text').height();
    var header = $('header').height();

    if (scroll >= box - header) {
      $("header").addClass("background-header");
    } else {
      $("header").removeClass("background-header");
    }
  });


	$('.loop').owlCarousel({
      center: true,
      items:2,
      loop:true,
      nav: true,
      margin:30,
      responsive:{
          
          992:{
              items:4
          }
      }
  });
	

	// Menu Dropdown Toggle
  if($('.menu-trigger').length){
    $(".menu-trigger").on('click', function() { 
      $(this).toggleClass('active');
      $('.header-area .nav').slideToggle(200);
    });
  }


  // Menu elevator animation
  $('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        var width = $(window).width();
        if(width < 991) {
          $('.menu-trigger').removeClass('active');
          $('.header-area .nav').slideUp(200);  
        }       
        $('html,body').animate({
          scrollTop: (target.offset().top) + 1
        }, 700);
        return false;
      }
    }
  });

  $(document).ready(function () {
      $(document).on("scroll", onScroll);
      
      //smoothscroll
      $('.scroll-to-section a[href^="#"]').on('click', function (e) {
          e.preventDefault();
          $(document).off("scroll");
          
          $('.scroll-to-section a').each(function () {
              $(this).removeClass('active');
          })
          $(this).addClass('active');
        
          var target = this.hash,
          menu = target;
          var target = $(this.hash);
          $('html, body').stop().animate({
              scrollTop: (target.offset().top) + 1
          }, 500, 'swing', function () {
              window.location.hash = target;
              $(document).on("scroll", onScroll);
          });
      });
  });

  function onScroll(event){
      var scrollPos = $(document).scrollTop();
      $('.nav a').each(function () {
          var currLink = $(this);
          var refElement = $(currLink.attr("href"));
          if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
              $('.nav ul li a').removeClass("active");
              currLink.addClass("active");
          }
          else{
              currLink.removeClass("active");
          }
      });
  }



	// Page loading animation
	 $(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });

	

	// Window Resize Mobile Menu Fix
  function mobileNav() {
    var width = $(window).width();
    $('.submenu').on('click', function() {
      if(width < 767) {
        $('.submenu ul').removeClass('active');
        $(this).find('ul').toggleClass('active');
      }
    });
  }




})(window.jQuery);


function printEdge() {
  let text1 = '&#x220E; Edge Detection';

  var list_item = document.createElement("li");
  list_item.innerHTML = text1;
  
  const box = document.getElementById('comp-list');
  box.appendChild( list_item );

  var button = document.createElement( "button" );
  list_item.setAttribute( "id", "lid" );
  list_item.appendChild( button );

  button.setAttribute( "id", "bid" );
  button.innerHTML = "Remove"
  button.addEventListener('click', () => {
    list_item.remove();
    count = count - 1;
  });

  const hide_text = document.getElementById('list-text');
  hide_text.style.display='none';

}


function printObject() {
  let text2 = '&#x220E; Object Detection';

  var list_item = document.createElement("li");
  list_item.innerHTML = text2;
  // document.getElementById( 'list-text' ) = ""
  
  const box = document.getElementById('comp-list');
  box.appendChild( list_item );

  var button = document.createElement( "button" );
  list_item.setAttribute( "id", "lid1");
  list_item.appendChild( button );

  button.setAttribute( "id", "bid1" );
  // button.setAttribute( "onclick", "removeItem('lid1')" );
  button.innerHTML = "Remove"
  button.addEventListener('click', () => {
    list_item.remove();
    count = count - 1;
  });

  const hide_text = document.getElementById('list-text');
  hide_text.style.display='none';

}
