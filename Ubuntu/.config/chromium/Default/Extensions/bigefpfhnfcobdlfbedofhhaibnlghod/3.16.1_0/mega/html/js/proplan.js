/**
 * Functionality for the Pro page Step 1 where the user chooses their Pro plan.
 * If the user selects a plan but is not logged in, they are prompted to log in.
 */
pro.proplan = {

    /** The user's current storage in bytes */
    currentStorageBytes: 0,

    /** If the user had come from the home page, or wasn't logged in and the got booted back to Pro step 1 */
    previouslySelectedPlan: null,

    /**
     * Initialises the page and functionality
     */
    init: function() {

        // Cache selectors
        var $body = $('body');
        var $stepOne = $body.find('.membership-step1');
        var $contactUsButton = $stepOne.find('.pro-bottom-button');
        var $achievementsInfo = $stepOne.find('.red-star-img, .reg-st3-txt-achprogram');

        // If selecting a plan after registration
        if (localStorage.keycomplete) {

            // Remove the flag so next page visit (or on refresh) they will go straight to Cloud Drive
            localStorage.removeItem('keycomplete');

            // Show the Free plan
            $body.addClass('key');

            // If achievements are enabled, show a star on the Free plan and some extra information about achievements
            if (!is_mobile) {
                mega.achievem.enabled().done(function() {
                    $achievementsInfo.removeClass('hidden');
                });
            }
        }
        else {
            $body.addClass('pro');
        }

        // If user is logged in
        if (u_type === 3) {

            // Get user quota information, the flag 'strg: 1' includes current account storage in the response
            api_req({ a: 'uq', strg: 1 }, {
                callback : function (result) {

                    // Store current account storage usage for checking later
                    pro.proplan.currentStorageBytes = result.cstrg;
                }
            });
        }

        // Add affiliate information to send with the Pro API calls if they pay later
        if (getSitePath().indexOf('pro/') > -1) {
            localStorage.affid = getSitePath().replace('pro/', '');
            localStorage.affts = new Date().getTime();
        }

        // French language fixes: GB -> Go (Gigaoctet) and TB -> To (Teraoctet)
        if (lang === 'fr') {
            $stepOne.find('.reg-st3-big-txt').each(function(e, o) {
                $(o).html($(o).html().replace('GB', 'Go').replace('TB', 'To'));
            });
        }

        // Add click handlers for the pricing boxes
        pro.proplan.initPricingBoxesClickHandlers();

        // Add click handler for the contact button
        $contactUsButton.rebind('click', function() {
            loadSubPage('contact');
        });
    },

    /**
     * Initialise click handler for all the pricing plan blocks
     */
    initPricingBoxesClickHandlers: function() {

        var $stepOne = $('.membership-step1');
        var $planBlocks = $stepOne.find('.reg-st3-membership-bl');

        // Initialise click handler for all the plan blocks
        $planBlocks.rebind('click', function() {

            var $selectedPlan = $(this);
            var planNum = $selectedPlan.attr('data-payment');

            // Select the plan
            $planBlocks.removeClass('selected');
            $selectedPlan.addClass('selected');

            // If coming from the process key step
            if (planNum === '0') {
                if (page === 'fm') {
                    loadSubPage('start');
                }
                else {
                    loadSubPage('fm');
                }
                if (localStorage.gotOverquotaWithAchievements) {
                    onIdle(function() {
                        mega.achievem.achievementsListDialog();
                    });
                    delete localStorage.gotOverquotaWithAchievements;
                }
                return false;
            }

            // If not logged in, show the login/register prompt
            if (!u_handle) {
                megaAnalytics.log('pro', 'loginreq');
                showSignupPromptDialog();
                return false;
            }

            // If they're ephemeral but awaiting email confirmation, still let them continue to choose a plan and pay
            else if (isEphemeral() && !localStorage.awaitingConfirmationAccount) {
                showRegisterDialog();
                return false;
            }

            // Load the Pro page step 2 where they can make payment
            loadSubPage('propay_' + planNum);
            return false;
        });

        // Show loading spinner because some stuff may not be rendered properly yet
        loadingDialog.show();

        // Load the membership plans
        pro.loadMembershipPlans(function() {

            // Render the plan details
            pro.proplan.populateMembershipPlans();

            // Check which plans are applicable or grey them out if not
            pro.proplan.checkApplicablePlans();

            // Close loading spinner
            loadingDialog.hide();
        });
    },

    /**
     * Populate the monthly plans across the main /pro page
     */
    populateMembershipPlans: function() {

        // Cache selectors
        var $stepOne = $('.membership-step1');
        var $pricingBoxes = $stepOne.find('.reg-st3-membership-bl');

        // Update each pricing block with details from the API
        for (var i = 0, length = pro.membershipPlans.length; i < length; i++) {

            // Get plan details
            var currentPlan = pro.membershipPlans[i];
            var months = currentPlan[pro.UTQA_RES_INDEX_MONTHS];
            var planNum = currentPlan[pro.UTQA_RES_INDEX_ACCOUNTLEVEL];
            var planName = pro.getProPlanName(planNum);

            // Show only monthly prices in the boxes
            if (months !== 12) {

                // Cache selectors
                var $pricingBox = $pricingBoxes.filter('.pro' + planNum);
                var $planName = $pricingBox.find('.title');
                var $price = $pricingBox.find('.price');
                var $priceDollars = $price.find('.big');
                var $priceCents = $price.find('.small');
                var $storageAmount = $pricingBox.find('.storage-amount');
                var $storageUnit = $pricingBox.find('.storage-unit');
                var $bandwidthAmount = $pricingBox.find('.bandwidth-amount');
                var $bandwidthUnit = $pricingBox.find('.bandwidth-unit');

                // Calculate the monthly base price
                var monthlyBasePrice = pro.membershipPlans[i][pro.UTQA_RES_INDEX_MONTHLYBASEPRICE];
                var monthlyBasePriceParts = monthlyBasePrice.split('.');
                var monthlyBasePriceDollars = monthlyBasePriceParts[0];
                var monthlyBasePriceCents = monthlyBasePriceParts[1];

                // Get the current plan's bandwidth, then convert the number to 'x GBs' or 'x TBs'
                var storageGigabytes = currentPlan[pro.UTQA_RES_INDEX_STORAGE];
                var storageBytes = storageGigabytes * 1024 * 1024 * 1024;
                var storageFormatted = numOfBytes(storageBytes, 0);
                var storageSizeRounded = Math.round(storageFormatted.size);

                // Get the current plan's bandwidth, then convert the number to 'x GBs' or 'x TBs'
                var bandwidthGigabytes = currentPlan[pro.UTQA_RES_INDEX_TRANSFER];
                var bandwidthBytes = bandwidthGigabytes * 1024 * 1024 * 1024;
                var bandwidthFormatted = numOfBytes(bandwidthBytes, 0);
                var bandwidthSizeRounded = Math.round(bandwidthFormatted.size);

                // Update the plan name and price
                $planName.text(planName);
                $priceDollars.text(monthlyBasePriceDollars);
                $priceCents.text('.' + monthlyBasePriceCents + ' \u20ac');    // EUR symbol

                // Update storage
                $storageAmount.text(storageSizeRounded);
                $storageUnit.text(storageFormatted.unit);

                // Update bandwidth
                $bandwidthAmount.text(bandwidthSizeRounded);
                $bandwidthUnit.text(bandwidthFormatted.unit);
            }
        }
    },

    /**
     * Check applicable plans for the user based on their current storage usage
     */
    checkApplicablePlans: function() {

        // If their account storage is not available (e.g. not logged in) all plan options will be shown
        if (pro.proplan.currentStorageBytes === 0) {
            return false;
        }

        // Cache selectors
        var $stepOne = $('.membership-step1');
        var $pricingBoxes = $stepOne.find('.reg-st3-membership-bl');
        var $noPlansSuitable = $stepOne.find('.no-plans-suitable');
        var $currentStorageTerabytes = $noPlansSuitable.find('.current-storage .terabytes');
        var $requestPlanButton = $noPlansSuitable.find('.btn-request-plan');

        // Calculate storage in gigabytes
        var totalNumOfPlans = 4;
        var numOfPlansNotApplicable = 0;
        var currentStorageGigabytes = pro.proplan.currentStorageBytes / 1024 / 1024 / 1024;

        // Loop through membership plans
        for (var i = 0, length = pro.membershipPlans.length; i < length; i++) {

            // Get plan details
            var currentPlan = pro.membershipPlans[i];
            var proNum = parseInt(currentPlan[pro.UTQA_RES_INDEX_ACCOUNTLEVEL]);
            var planStorageGigabytes = parseInt(currentPlan[pro.UTQA_RES_INDEX_STORAGE]);
            var months = parseInt(currentPlan[pro.UTQA_RES_INDEX_MONTHS]);

            // If their current storage usage is more than the plan's grey it out
            if ((months !== 12) && (currentStorageGigabytes > planStorageGigabytes)) {

                // Grey out the plan
                $pricingBoxes.filter('.pro' + proNum).addClass('sub-optimal-plan');

                // Add count of plans that aren't applicable
                numOfPlansNotApplicable++;
            }
        }

        // Show message to contact support
        if (numOfPlansNotApplicable === totalNumOfPlans) {

            // Get current usage in TB and round to 3 decimal places
            var currentStorageTerabytes = currentStorageGigabytes / 1024;
            currentStorageTerabytes = Math.round(currentStorageTerabytes * 1000) / 1000;
            currentStorageTerabytes = l[5816].replace('[X]', currentStorageTerabytes);

            // Show current storage usage and message
            $noPlansSuitable.removeClass('hidden');
            $currentStorageTerabytes.text(currentStorageTerabytes);

            clickURLs();

            // Redirect to #contact
            $requestPlanButton.rebind('click', function() {
                loadSubPage('contact');
            });
        }
    },

    /**
     * Processes a return URL from the payment provider in form of /payment-{providername}-{status} e.g.
     * /payment-ecp-success
     * /payment-ecp-failure
     * /payment-sabadell-success
     * /payment-sabadell-failure
     * /payment-astropay-pending
     * /payment-paysafecard-saleidXXX
     * @param {String} page The requested page from index.js e.g. payment-ecp-success etc
     */
    processReturnUrlFromProvider: function(page) {

        // Get the provider we are returning from and the status
        var pageParts = page.split('-');
        var provider = pageParts[1];
        var status = pageParts[2];

        // If returning from an paysafecard payment, do a verification on the sale ID
        if (provider === 'paysafecard') {
            paysafecard.verify(status);
        }

        // If returning from an AstroPay payment, show a pending payment dialog
        else if (provider === 'astropay') {
            astroPayDialog.showPendingPayment();
        }

        // If returning from an Ecomprocessing payment, show a success or failure dialog
        else if (provider === 'ecp') {
            addressDialog.showPaymentResult(status);
        }

        // Sabadell needs to also show success or failure
        else if (provider === 'sabadell') {
            sabadell.showPaymentResult(status);
        }
    }
};


