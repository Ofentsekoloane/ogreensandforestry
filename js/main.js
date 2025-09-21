
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a.page-scroll').forEach(link => {
    link.addEventListener('click', function(e) {
      if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
        let target = document.querySelector(this.hash) || document.getElementsByName(this.hash.slice(1))[0];
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - 50,
            behavior: 'smooth'
          });
          e.preventDefault();
        }
      }
    });
  });

  // Show Menu on Book
  window.addEventListener('scroll', () => {
    const navHeight = window.innerHeight - 500;
    const navbar = document.querySelector('.navbar-default');
    if (window.scrollY > navHeight) {
      navbar.classList.add('on');
    } else {
      navbar.classList.remove('on');
    }
  });

  // Hide nav on click (for mobile)
  document.querySelectorAll('.navbar-nav li a').forEach(link => {
    link.addEventListener('click', () => {
      const toggle = document.querySelector('.navbar-toggle');
      if (toggle && getComputedStyle(toggle).display !== 'none') {
        const collapse = document.querySelector('.navbar-collapse');
        if (collapse) collapse.classList.remove('in');
      }
    });
  });

  // Nivo Lightbox (still jQuery-based)
  if (window.jQuery && jQuery.fn.nivoLightbox) {
    jQuery('.portfolio-item a').nivoLightbox({
      effect: 'slideDown',
      keyboardNav: true
    });
  }

  // Testimonial Slider (still jQuery-based)
  if (window.jQuery && jQuery.fn.owlCarousel) {
    jQuery('#testimonial').owlCarousel({
      navigation: false,
      slideSpeed: 300,
      paginationSpeed: 400,
      singleItem: true
    });
  }
});