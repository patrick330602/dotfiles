/**
 * Bottom pages functionality
 */
var bottompage = {

    /**
     * Initialise the page
     */
    init: function() {
        bottompage.initNavButtons();
        if (page.substr(0, 4) === 'help' || page === 'cpage' || page.substr(0, 9) === 'corporate') {
            $('body').addClass('old');
            scrollMenu();
        }
        else {
            $('body').removeClass('old');
        }
        if (!is_mobile) {
            bottompage.initFloatingTop();
            $('body').removeClass('mobile');
        }
        else {
            $('body').addClass('mobile');

            if (is_android) {
                bottompage.topBlockHeight();

                $(window).off('orientationchange').on('orientationchange', function() {
                    bottompage.topBlockHeight();
                });
            }
        } 
    },

    initNavButtons: function() {
        $('.pages-nav.nav-button').removeClass('active');

        try {
            $('.pages-nav.nav-button.' + page).addClass('active');
        }
        catch (exception) { };

        hiddenNavDropdown();

        $('.nav-button.compound-lnk').rebind('click', function() {
            var $this = $(this);
            var $dropdown = $this.prev('.compound-items');

            $this.addClass('opened');
            $('.nav-overlay').removeClass('hidden');
            $('.pages-nav.nav-button.active').addClass('greyed-out');
            $dropdown.addClass('active');

            function navDropdownPos() {
                var $this = $('.nav-button.compound-lnk.opened');
                var $dropdown = $('.pages-nav.compound-items.active');
                var leftPos;
                var topPos;
                var thisLeftPos = $this.offset().left + $this.outerWidth()/2;
                var thisTopPos = $this.offset().top -
                    (window.scrollY || window.pageYOffset || document.body.scrollTop);
                var browserWidth = $('body').outerWidth();

                if (browserWidth >= 655) {
                    hiddenNavDropdown();
                    return false;
                }
                else if (browserWidth >= 495 && $this.hasClass('other')) {
                    hiddenNavDropdown();
                    return false;
                }

                topPos = thisTopPos - $dropdown.outerHeight() + 4;
                if (thisTopPos - $dropdown.outerHeight() + 4 < 10) {
                    topPos = thisTopPos + $this.outerHeight() - 4;
                }

                if ($this.hasClass('mobile')) {
                    leftPos = thisLeftPos - $dropdown.outerWidth()/2;
                    if (leftPos < 10) {
                        leftPos = 10;
                    }
                }
                else {
                    leftPos = thisLeftPos - $dropdown.outerWidth()/2;
                    if (browserWidth < leftPos + $dropdown.outerWidth() + 10) {
                        leftPos = browserWidth - $dropdown.outerWidth() - 10;
                    }
                }

                $dropdown.css({
                    'left': leftPos,
                    'top': topPos
                });
            }

            navDropdownPos();
            
            $('body, html').rebind('touchmove.bodyscroll', function () {
                hiddenNavDropdown();
            });

            $(window).rebind('resize.navdropdown', function (e) {
                navDropdownPos();
            });
        });

        function hiddenNavDropdown() {
            $('.nav-overlay').addClass('hidden');
            $('.nav-button.compound-lnk.opened').removeClass('opened');
            $('.pages-nav.nav-button.active.greyed-out').removeClass('greyed-out');
            $('.pages-nav.compound-items.active').removeClass('active').removeAttr('style');
            $('body, html').unbind('touchmove.bodyscroll');
            $(window).unbind('resize.navdropdown');
        }

        $('.nav-overlay').rebind('click', function() {
            hiddenNavDropdown();
        });
    },

    initTabs: function() {
        $('.bottom-page.tab').rebind('click', function() {
            var $this = $(this);
            var tabTitle = $this.attr('data-tab');

            if (!$this.hasClass('active')) {
                $('.bottom-page.tab').removeClass('active');
                $('.bottom-page.tab-content:visible').addClass('hidden');
                $('.bottom-page.tab-content.' + tabTitle).removeClass('hidden');
                $this.addClass('active');
            }
        });
    },

    initFloatingTop: function() {
        var topHeader;

        if (page === 'download') {
            topHeader = '.download.top-bar';
        }
        else {
            topHeader = '.bottom-page .top-head, .old .top-head';
        }

        function topResize() {
            var $topHeader = $(topHeader);
            if ($topHeader.hasClass('floating')) {
                $topHeader.width($topHeader.parent().outerWidth());
            }
            else {
                $topHeader.removeAttr('style');
            }
        }

        $(window).rebind('resize.topheader', function (e) {
            topResize();
        });

        $('.bottom-pages .fmholder').rebind('scroll.topmenu', function() {
            var $topHeader = $(topHeader);
            var topPos = $(this).scrollTop();
            if (topPos > 300) {
                $topHeader.addClass('floating');
                topResize();
                if (topPos > 600) {
                    $topHeader.addClass('activated');
                }
            }
            else if (topPos <= 300 && topPos >= 50) {
                $topHeader.removeClass('activated');
            }
            else {
                $topHeader.removeClass('floating activated').removeAttr('style');
            }
        });
    },

    topBlockHeight: function() {
        "use strict";

        var $topBlock = $('.bottom-page.top-bl');
        var topBlockHeight = $topBlock.parent().height();

        if ($topBlock.length > -1) {
            $topBlock.height(topBlockHeight);
        }
    }
};