/* jshint -W003 */  // Warning is not relevant

/**
 * The old Login / Register dialogs which are used if they are not logged in and try to go to Step 2.
 */
function showLoginDialog(email) {

    megaAnalytics.log("pro", "loginDialog");
    $.dialog = 'pro-login-dialog';

    var $dialog = $('.pro-login-dialog');
    $dialog
        .removeClass('hidden')
        .addClass('active');

    $('.fm-dialog-overlay').removeClass("hidden");

    $dialog.css({
        'margin-left': -1 * ($dialog.outerWidth() / 2),
        'margin-top': -1 * ($dialog.outerHeight() / 2)
    });

    $('.top-login-input-block').removeClass('incorrect');

    // controls
    $('.fm-dialog-close', $dialog)
        .unbind('click.proDialog')
        .bind('click.proDialog', function() {

            closeDialog();
        });

    $('.input-email', $dialog)
        .val(email || '');

    $('.input-password', $dialog)
        .val('');

    uiPlaceholders($dialog);
    uiCheckboxes($dialog);


    $('#login-password, #login-name', $dialog).rebind('keydown.prologin', function(e)
    {
        $('.top-login-pad', $dialog).removeClass('both-incorrect-inputs');
        $('.top-login-input-tooltip.both-incorrect', $dialog).removeClass('active');
        $('.top-login-input-block.password', $dialog).removeClass('incorrect');
        $('.top-login-input-block.e-mail', $dialog).removeClass('incorrect');

        if (e.keyCode === 13) {
            doProLogin($dialog);
        }
    });


    $('.top-login-forgot-pass', $dialog).rebind('click.toploginforgotpass', function() {
        loadSubPage('recovery');
    });

    $('.top-dialog-login-button', $dialog).rebind('click.toploginbutton', function() {
        doProLogin($dialog);
    });

    clickURLs();
}

