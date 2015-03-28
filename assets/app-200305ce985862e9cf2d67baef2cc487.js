$(function() {
    function init() {
        wireViewFromTheTop();
        wireFancybox();
    }
    
    function wireViewFromTheTop() {
        $('.show-view').click(function(e) {
            e.stopPropagation();
            
            $('.mountain-section .section-content').animate({
                right: $('body').width()
            }, 1500);
            $('.mountain-section').addClass('no-gradient');
            wireViewReturn();
        });
    }
    
    function wireViewReturn() {
        $('.mountain-section').click(function() {
            $('.mountain-section .section-content').animate({
                right: 0
            }, 1500);
            $('.mountain-section').removeClass('no-gradient');
            $(this).unbind('click');
        });
    }
    
    function wireFancybox() {
        $('.fancybox').fancybox({
            padding: 0
        });
    }
    
    init();
});