var doProLogin = function($dialog) {

    megaAnalytics.log('pro', 'doLogin');
    loadingDialog.show();

    var ctx =
    {
        checkloginresult: function(ctx,r)
        {
            loadingDialog.hide();
            var e = $('#login-name', $dialog).val();
            if (e === '' || checkMail(e)) {
                $('.top-login-input-block.e-mail', $dialog).addClass('incorrect');
                $('#login-name', $dialog).val('');
                $('#login-name', $dialog).focus();
            }
            else if ($('#login-password', $dialog).val() === '') {
                $('.top-login-input-block.password', $dialog).addClass('incorrect');
            }
            else if (r === EBLOCKED)
            {
                alert(l[730]);
            }
            else if (r)
            {
                $('#login-password', $dialog).val('');
                $('#login-email', $dialog).val('');
                u_type = r;

                // Find the plan they clicked on before the login/register prompt popped up
                var proNum = $('.reg-st3-membership-bl.selected').data('payment');

                // Load the Pro payment page (step 2)
                loadSubPage('propay_' + proNum);
            }
            else
            {
                $('.top-login-pad', $dialog).addClass('both-incorrect-inputs');
                $('.top-login-input-tooltip.both-incorrect', $dialog).addClass('active');
                $('#login-password', $dialog).select();
            }
        }
    };

    var passwordaes = new sjcl.cipher.aes(prepare_key_pw($('#login-password', $dialog).val()));
    var uh = stringhash($('#login-name', $dialog).val().toLowerCase(), passwordaes);
    u_login(
        ctx,
        $('#login-name', $dialog).val(),
        $('#login-password', $dialog).val(),
        uh,
        $('#login-checkbox').is('.checkboxOn')
    );
};

function showRegisterDialog() {

    megaAnalytics.log("pro", "regDialog");

    mega.ui.showRegisterDialog({
        title: l[5840],

        onCreatingAccount: function() {
            megaAnalytics.log("pro", "doRegister");
        },

        onLoginAttemptFailed: function(registerData) {
            msgDialog('warninga:' + l[171], l[1578], l[218], null, function(e) {
                if (e) {
                    $('.pro-register-dialog').addClass('hidden');
                    if (signupPromptDialog) {
                        signupPromptDialog.hide();
                    }
                    showLoginDialog(registerData.email);
                }
            });
        },

        onAccountCreated: function(gotLoggedIn, registerData) {
            // If true this means they do not need to confirm their email before continuing to step 2
            var skipConfirmationStep = true;

            if (skipConfirmationStep) {
                closeDialog();
                if (!gotLoggedIn) {
                    localStorage.awaitingConfirmationAccount = JSON.stringify(registerData);
                }

                // Find the plan they clicked on before the login/register prompt popped up
                var proNum = $('.reg-st3-membership-bl.selected').data('payment');

                // Load the Pro payment page (step 2)
                loadSubPage('propay_' + proNum);
            }
            else {
                $('.fm-dialog.registration-page-success').removeClass('hidden');
                fm_showoverlay();
            }
        }
    });
}

var signupPromptDialog = null;
var showSignupPromptDialog = function() {

    // If on mobile, show the mobile version
    if (is_mobile) {
        mobile.proSignupPrompt.init();
        return;
    }

    if (!signupPromptDialog) {
        signupPromptDialog = new mega.ui.Dialog({
            'className': 'loginrequired-dialog',
            'closable': true,
            'focusable': false,
            'expandable': false,
            'requiresOverlay': true,
            'title': l[5841],
            'buttons': []
        });
        signupPromptDialog.bind('onBeforeShow', function() {

            $('.fm-dialog-title', this.$dialog)
                .text(
                    this.options.title
                );

            // custom buttons, because of the styling
            $('.fm-notification-info', this.$dialog)
                .safeHTML('<p>@@</p>', l[5842]);

            $('.pro-login', this.$dialog)
                .rebind('click.loginrequired', function() {
                    signupPromptDialog.hide();
                    showLoginDialog();
                    return false;
                });

            $('.pro-register', this.$dialog)
                .rebind('click.loginrequired', function() {
                    signupPromptDialog.hide();

                    if (!u_wasloggedin()) {
                        showRegisterDialog();
                    }
                    else {
                        var msg = l[8743];
                        msgDialog('confirmation', l[1193], msg, null, function(res) {
                            if (res) {
                                showRegisterDialog();
                            }
                            else {
                                showLoginDialog();
                            }
                        });
                    }
                    return false;
                }).find('span').text(l[1076]);
        });
    }

    signupPromptDialog.show();

    var $selectedPlan = $('.reg-st3-membership-bl.selected');
    var plan = 1;

    if ($selectedPlan.is(".lite")) { plan = 1; }
    else if ($selectedPlan.is(".pro1")) { plan = 2; }
    else if ($selectedPlan.is(".pro2")) { plan = 3; }
    else if ($selectedPlan.is(".pro3")) { plan = 4; }

    $('.fm-dialog.loginrequired-dialog .fm-notification-icon')
        .removeClass('plan1')
        .removeClass('plan2')
        .removeClass('plan3')
        .removeClass('plan4')
        .addClass('plan' + plan);
};
/* jshint +W003 */
