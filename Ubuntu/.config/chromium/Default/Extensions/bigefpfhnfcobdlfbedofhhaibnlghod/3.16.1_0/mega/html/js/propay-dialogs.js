/**
 * This file contains all the logic for different payment providers, some use dialogs to collect
 * extra information before sending to the API, others redirect directly to the payment provider.
 * Some of the code in this page is also used by the first step of the Pro page to handle return
 * URLS from the payment provider.
 */

/**
 * Code for the AstroPay dialog on the second step of the Pro page
 */
var astroPayDialog = {

    $dialog: null,
    $backgroundOverlay: null,
    $pendingOverlay: null,
    $propayPage: null,

    // Constant for the AstroPay gateway ID
    gatewayId: 11,

    // The provider details
    selectedProvider: null,

    /**
     * Initialise
     * @param {Object} selectedProvider
     */
    init: function(selectedProvider) {

        // Cache DOM reference for lookup in other functions
        this.$dialog = $('.astropay-dialog');
        this.$backgroundOverlay = $('.fm-dialog-overlay');
        this.$pendingOverlay = $('.payment-result.pending.original');
        this.$propayPage = $('.membership-step2');

        // Store the provider details
        this.selectedProvider = selectedProvider;

        // Initalise the rest of the dialog
        this.initCloseButton();
        this.initConfirmButton();
        this.updateDialogDetails();
        this.showDialog();
    },

    /**
     * Update the dialog details
     */
    updateDialogDetails: function() {

        // Get the gateway name
        var gatewayName = this.selectedProvider.gatewayName;

        // Change icon and payment provider name
        this.$dialog.find('.provider-icon').removeClass().addClass('provider-icon ' + gatewayName);
        this.$dialog.find('.provider-name').text(this.selectedProvider.displayName);

        // Localise the tax label to their country e.g. GST, CPF
        var taxLabel = l[7989].replace('%1', this.selectedProvider.extra.taxIdLabel);
        var taxPlaceholder = l[7990].replace('%1', this.selectedProvider.extra.taxIdLabel);

        // If on mobile, the input placeholder text is just 'CPF Number'
        if (is_mobile) {
            taxPlaceholder = taxLabel;
        }

        // If they have previously paid before with Astropay
        if (!is_mobile && (alarm.planExpired.lastPayment) && (alarm.planExpired.lastPayment.gwd)) {

            // Get the extra data from the gateway details
            var firstLastName = alarm.planExpired.lastPayment.gwd.name;
            var taxNum = alarm.planExpired.lastPayment.gwd.cpf;

            // Prefill the user's name and tax details
            this.$dialog.find('.astropay-name-field').val(firstLastName);
            this.$dialog.find('.astropay-tax-field').val(taxNum);
        }

        // Change the tax labels
        this.$dialog.find('.astropay-label.tax').text(taxLabel);
        this.$dialog.find('.astropay-tax-field').attr('placeholder', taxPlaceholder);
    },

    /**
     * Display the dialog
     */
    showDialog: function() {

        this.$dialog.removeClass('hidden');
        this.showBackgroundOverlay();

        // Hide the Propage page
        if (is_mobile) {
            this.$propayPage.addClass('hidden');
        }
    },

    /**
     * Hide the overlay and dialog
     */
    hideDialog: function() {

        this.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
        this.$dialog.addClass('hidden');

        // Show the Propage page
        if (is_mobile) {
            this.$propayPage.removeClass('hidden');
        }
    },

    /**
     * Shows the background overlay
     */
    showBackgroundOverlay: function() {

        // Show the background overlay only for desktop
        if (!is_mobile) {
            this.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
        }
    },

    /**
     * Functionality for the close button
     */
    initCloseButton: function() {

        // Initialise the close and cancel buttons
        this.$dialog.find('.fm-dialog-close, .cancel').rebind('click', function() {

            // Hide the overlay and dialog
            astroPayDialog.hideDialog();
        });

        // Prevent close of dialog from clicking outside the dialog
        $('.fm-dialog-overlay.payment-dialog-overlay').rebind('click', function(event) {
            event.stopPropagation();
        });
    },

    /**
     * Get the details entered by the user and redirect to AstroPay
     */
    initConfirmButton: function() {

        this.$dialog.find('.accept').rebind('click', function() {

            // Store the full name and tax number entered
            astroPayDialog.fullName = $.trim(astroPayDialog.$dialog.find('#astropay-name-field').val());
            astroPayDialog.taxNumber = $.trim(astroPayDialog.$dialog.find('#astropay-tax-field').val());

            // Make sure they entered something
            if ((astroPayDialog.fullName === '') || (astroPayDialog.fullName === '')) {

                // Show error dialog with Missing payment details
                msgDialog('warninga', l[6958], l[6959], '', function() {
                    astroPayDialog.showBackgroundOverlay();
                });

                return false;
            }

            // Try redirecting to payment provider
            astroPayDialog.hideDialog();
            pro.propay.sendPurchaseToApi();
        });
    },

    /**
     * Redirect to the site
     * @param {String} utcResult containing the url to redirect to
     */
    redirectToSite: function(utcResult) {

        var url = utcResult.EUR['url'];
        window.location = url;
    },

    /**
     * Process the result from the API User Transaction Complete call
     * @param {Object} utcResult The results from the UTC call
     */
    processUtcResult: function(utcResult) {

        // If successful AstroPay result, redirect
        if (utcResult.EUR.url) {
            astroPayDialog.redirectToSite(utcResult);
        }
        else {
            // Hide the loading animation and show an error
            pro.propay.hideLoadingOverlay();
            astroPayDialog.showError(utcResult);
        }
    },

    /**
     * Something has gone wrong just talking to AstroPay
     * @param {Object} utcResult The result from the UTC API call with error codes
     */
    showError: function(utcResult) {

        // Generic error: Oops, something went wrong...
        var message = l[47];

        // Transaction could not be initiated due to connection problems...
        if (utcResult.EUR.error === -1) {
            message = l[7233];
        }

        // Possibly invalid tax number etc
        else if (utcResult.EUR.error === -2) {
            message = l[6959];
        }

        // Too many payments within 12 hours
        else if (utcResult.EUR.error === -18) {
            message = l[7982];
        }

        // Show error dialog
        msgDialog('warninga', l[7235], message, '', function() {
            astroPayDialog.showBackgroundOverlay();
            astroPayDialog.showDialog();
        });
    },

    /**
     * Shows a modal dialog that their payment is pending
     */
    showPendingPayment: function() {

        this.$backgroundOverlay = $('.fm-dialog-overlay');
        this.$pendingOverlay = $('.payment-result.pending.original');

        // Show the success
        this.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
        this.$pendingOverlay.removeClass('hidden');

        // Add click handlers for 'Go to my account' and Close buttons
        this.$pendingOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

            // Hide the overlay
            astroPayDialog.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
            astroPayDialog.$pendingOverlay.addClass('hidden');

            // Make sure it fetches new account data on reload
            if (M.account) {
                M.account.lastupdate = 0;
            }

            // Load file manager on mobile
            if (is_mobile) {
                loadSubPage('fm');
            }
            else {
                // Otherwise on desktop, load the payment history section
                loadSubPage('fm/account/history');
            }
        });
    }
};

/**
 * Code for the voucher dialog on the second step of the Pro page
 */
var voucherDialog = {

    $dialog: null,
    $backgroundOverlay: null,
    $successOverlay: null,

    /** The gateway ID for using prepaid balance */
    gatewayId: 0,

    /**
     * Initialisation of the dialog
     */
    init: function() {
        this.showVoucherDialog();
        this.initCloseButton();
        this.setDialogDetails();
        this.initPurchaseButton();
        this.initRedeemVoucherButton();
        this.initRedeemVoucherNow();
    },

    /**
     * Display the dialog
     */
    showVoucherDialog: function() {

        // Cache DOM reference for lookup in other functions
        this.$dialog = $('.fm-dialog.voucher-dialog');
        this.$backgroundOverlay = $('.fm-dialog-overlay');
        this.$successOverlay = $('.payment-result.success');

        // Add the styling for the overlay
        this.$dialog.removeClass('hidden');
        this.showBackgroundOverlay();
    },

    /**
     * Set voucher dialog details on load
     */
    setDialogDetails: function() {

        // Get the selected Pro plan details
        var proNum = pro.propay.selectedProPackage[1];
        var proPlan = pro.getProPlanName(proNum);
        var proPrice = pro.propay.selectedProPackage[5];
        var numOfMonths = pro.propay.selectedProPackage[4];
        var monthsWording = pro.propay.getNumOfMonthsWording(numOfMonths);
        var balance = parseFloat(pro.propay.proBalance).toFixed(2);

        // Update template
        this.$dialog.find('.plan-icon').removeClass('pro1 pro2 pro3 pro4').addClass('pro' + proNum);
        this.$dialog.find('.voucher-plan-title').text(proPlan);
        this.$dialog.find('.voucher-plan-txt .duration').text(monthsWording);
        this.$dialog.find('.voucher-plan-price .price').text(proPrice);
        this.$dialog.find('.voucher-account-balance .balance-amount').text(balance);
        this.$dialog.find('#voucher-code-input input').val('');
        this.changeColourIfSufficientBalance();

        clickURLs();

        // Reset state to hide voucher input
        voucherDialog.$dialog.find('.voucher-input-container').fadeOut('fast', function() {
            voucherDialog.$dialog.find('.voucher-redeem-container, .purchase-now-container').fadeIn('fast');
        });
    },

    /**
     * Show green price if they have sufficient funds, or red if they need to top up
     */
    changeColourIfSufficientBalance: function() {

        var price = pro.propay.selectedProPackage[5];

        // If they have enough balance to purchase the plan, make it green
        if (parseFloat(pro.propay.proBalance) >= parseFloat(price)) {
            this.$dialog.find('.voucher-account-balance').addClass('sufficient-funds');
            this.$dialog.find('.voucher-buy-now').addClass('sufficient-funds');
            this.$dialog.find('.voucher-information-help').hide();
            this.$dialog.find('.voucher-redeem').hide();
        }
        else {
            // Otherwise leave it as red
            this.$dialog.find('.voucher-account-balance').removeClass('sufficient-funds');
            this.$dialog.find('.voucher-buy-now').removeClass('sufficient-funds');
            this.$dialog.find('.voucher-information-help').show();
            this.$dialog.find('.voucher-redeem').show();
        }
    },

    /**
     * Functionality for the close button
     */
    initCloseButton: function() {

        // Initialise the close button
        this.$dialog.find('.btn-close-dialog').rebind('click', function() {

            // Hide the overlay and dialog
            voucherDialog.hideDialog();
        });

        // Prevent close of dialog from clicking outside the dialog
        $('.fm-dialog-overlay.payment-dialog-overlay').rebind('click', function(event) {
            event.stopPropagation();
        });
    },

    /**
     * Shows the background overlay
     */
    showBackgroundOverlay: function() {

        voucherDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
    },

    /**
     * Hide the overlay and dialog
     */
    hideDialog: function() {

        voucherDialog.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
        voucherDialog.$dialog.addClass('hidden');
    },

    /**
     * Functionality for the initial redeem voucher button which shows
     * a text box to enter the voucher code and another Redeem Voucher button
     */
    initRedeemVoucherButton: function() {

        var $this = this;

        // On redeem button click
        $this.$dialog.find('.voucher-redeem').rebind('click', function() {

            // Show voucher input
            $this.$dialog.find('.voucher-redeem-container, .purchase-now-container').fadeOut('fast', function() {
                $this.$dialog.find('.voucher-input-container').fadeIn();
            });
        });
    },

    /**
     * Redeems the voucher
     */
    initRedeemVoucherNow: function() {

        // On redeem button click
        this.$dialog.find('.voucher-redeem-now').rebind('click', function() {

            // Get the voucher code from the input
            var voucherCode = voucherDialog.$dialog.find('#voucher-code-input input').val();

            // If empty voucher show message Error - Please enter your voucher code
            if (voucherCode === '') {
                msgDialog('warninga', l[135], l[1015], '', function() {
                    voucherDialog.showBackgroundOverlay();
                });
            }
            else {
                // Clear text box
                voucherDialog.$dialog.find('#voucher-code-input input').val('');

                // Add the voucher
                voucherDialog.addVoucher(voucherCode);
            }
        });
    },

    /**
     * Redeems the voucher code
     * @param {String} voucherCode The voucher code
     */
    addVoucher: function(voucherCode) {

        loadingDialog.show();

        // Make API call to add voucher
        api_req({ a: 'uavr', v: voucherCode }, {
            callback: function(result) {

                if (typeof result === 'number') {

                    loadingDialog.hide();

                    // This voucher has already been redeemed
                    if (result === -11) {
                        msgDialog('warninga', l[135], l[714], '', function() {
                            voucherDialog.showBackgroundOverlay();
                        });
                    }

                    // Not a valid voucher code
                    else if (result < 0) {
                        msgDialog('warninga', l[135], l[473], '', function() {
                            voucherDialog.showBackgroundOverlay();
                        });
                    }
                    else {
                        // Get the latest account balance and update the price in the dialog
                        voucherDialog.getLatestBalance(function() {

                            // Format to 2dp
                            var balance = pro.propay.proBalance.toFixed(2);

                            // Update dialog details
                            voucherDialog.$dialog.find('.voucher-account-balance .balance-amount').text(balance);
                            voucherDialog.changeColourIfSufficientBalance();

                            // Hide voucher input
                            voucherDialog.$dialog.find('.voucher-redeem-container').show();
                            voucherDialog.$dialog.find('.purchase-now-container').show();
                            voucherDialog.$dialog.find('.voucher-input-container').hide();
                        });
                    }
                }
            }
        });
    },

    /**
     * Gets the latest Pro balance from the API
     * @param {Function} callbackFunction A callback that can be used to continue on or update the UI once up to date
     */
    getLatestBalance: function(callbackFunction) {

        // Flag 'pro: 1' includes the Pro balance in the response
        api_req({ a: 'uq', pro: 1 }, {
            callback : function(result) {

                // If successful result
                if ((typeof result === 'object') && result.balance && result.balance[0]) {

                    // Convert to a float
                    var balance = parseFloat(result.balance[0][0]);

                    // Cache for various uses later on
                    pro.propay.proBalance = balance;
                }

                // Run the callback
                callbackFunction();
            }
        });
    },

    /**
     * Purchase using account balance when the button is clicked inside the Voucher dialog
     */
    initPurchaseButton: function() {

        var $voucherPurchaseButton = this.$dialog.find('.voucher-buy-now');
        var $selectedDurationOption = $('.duration-options-list .membership-radio.checked');

        // On Purchase button click run the purchase process
        $voucherPurchaseButton.rebind('click', function() {

            // Get which plan is selected
            pro.propay.selectedProPackageIndex = $selectedDurationOption.parent().attr('data-plan-index');

            // Set the pro package (used in pro.propay.sendPurchaseToApi function)
            pro.propay.selectedProPackage = pro.membershipPlans[pro.propay.selectedProPackageIndex];

            // Get the plan price
            var selectedPlanPrice = pro.propay.selectedProPackage[pro.UTQA_RES_INDEX_PRICE];

            // Warn them about insufficient funds
            if ((parseFloat(pro.propay.proBalance) < parseFloat(selectedPlanPrice))) {

                // Show warning and re-apply the background because the msgDialog function removes it on close
                msgDialog('warninga', l[6804], l[6805], '', function() {
                    voucherDialog.showBackgroundOverlay();
                });
            }
            else {
                // Hide the overlay and dialog
                voucherDialog.hideDialog();

                // Proceed with payment via account balance
                pro.propay.proPaymentMethod = 'pro_prepaid';
                pro.propay.sendPurchaseToApi();
            }
        });
    },

    /**
     * Shows a successful payment modal dialog
     */
    showSuccessfulPayment: function() {

        // Get the selected Pro plan details
        var proNum = pro.propay.selectedProPackage[1];
        var proPlanName = pro.getProPlanName(proNum);

        // Hide the loading animation
        pro.propay.hideLoadingOverlay();

        // Show the success
        voucherDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
        voucherDialog.$successOverlay.removeClass('hidden');
        voucherDialog.$successOverlay.find('.payment-result-txt .plan-name').text(proPlanName);

        // Add click handlers for 'Go to my account' and Close buttons
        voucherDialog.$successOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

            // Hide the overlay
            voucherDialog.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
            voucherDialog.$successOverlay.addClass('hidden');

            // Make sure it fetches new account data on reload
            // and redirect to account page to show purchase
            if (M.account) {
                M.account.lastupdate = 0;
            }
            loadSubPage('fm/account/history');
        });
    }
};

/**
 * Display the wire transfer dialog
 */
var wireTransferDialog = {

    $dialog: null,
    $backgroundOverlay: null,

    /**
     * Open and setup the dialog
     */
    init: function(onCloseCallback) {

        // Close the pro register dialog if it's already open
        $('.pro-register-dialog').removeClass('active').addClass('hidden');

        // Cache DOM reference for faster lookup
        this.$dialog = $('.fm-dialog.wire-transfer-dialog');
        this.$backgroundOverlay = $('.fm-dialog-overlay');

        // Add the styling for the overlay
        this.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');

        // Position the dialog and open it
        this.$dialog.css({
            'margin-left': -1 * (this.$dialog.outerWidth() / 2),
            'margin-top': -1 * (this.$dialog.outerHeight() / 2)
        });
        this.$dialog.addClass('active').removeClass('hidden');

        // Initialise the close button
        this.$dialog.find('.btn-close-dialog').rebind('click', function() {
            wireTransferDialog.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
            wireTransferDialog.$dialog.removeClass('active').addClass('hidden');

            if (onCloseCallback) {
                onCloseCallback();
            }
            return false;
        });

        // If logged in, pre-populate email address into wire transfer details
        if (typeof u_attr !== 'undefined' && u_attr.email) {

            // Replace the @ with -at- so the bank will accept it on the form
            var email = String(u_attr.email).replace('@', '-at-');

            wireTransferDialog.$dialog.find('.email-address').text(email);
        }

        // Update plan price in the dialog
        var proPrice = pro.propay.selectedProPackage[5];
        if (proPrice) {
            this.$dialog.find('.amount').text(proPrice).closest('tr').removeClass('hidden');
        }
        else {
            this.$dialog.find('.amount').closest('tr').addClass('hidden');
        }
    }
};

/**
 * Code for Dynamic/Union Pay
 */
var unionPay = {

    /** The gateway ID for using Union Pay */
    gatewayId: 5,

    /**
     * Redirect to the site
     * @param {Object} utcResult
     */
    redirectToSite: function(utcResult) {

        // DynamicPay
        // We need to redirect to their site via a post, so we are building a form :\
        var form = $("<form name='pay_form' action='" + utcResult.EUR['url'] + "' method='post'></form>");

        for (var key in utcResult.EUR['postdata']) {
            if (utcResult.EUR['postdata'].hasOwnProperty(key)) {

                var input = $("<input type='hidden' name='" + key + "' value='"
                          + utcResult.EUR['postdata'][key] + "' />");

                form.append(input);
            }
        }
        $('body').append(form);
        form.submit();
    }
};

/**
 * Code for Sabadell Spanish Bank
 */
var sabadell = {

    gatewayId: 17,

    /**
     * Redirect to the site
     * @param {Object} utcResult
     */
    redirectToSite: function(utcResult) {

        // We need to redirect to their site via a post, so we are building a form
        var url = utcResult.EUR['url'];
        var form = $("<form id='pay_form' name='pay_form' action='" + url + "' method='post'></form>");

        for (var key in utcResult.EUR['postdata']) {
            if (utcResult.EUR['postdata'].hasOwnProperty(key)) {

                var input = $("<input type='hidden' name='" + key + "' value='"
                          + utcResult.EUR['postdata'][key] + "' />");

                form.append(input);
            }
        }
        $('body').append(form);
        form.submit();
    },

    /**
     * Show the payment result of success or failure after coming back from the Sabadell site
     * @param {String} verifyUrlParam The URL parameter e.g. 'success' or 'failure'
     */
    showPaymentResult: function(verifyUrlParam) {

        var $backgroundOverlay = $('.fm-dialog-overlay');
        var $pendingOverlay = $('.payment-result.pending.alternate');
        var $failureOverlay = $('.payment-result.failed');

        // Show the overlay
        $backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');

        // On successful payment
        if (verifyUrlParam === 'success') {

            // Show the success
            $pendingOverlay.removeClass('hidden');

            // Add click handlers for 'Go to my account' and Close buttons
            $pendingOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

                // Hide the overlay
                $backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
                $pendingOverlay.addClass('hidden');

                // Make sure it fetches new account data on reload
                if (M.account) {
                    M.account.lastupdate = 0;
                }

                // Load file manager on mobile
                if (is_mobile) {
                    loadSubPage('fm');
                }
                else {
                    // Otherwise on desktop, load the payment history section
                    loadSubPage('fm/account/history');
                }
            });
        }
        else {
            // Show the failure overlay
            $failureOverlay.removeClass('hidden');

            // On click of the 'Try again' or Close buttons, hide the overlay
            $failureOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

                // Hide the overlay
                $backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
                $failureOverlay.addClass('hidden');
            });
        }
    }
};

/**
 * Code for Fortumo mobile payments
 */
var fortumo = {

    /**
     * Redirect to the site
     * @param {String} utsResult (a saleid)
     */
    redirectToSite: function(utsResult) {

        window.location = 'https://megapay.nz/?saleid=' + utsResult;
    }
};

/**
 * Code for tpay mobile payments
 */
var tpay = {

    gatewayId: 14,

    /**
     * Redirect to the site
     * @param {String} utcResult (a saleid)
     */
    redirectToSite: function(utcResult) {

        window.location = 'https://megapay.nz/gwtp.html?provider=tpay&saleid=' + utcResult['EUR']['saleids']
                        + '&params=' + utcResult['EUR']['params'];
    }
};

/* jshint -W003 */  // Warning not relevant

/**
 * Code for directReseller payments such as Gary's 6media
 */
var directReseller = {

    gatewayId: 15,

    /**
     * Redirect to the site
     * @param {String} utcResult A sale ID
     */
    redirectToSite: function(utcResult) {
        var provider = utcResult['EUR']['provider'];
        var params = utcResult['EUR']['params'];
        params = atob(params);

        var baseurls = [
            '',
            'https://mega.and1.tw/', // 6media
            'https://mega.bwm-mediasoft.com/mega.php5?', // BWM Mediasoft
            'https://my.hosting.co.uk/' // Hosting.co.uk
        ];

        if (provider >= 1 && provider <= 3)
        {
            var baseurl = baseurls[provider];
            var urlmod = utcResult['EUR']['urlmod'];

            // If the urlmod is not defined then we use the fully hardcoded url above,
            // otherwise the API is adjusting the end of it.
            if (typeof urlmod !== 'undefined') {
                baseurl += urlmod;
            }
            window.location =  baseurl + params;
        }
    }
};

/**
 * Code for paysafecard
 */
var paysafecard = {

    /** The gateway ID for using paysafecard */
    gatewayId: 10,

    /**
     * Redirect to the site
     * @param {String} utcResult containing the url to redirect to
     */
    redirectToSite: function(utcResult) {
        var url = utcResult.EUR['url'];
        window.location = url;
    },

    /**
     * Something has gone wrong just talking to paysafecard
     */
    showConnectionError: function() {
        msgDialog('warninga', l[7235], l[7233], '', function() {
            pro.propay.hideLoadingOverlay();
            loadSubPage('pro'); // redirect to remove any query parameters from the url
        });
    },

    /**
     * Something has gone wrong with the card association or debiting of the card
     */
    showPaymentError: function() {
        msgDialog('warninga', l[7235], l[7234], '', function() {
            loadSubPage('pro'); // redirect to remove any query parameters from the url
        });
    },

    /**
     * We have been redirected back to mega with the 'okUrl'. We need to ask the API to verify the payment
     * succeeded as per paysafecard's requirements, which they enforce with integration tests we must pass.
     * @param {String} saleIdString A string containing the sale ID e.g. saleid32849023423
     */
    verify: function(saleIdString) {

        // Remove the saleid string to just get the ID to check
        var saleId = saleIdString.replace('saleid', '');

        // Make the vpay API request to follow up on this sale
        var requestData = {
            'a': 'vpay',                      // Credit Card Store
            't': this.gatewayId,              // The paysafecard gateway
            'saleidstring': saleId            // Required by the API to know what to investigate
        };

        api_req(requestData, {
            callback: function (result) {

                // If negative API number
                if ((typeof result === 'number') && (result < 0)) {

                    // Something went wrong with the payment, either card association or actually debitting it
                    paysafecard.showPaymentError();
                }
                else {
                    // Continue to account screen
                    loadSubPage('account');
                }
            }
        });
    }
};

/**
 * Code for Centili mobile payments
 */
var centili = {

    /**
     * Redirect to the site
     * @param {String} utsResult (a saleid)
     */
    redirectToSite: function(utsResult) {

        window.location = 'https://megapay.nz/?saleid=' + utsResult + '&provider=centili';
    }
};

/**
 * A dialog to capture the billing name and address before redirecting off-site
 */
var addressDialog = {

    /** Cached jQuery selectors */
    $dialog: null,
    $backgroundOverlay: null,
    $pendingOverlay: null,

    /** The gateway ID for Ecomprocessing */
    gatewayId: 16,

    /** Extra details for the API 'utc' call */
    extraDetails: {},

    /**
     * Open and setup the dialog
     */
    init: function() {
        this.showDialog();
        this.initStateDropDown();
        this.initCountryDropDown();
        this.initCountryDropdownChangeHandler();
        this.initBuyNowButton();
        this.initCloseButton();
    },

    /**
     * Display the dialog
     */
    showDialog: function() {

        // Cache DOM reference for lookup in other functions
        this.$dialog = $('.payment-address-dialog');
        this.$backgroundOverlay = $('.fm-dialog-overlay');

        // Get the selected package
        var selectedPlanIndex = $('.duration-options-list .membership-radio.checked').parent().attr('data-plan-index');
        var selectedPackage = pro.membershipPlans[selectedPlanIndex];

        // Get the selected Pro plan details
        var proNum = selectedPackage[pro.UTQA_RES_INDEX_ACCOUNTLEVEL];
        var proPlan = pro.getProPlanName(proNum);
        var proPrice = selectedPackage[pro.UTQA_RES_INDEX_PRICE];
        var numOfMonths = selectedPackage[pro.UTQA_RES_INDEX_MONTHS];
        var monthsWording = pro.propay.getNumOfMonthsWording(numOfMonths);

        // Update template
        this.$dialog.find('.plan-icon').removeClass('pro1 pro2 pro3 pro4').addClass('pro' + proNum);
        this.$dialog.find('.payment-plan-title').text(proPlan);
        this.$dialog.find('.payment-plan-txt .duration').text(monthsWording);
        this.$dialog.find('.payment-plan-price .price').text(proPrice);

        // Show the black background overlay and the dialog
        this.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
        this.$dialog.removeClass('hidden');
    },

    /**
     * Creates a list of state names with the ISO 3166-1-alpha-2 code as the option value
     */
    initStateDropDown: function() {

        var stateOptions = '';
        var $statesSelect = this.$dialog.find('.states');

        // Build options
        $.each(isoStates, function(isoCode, stateName) {

            // Create the option and set the ISO code and state name
            var $stateOption = $('<option>').val(isoCode).text(stateName);

            // Append the HTML to the list of options
            stateOptions += $stateOption.prop('outerHTML');
        });

        // Render the states and update the text when a state is selected
        $statesSelect.append(stateOptions);

        // Initialise the jQueryUI selectmenu
        $statesSelect.selectmenu({
            position: {
                my: "left top-18",
                at: "left bottom-18",
                collision: "flip"  // default is ""
            }
        });
    },

    /**
     * Creates a list of country names with the ISO 3166-1-alpha-2 code as the option value
     */
    initCountryDropDown: function() {

        var countryOptions = '';
        var $countriesSelect = this.$dialog.find('.countries');

        // Build options
        $.each(isoCountries, function(isoCode, countryName) {

            // Create the option and set the ISO code and country name
            var $countryOption = $('<option>').val(isoCode).text(countryName);

            // Append the HTML to the list of options
            countryOptions += $countryOption.prop('outerHTML');
        });

        // Render the countries and update the text when a country is selected
        $countriesSelect.append(countryOptions);

        // Initialise the jQueryUI selectmenu
        $countriesSelect.selectmenu({
            position: {
                my: "left top-18",
                at: "left bottom-18",
                collision: "flip"  // default is ""
            }
        });
    },

    /**
     * Initialises a change handler for the country dropdown. When the country changes to US or
     * Canada it should enable the State dropdown. Otherwise it should disable the dropdown.
     * Only states from the selected country should be shown.
     */
    initCountryDropdownChangeHandler: function() {

        var $countriesSelect = this.$dialog.find('.countries');
        var $statesSelect = this.$dialog.find('.states');
        var $stateSelectmenuButton = this.$dialog.find('#address-dialog-states-button');

        // On dropdown option change
        $countriesSelect.selectmenu({
            change: function(event, ui) {

                // Get the selected country ISO code e.g. CA
                var selectedCountryCode = ui.item.value;

                // Reset states dropdown to default and select first option
                $statesSelect.find('option:first-child').prop('disabled', false).prop('selected', true);

                // If Canada or United States is selected
                if ((selectedCountryCode === 'CA') || (selectedCountryCode === 'US')) {

                    // Loop through all the states
                    $statesSelect.find('option').each(function() {

                        // Get just the country code from the state code e.g. CA-QC
                        var $stateOption = $(this);
                        var stateCode = $stateOption.val();
                        var countryCode = stateCode.substr(0, 2);

                        // If it's a match, show it
                        if (countryCode === selectedCountryCode) {
                            $stateOption.prop('disabled', false);
                        }
                        else {
                            // Otherwise hide it
                            $stateOption.prop('disabled', true);
                        }
                    });

                    // Refresh the selectmenu to show/hide disabled options and enable the dropdown so it works
                    $statesSelect.selectmenu('refresh');
                    $statesSelect.selectmenu('enable');
                }
                else {
                    // Refresh the selectmenu to show the selected first option (State) then disable the dropdown
                    $statesSelect.selectmenu('refresh');
                    $statesSelect.selectmenu('disable');
                }

                // Remove any previous validation error
                $stateSelectmenuButton.removeClass('error');
            }
        });
    },

    /**
     * Initialise the button for buy now
     */
    initBuyNowButton: function() {

        // Add the click handler to redirect off site
        this.$dialog.find('.payment-buy-now').rebind('click', function() {

            addressDialog.validateAndPay();
        });
    },

    /**
     * Initialise the X (close) button in the top right corner of the dialog
     */
    initCloseButton: function() {

        // Change the class depending on mobile/desktop
        var closeButtonClass = (is_mobile) ? 'fm-dialog-close' : 'btn-close-dialog';

        // Add the click handler to hide the dialog and the black overlay
        this.$dialog.find('.' + closeButtonClass).rebind('click', function() {

            addressDialog.closeDialog();
        });
    },

    /**
     * Closes the dialog
     */
    closeDialog: function() {

        this.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
        this.$dialog.removeClass('active').addClass('hidden');
    },

    /**
     * Collects the form details and validates the form
     */
    validateAndPay: function() {

        // Selectors for form text fields
        var fields = ['first-name', 'last-name', 'address1', 'address2', 'city', 'postcode'];
        var fieldValues = {};

        // Get the values from the inputs
        for (var i = 0; i < fields.length; i++) {

            // Get the form field value
            var fieldName = fields[i];
            var fieldValue = this.$dialog.find('.' + fieldName).val();

            // Trim the text
            fieldValues[fieldName] = $.trim(fieldValue);
        }

        // Get the values from the dropdowns
        var $stateSelect = this.$dialog.find('.states');
        var $countrySelect = this.$dialog.find('.countries');
        var $stateSelectmenuButton = this.$dialog.find('#address-dialog-states-button');
        var $countrySelectmenuButton = this.$dialog.find('#address-dialog-countries-button');
        var state = $stateSelect.val();
        var country = $countrySelect.val();

        // Selectors for error handling
        var $errorMessage = this.$dialog.find('.error-message');
        var $allInputs = this.$dialog.find('.fm-account-input, .ui-selectmenu-button');

        // Reset state of past error messages
        var stateNotSet = false;
        $errorMessage.addClass('hidden');
        $allInputs.removeClass('error');

        // Add red border around the missing fields
        $.each(fieldValues, function(fieldName, value) {

            // Make sure the value is set, if not add the class (ignoring address2 field which is not compulsory)
            if ((!value) && (fieldName !== 'address2')) {
                addressDialog.$dialog.find('.' + fieldName).parent().addClass('error');
            }
        });

        // Add red border around the missing country selectmenu
        if (!country) {
            $countrySelectmenuButton.addClass('error');
        }

        // If the country is US or Canada then the State is also required field
        if (((country === 'US') || (country === 'CA')) && !state) {
            $stateSelectmenuButton.addClass('error');
            stateNotSet = true;
        }

        // Check all required fields
        if (!fieldValues['first-name'] || !fieldValues['last-name'] || !fieldValues['address1'] ||
                !fieldValues['city'] || !fieldValues['postcode'] || !country || stateNotSet) {

            // Show a general error and exit early if they are not complete
            $errorMessage.removeClass('hidden');
            return false;
        }

        // Send to the API
        this.proceedToPay(fieldValues, state, country);
    },

    /**
     * Setup the payment details to send to the API
     * @param {Object} fieldValues The form field names and their values
     * @param {type} state The value of the state dropdown
     * @param {type} country The value of the country dropdown
     */
    proceedToPay: function(fieldValues, state, country) {

        // Set details for the UTC call
        this.extraDetails.first_name = fieldValues['first-name'];
        this.extraDetails.last_name = fieldValues['last-name'];
        this.extraDetails.address1 = fieldValues['address1'];
        this.extraDetails.address2 = fieldValues['address2'];
        this.extraDetails.city = fieldValues['city'];
        this.extraDetails.zip_code = fieldValues['postcode'];
        this.extraDetails.country = country;
        this.extraDetails.recurring = false;

        // If the country is US or Canada, add the state by stripping the country code off e.g. to get QC from CA-QC
        if ((country === 'US') || (country === 'CA')) {
            this.extraDetails.state = state.substr(3);
        }

        // Get the value for whether the user wants the plan to renew automatically
        var autoRenewCheckedValue = $('.membership-step2 .renewal-options-list input:checked').val();

        // If the provider supports recurring payments and the user wants the plan to renew automatically
        if (autoRenewCheckedValue === 'yes') {
            this.extraDetails.recurring = true;
        }

        // Hide the dialog so the loading one will show, then proceed to pay
        this.$dialog.addClass('hidden');
        pro.propay.sendPurchaseToApi();
    },

    /**
     * Redirect to the site
     * @param {String} utcResult containing the url to redirect to
     */
    redirectToSite: function(utcResult) {

        var url = utcResult.EUR['url'];
        window.location = url + '?lang=' + lang;
    },

    /**
     * Process the result from the API User Transaction Complete call
     * @param {Object} utcResult The results from the UTC call
     */
    processUtcResult: function(utcResult) {
        if (utcResult.EUR.url) {
            this.redirectToSite(utcResult);
        }
        else {
            // Hide the loading animation and show the error
            pro.propay.hideLoadingOverlay();
            this.showError(utcResult);
        }
    },

    /**
     * Something has gone wrong with the API and Ecomprocessing setup
     * @param {Object} utcResult The result from the UTC API call with error codes
     */
    showError: function(utcResult) {

        // Generic error: Oops, something went wrong. Please try again later.
        var message = l[200] + ' ' + l[253];

        // Transaction could not be initiated due to connection problems...
        if (utcResult.EUR.error === EINTERNAL) {
            message = l[7233];
        }

        // Please complete the payment details correctly.
        else if (utcResult.EUR.error === EARGS) {
            message = l[6959];
        }

        // You have too many incomplete payments in the last 12 hours...
        else if (utcResult.EUR.error === ETEMPUNAVAIL) {
            message = l[7982];
        }

        // Show error dialog
        msgDialog('warninga', l[7235], message, '', function() {
            addressDialog.showDialog();
        });
    },

    /**
     * Show the payment result of success or failure after coming back from Ecomprocessing
     * @param {String} verifyUrlParam The URL parameter e.g. 'success' or 'failure'
     */
    showPaymentResult: function(verifyUrlParam) {

        var $backgroundOverlay = $('.fm-dialog-overlay');
        var $pendingOverlay = $('.payment-result.pending.alternate');
        var $failureOverlay = $('.payment-result.failed');

        // Show the overlay
        $backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');

        // On successful payment
        if (verifyUrlParam === 'success') {

            // Show the success
            $pendingOverlay.removeClass('hidden');

            // Add click handlers for 'Go to my account' and Close buttons
            $pendingOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

                // Hide the overlay
                $backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
                $pendingOverlay.addClass('hidden');

                // Make sure it fetches new account data on reload
                if (M.account) {
                    M.account.lastupdate = 0;
                }

                // Load file manager on mobile
                if (is_mobile) {
                    loadSubPage('fm');
                }
                else {
                    // Otherwise on desktop, load the payment history section
                    loadSubPage('fm/account/history');
                }
            });
        }
        else {
            // Show the failure overlay
            $failureOverlay.removeClass('hidden');

            // On click of the 'Try again' or Close buttons, hide the overlay
            $failureOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

                // Hide the overlay
                $backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
                $failureOverlay.addClass('hidden');
            });
        }
    }
};

/**
 * Credit card payment dialog
 */
var cardDialog = {

    $dialog: null,
    $backgroundOverlay: null,
    $successOverlay: null,
    $failureOverlay: null,
    $loadingOverlay: null,

    /** Flag to prevent accidental double payments */
    paymentInProcess: false,

    /** The RSA public key to encrypt data to be stored on the Secure Processing Unit (SPU) */
    publicKey: [
        atob(
            "wfvbeFkjArOsHvAjXAJqve/2z/nl2vaZ+0sBj8V6U7knIow6y3/6KJ" +
            "3gkJ50QQ7xDDakyt1C49UN27e+e0kCg2dLJ428JVNvw/q5AQW41" +
            "grPkutUdFZYPACOauqIsx9KY6Q3joabL9g1JbwmuB44Mv20aV/L" +
            "/Xyb2yiNm09xlyVhO7bvJ5Sh4M/EOzRN2HI+V7lHwlhoDrzxgQv" +
            "vKjzsoPfFZaMud742tpgY8OMnKHcfmRQrfIvG/WfCqJ4ETETpr6" +
            "AeI2PIHsptZgOYkkrDK6Bi8qb/T7njk32ZRt1E6Q/N7+hd8PLhh" +
            "2PaYRWfpNiWwnf/rPu4MnwRE6T77s/qGQ=="
        ),
        "\u0001\u0000\u0001",   // Exponent 65537
        2048                    // Key size in bits
    ],

    /** The gateway ID for using Credit cards */
    gatewayId: 8,

    /**
     * Open and setup the dialog
     */
    init: function() {
        this.showCreditCardDialog();
        this.initCountryDropDown();
        this.initExpiryMonthDropDown();
        this.initExpiryYearDropDown();
        this.initInputsFocus();
        this.initPurchaseButton();
    },

    /**
     * Display the dialog
     */
    showCreditCardDialog: function() {

        // Close the pro register dialog if it's already open
        $('.pro-register-dialog').removeClass('active').addClass('hidden');

        // Cache DOM reference for lookup in other functions
        this.$dialog = $('.fm-dialog.payment-dialog');
        this.$backgroundOverlay = $('.fm-dialog-overlay');
        this.$successOverlay = $('.payment-result.success');
        this.$failureOverlay = $('.payment-result.failed');
        this.$loadingOverlay = $('.payment-processing');

        // Add the styling for the overlay
        this.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');

        // Position the dialog and open it
        this.$dialog.css({
            'margin-left': -1 * (this.$dialog.outerWidth() / 2),
            'margin-top': -1 * (this.$dialog.outerHeight() / 2)
        });
        this.$dialog.addClass('active').removeClass('hidden');

        // Get the selected Pro plan details
        var proNum = pro.propay.selectedProPackage[1];
        var proPlan = pro.getProPlanName(proNum);
        var proPrice = pro.propay.selectedProPackage[5];
        var numOfMonths = pro.propay.selectedProPackage[4];
        var monthsWording = pro.propay.getNumOfMonthsWording(numOfMonths);

        // Update the Pro plan details
        this.$dialog.find('.plan-icon').removeClass('pro1 pro2 pro3 pro4').addClass('pro' + proNum);
        this.$dialog.find('.payment-plan-title').text(proPlan);
        this.$dialog.find('.payment-plan-price').text(proPrice + '\u20AC');
        this.$dialog.find('.payment-plan-txt').text(monthsWording + ' ' + l[6965] + ' ');

        // Remove rogue colon in translation text
        var statePlaceholder = this.$dialog.find('.state-province').attr('placeholder').replace(':', '');
        this.$dialog.find('.state-province').attr('placeholder', statePlaceholder);

        // Reset form if they made a previous payment
        this.clearPreviouslyEnteredCardData();

        // Initialise the close button
        this.$dialog.find('.btn-close-dialog').rebind('click', function() {
            cardDialog.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
            cardDialog.$dialog.removeClass('active').addClass('hidden');

            // Reset flag so they can try paying again
            cardDialog.paymentInProcess = false;
        });

        // Check if using retina display and preload loading animation
        var retina = (window.devicePixelRatio > 1) ? '@2x' : '';
        $('.payment-animation').attr('src', staticpath + '/images/mega/payment-animation' + retina + '.gif');
    },

    /**
     * Clears card data and billing details previously entered
     */
    clearPreviouslyEnteredCardData: function() {

        this.$dialog.find('.first-name').val('');
        this.$dialog.find('.last-name').val('');
        this.$dialog.find('.credit-card-number').val('');
        this.$dialog.find('.cvv-code').val('');
        this.$dialog.find('.address1').val('');
        this.$dialog.find('.address2').val('');
        this.$dialog.find('.city').val('');
        this.$dialog.find('.state-province').val('');
        this.$dialog.find('.post-code').val('');
        this.$dialog.find('.expiry-date-month span').text(l[913]);
        this.$dialog.find('.expiry-date-year span').text(l[932]);
        this.$dialog.find('.countries span').text(l[481]);
    },

    /**
     * Initialise functionality for the purchase button
     */
    initPurchaseButton: function() {

        this.$dialog.find('.payment-buy-now').rebind('click', function() {

            // Prevent accidental double click if they've already initiated a payment
            if (cardDialog.paymentInProcess === false) {

                // Set flag to prevent double click getting here too
                cardDialog.paymentInProcess = true;

                // Validate the form and normalise the billing details
                var billingDetails = cardDialog.getBillingDetails();

                // If no errors, proceed with payment
                if (billingDetails !== false) {
                    cardDialog.encryptBillingData(billingDetails);
                }
                else {
                    // Reset flag so they can try paying again
                    cardDialog.paymentInProcess = false;
                }
            }
        });
    },

    /**
     * Creates a list of country names with the ISO 3166-1-alpha-2 code as the option value
     */
    initCountryDropDown: function() {

        var countryOptions = '';
        var $countriesSelect = this.$dialog.find('.default-select.countries');
        var $countriesDropDown = $countriesSelect.find('.default-select-scroll');

        // Build options
        $.each(isoCountries, function(isoCode, countryName) {
            countryOptions += '<div class="default-dropdown-item " data-value="' + isoCode + '">'
                            +     countryName
                            + '</div>';
        });

        // Render the countries and update the text when a country is selected
        $countriesDropDown.html(countryOptions);

        // Bind custom dropdowns events
        bindDropdownEvents($countriesSelect);
    },

    /**
     * Creates the expiry month dropdown
     */
    initExpiryMonthDropDown: function() {

        var twoDigitMonth = '';
        var monthOptions = '';
        var $expiryMonthSelect = this.$dialog.find('.default-select.expiry-date-month');
        var $expiryMonthDropDown = $expiryMonthSelect.find('.default-select-scroll');

        // Build options
        for (var month = 1; month <= 12; month++) {
            twoDigitMonth = (month < 10) ? '0' + month : month;
            monthOptions += '<div class="default-dropdown-item " data-value="' + twoDigitMonth + '">'
                          +     twoDigitMonth
                          + '</div>';
        }

        // Render the months and update the text when a country is selected
        $expiryMonthDropDown.html(monthOptions);

        // Bind custom dropdowns events
        bindDropdownEvents($expiryMonthSelect);
    },

    /**
     * Creates the expiry year dropdown
     */
    initExpiryYearDropDown: function() {

        var yearOptions = '';
        var currentYear = new Date().getFullYear();
        var endYear = currentYear + 20;                                     // http://stackoverflow.com/q/2500588
        var $expiryYearSelect = this.$dialog.find('.default-select.expiry-date-year');
        var $expiryYearDropDown = $expiryYearSelect.find('.default-select-scroll');

        // Build options
        for (var year = currentYear; year <= endYear; year++) {
            yearOptions += '<div class="default-dropdown-item " data-value="' + year + '">' + year + '</div>';
        }

        // Render the months and update the text when a country is selected
        $expiryYearDropDown.html(yearOptions);

        // Bind custom dropdowns events
        bindDropdownEvents($expiryYearSelect);
    },

    /**
     * Inputs focused states
     */
    initInputsFocus: function() {

        this.$dialog.find('.fm-account-input input').bind('focus', function() {
            $(this).parent().addClass('focused');
        });

        this.$dialog.find('.fm-account-input input').bind('blur', function() {
            $(this).parent().removeClass('focused');
        });
    },

    /* jshint -W074 */  // Old code, refactor another day

    /**
     * Checks if the billing details are valid before proceeding
     * Also normalise the data to remove inconsistencies
     * @returns {Boolean}
     */
    getBillingDetails: function() {

        // All payment data
        var billingData =    {
            first_name: this.$dialog.find('.first-name').val(),
            last_name: this.$dialog.find('.last-name').val(),
            card_number: this.$dialog.find('.credit-card-number').val(),
            expiry_date_month: this.$dialog.find('.expiry-date-month .active').attr('data-value'),
            expiry_date_year: this.$dialog.find('.expiry-date-year .active').attr('data-value'),
            cv2: this.$dialog.find('.cvv-code').val(),
            address1: this.$dialog.find('.address1').val(),
            address2: this.$dialog.find('.address2').val(),
            city: this.$dialog.find('.city').val(),
            province: this.$dialog.find('.state-province').val(),
            postal_code: this.$dialog.find('.post-code').val(),
            country_code: this.$dialog.find('.countries .active').attr('data-value'),
            email_address: u_attr.email
        };

        // Trim whitespace from beginning and end of all form fields
        $.each(billingData, function(key, value) {
            billingData[key] = $.trim(value);
        });

        // Remove all spaces and hyphens from credit card number
        billingData.card_number = billingData.card_number.replace(/-|\s/g, '');

        // Check the credit card number
        if (!cardDialog.isValidCreditCard(billingData.card_number)) {

            // Show error popup and on close re-add the overlay
            msgDialog('warninga', l[6954], l[6955], '', function() {
                cardDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
            });
            return false;
        }

        // Check the required billing details are completed
        if (!billingData.address1 || !billingData.city || !billingData.province || !billingData.country_code ||
            !billingData.postal_code) {

            // Show error popup and on close re-add the overlay
            msgDialog('warninga', l[6956], l[6957], '', function() {
                cardDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
            });
            return false;
        }

        // Check all the card details are completed
        else if (!billingData.first_name || !billingData.last_name || !billingData.card_number ||
                 !billingData.expiry_date_month || !billingData.expiry_date_year || !billingData.cv2) {

            msgDialog('warninga', l[6958], l[6959], '', function() {
                cardDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
            });
            return false;
        }

        return billingData;
    },
    /* jshint +W074 */

    /**
     * Encrypts the billing data before sending to the API server
     * @param {Object} billingData The data to be encrypted and sent
     */
    encryptBillingData: function(billingData) {

        // Get last 4 digits of card number
        var cardNumberLength = billingData.card_number.length;
        var lastFourCardDigits = billingData.card_number.substr(cardNumberLength - 4);

        // Hash the card data so users can identify their cards later in our system if they
        // get locked out or something. It must be unique and able to be derived again.
        var cardData = JSON.stringify({
            'card_number': billingData.card_number,
            'expiry_date_month': billingData.expiry_date_month,
            'expiry_date_year': billingData.expiry_date_year,
            'cv2': billingData.cv2
        });
        var htmlEncodedCardData = cardDialog.htmlEncodeString(cardData);
        var cardDataHash = sjcl.hash.sha256.hash(htmlEncodedCardData);
        var cardDataHashHex = sjcl.codec.hex.fromBits(cardDataHash);

        // Comes back as byte string, so encode first.
        var jsonEncodedBillingData = JSON.stringify(billingData);
        var htmlAndJsonEncodedBillingData = cardDialog.htmlEncodeString(jsonEncodedBillingData);
        var encryptedBillingData = btoa(paycrypt.hybridEncrypt(htmlAndJsonEncodedBillingData, this.publicKey));

        // Add credit card, the most recently added card is used by default
        var requestData = {
            'a': 'ccs',                          // Credit Card Store
            'cc': encryptedBillingData,
            'last4': lastFourCardDigits,
            'expm': billingData.expiry_date_month,
            'expy': billingData.expiry_date_year,
            'hash': cardDataHashHex
        };

        // Close the dialog
        cardDialog.$dialog.removeClass('active').addClass('hidden');

        // Proceed with payment
        api_req(requestData, {
            callback: function (result) {

                // If negative API number
                if ((typeof result === 'number') && (result < 0)) {
                    cardDialog.showFailureOverlay();
                }
                else {
                    // Otherwise continue to charge card
                    pro.propay.sendPurchaseToApi();
                }
            }
        });
    },

    /**
     * Encode Unicode characters in the string so people with strange addresses can still pay
     * @param {String} input The string to encode
     * @returns {String} Returns the encoded string
     */
    htmlEncodeString: function(input) {

        return input.replace(/[\u00A0-\uFFFF<>\&]/gim, function(i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    },

    /**
     * Process the result from the API User Transaction Complete call
     * @param {Object} utcResult The results from the UTC call
     */
    processUtcResult: function(utcResult) {

        // Hide the loading animation
        pro.propay.hideLoadingOverlay();

        // Show credit card success
        if (utcResult.EUR.res === 'S') {
            cardDialog.showSuccessfulPayment(utcResult);
        }

        // Show credit card failure
        else if ((utcResult.EUR.res === 'FP') || (utcResult.EUR.res === 'FI')) {
            cardDialog.showFailureOverlay(utcResult);
        }
    },

    /**
     * Shows a successful payment modal dialog
     */
    showSuccessfulPayment: function() {

        // Close the card dialog and loading overlay
        cardDialog.$failureOverlay.addClass('hidden');
        cardDialog.$loadingOverlay.addClass('hidden');
        cardDialog.$dialog.removeClass('active').addClass('hidden');

        // Get the selected Pro plan details
        var proNum = pro.propay.selectedProPackage[1];
        var proPlanName = pro.getProPlanName(proNum);

        // Show the success
        cardDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
        cardDialog.$successOverlay.removeClass('hidden');
        cardDialog.$successOverlay.find('.payment-result-txt .plan-name').text(proPlanName);

        // Add click handlers for 'Go to my account' and Close buttons
        cardDialog.$successOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

            // Hide the overlay
            cardDialog.$backgroundOverlay.addClass('hidden').removeClass('payment-dialog-overlay');
            cardDialog.$successOverlay.addClass('hidden');

            // Remove credit card details from the form
            cardDialog.clearPreviouslyEnteredCardData();

            // Reset flag so they can try paying again
            cardDialog.paymentInProcess = false;

            // Make sure it fetches new account data on reload
            if (M.account) {
                M.account.lastupdate = 0;
            }
            loadSubPage('fm/account/history');
        });
    },

    /**
     * Shows the failure overlay
     * @param {Object} utcResult
     */
    showFailureOverlay: function(utcResult) {

        // Show the failure overlay
        cardDialog.$backgroundOverlay.removeClass('hidden').addClass('payment-dialog-overlay');
        cardDialog.$failureOverlay.removeClass('hidden');
        cardDialog.$loadingOverlay.addClass('hidden');
        cardDialog.$successOverlay.addClass('hidden');

        // If error is 'Fail Provider', get the exact error or show a default 'Something went wrong' type message
        var errorMessage = ((typeof utcResult !== 'undefined') && (utcResult.EUR.res === 'FP'))
                         ? this.getProviderError(utcResult.EUR.code)
                         : l[6950];
        cardDialog.$failureOverlay.find('.payment-result-txt').html(errorMessage);

        // On click of the 'Try again' or Close buttons, hide the overlay and the user can fix their payment details
        cardDialog.$failureOverlay.find('.payment-result-button, .payment-close').rebind('click', function() {

            // Reset flag so they can try paying again
            cardDialog.paymentInProcess = false;

            // Hide failure and re-open the dialog
            cardDialog.$failureOverlay.addClass('hidden');

            // Re-open the card dialog
            cardDialog.$dialog.addClass('active').removeClass('hidden');
        });
    },

    /**
     * Gets an error message based on the error code from the payment provider
     * @param {Number} errorCode The error code
     * @returns {String} The error message
     */
    getProviderError: function(errorCode) {

        switch (errorCode) {
            case -1:
                // There is an error with your credit card details.
                return l[6966];
            case -2:
                // There is an error with your billing details.
                return l[6967];
            case -3:
                // Your transaction was detected as being fraudulent.
                return l[6968];
            case -4:
                // You have tried to pay too many times with this credit card recently.
                return l[6969];
            case -5:
                // You have insufficient funds to make this payment.
                return l[6970];
            default:
                // An unknown error occurred. Please try again later.
                return l[7140];
        }
    },

    /**
     * Validates the credit card number is the correct format
     * Written by Jorn Zaefferer
     * From http://jqueryvalidation.org/creditcard-method/ (MIT Licence)
     * Based on http://en.wikipedia.org/wiki/Luhn_algorithm
     * @param {String} cardNum The credit card number
     * @returns {Boolean}
     */
    isValidCreditCard: function(cardNum) {

        // Accept only spaces, digits and dashes
        if (/[^0-9 \-]+/.test(cardNum)) {
            return false;
        }
        var numCheck = 0;
        var numDigit = 0;
        var even = false;
        var num = null;
        var charDigit = null;

        cardNum = cardNum.replace(/\D/g, '');

        // Basing min and max length on
        // http://developer.ean.com/general_info/Valid_Credit_Card_Types
        if (cardNum.length < 13 || cardNum.length > 19) {
            return false;
        }

        for (num = cardNum.length - 1; num >= 0; num--) {
            charDigit = cardNum.charAt(num);
            numDigit = parseInt(charDigit, 10);

            if (even) {
                if ((numDigit *= 2) > 9) {
                    numDigit -= 9;
                }
            }
            numCheck += numDigit;
            even = !even;
        }

        return (numCheck % 10) === 0;
    }
};

/**
 * Bitcoin invoice dialog
 */
var bitcoinDialog = {

    /** Timer for counting down the time till when the price expires */
    countdownIntervalId: 0,

    /** Original HTML of the Bitcoin dialog before modifications */
    dialogOriginalHtml: '',

    /** The gateway ID for using Bitcoin */
    gatewayId: 4,

    /**
     * Step 3 in plan purchase with Bitcoin
     * @param {Object} apiResponse API result
     */
    showInvoice: function(apiResponse) {

        /* Testing data to watch the invoice expire in 5 secs
        apiResponse['expiry'] = Math.round(Date.now() / 1000) + 5;
        //*/

        // Set details
        var bitcoinAddress = apiResponse.address;
        var bitcoinUrl = 'bitcoin:' + apiResponse.address + '?amount=' + apiResponse.amount;
        var invoiceDateTime = new Date(apiResponse.created * 1000);
        var proPlanNum = pro.propay.selectedProPackage[1];
        var planName = pro.getProPlanName(proPlanNum);
        var planMonths = l[6806].replace('%1', pro.propay.selectedProPackage[4]);  // x month purchase
        var priceEuros = pro.propay.selectedProPackage[5];
        var priceBitcoins = apiResponse.amount;
        var expiryTime = new Date(apiResponse.expiry);

        // Cache selectors
        var $dialogBackgroundOverlay = $('.fm-dialog-overlay');
        var $bitcoinDialog = $('.bitcoin-invoice-dialog');

        // If this is the first open
        if (bitcoinDialog.dialogOriginalHtml === '') {

            // Clone the HTML for the original dialog so it can be reset upon re-opening
            bitcoinDialog.dialogOriginalHtml = $bitcoinDialog.html();
        }
        else {
            // Replace the modified HTML with the original HTML
            $bitcoinDialog.safeHTML(bitcoinDialog.dialogOriginalHtml);
        }

        // Render QR code
        bitcoinDialog.generateBitcoinQrCode($bitcoinDialog, bitcoinAddress, priceBitcoins);

        // Update details inside dialog
        $bitcoinDialog.find('.btn-open-wallet').attr('href', bitcoinUrl);
        $bitcoinDialog.find('.bitcoin-address').text(bitcoinAddress);
        $bitcoinDialog.find('.invoice-date-time').text(invoiceDateTime);
        $bitcoinDialog.find('.plan-icon').addClass('pro' + proPlanNum);
        $bitcoinDialog.find('.plan-name').text(planName);
        $bitcoinDialog.find('.plan-duration').text(planMonths);
        $bitcoinDialog.find('.plan-price-euros .value').text(priceEuros);
        $bitcoinDialog.find('.plan-price-bitcoins').text(priceBitcoins);

        // Set countdown to price expiry
        bitcoinDialog.setCoundownTimer($bitcoinDialog, expiryTime);

        // Close dialog and reset to original dialog
        $bitcoinDialog.find('.btn-close-dialog').rebind('click.bitcoin-dialog-close', function() {

            $dialogBackgroundOverlay.removeClass('bitcoin-invoice-dialog-overlay').addClass('hidden');
            $bitcoinDialog.addClass('hidden');

            // End countdown timer
            clearInterval(bitcoinDialog.countdownIntervalId);
        });

        // Make background overlay darker and show the dialog
        $dialogBackgroundOverlay.addClass('bitcoin-invoice-dialog-overlay').removeClass('hidden');
        $bitcoinDialog.removeClass('hidden');
    },

    /**
     * Renders the bitcoin QR code with highest error correction so that MEGA logo can be overlayed
     * http://www.qrstuff.com/blog/2011/12/14/qr-code-error-correction
     * @param {Object} dialog jQuery object of the dialog
     * @param {String} bitcoinAddress The bitcoin address
     * @param {String|Number} priceInBitcoins The price in bitcoins
     */
    generateBitcoinQrCode: function(dialog, bitcoinAddress, priceInBitcoins) {

        var options = {
            width: 256,
            height: 256,
            correctLevel: QRErrorCorrectLevel.H,    // High
            background: '#ffffff',
            foreground: '#000',
            text: 'bitcoin:' + bitcoinAddress + '?amount=' + priceInBitcoins
        };

        // Render the QR code
        dialog.find('.bitcoin-qr-code').text('').qrcode(options);
    },

    /**
     * Sets a countdown timer on the bitcoin invoice dialog to count down from 15~ minutes
     * until the bitcoin price expires and they need to restart the process
     * @param {Object} dialog The bitcoin invoice dialog
     * @param {Date} expiryTime The date/time the invoice will expire
     */
    setCoundownTimer: function(dialog, expiryTime) {

        // Clear old countdown timer if they have re-opened the page
        clearInterval(bitcoinDialog.countdownIntervalId);

        // Count down the time to price expiration
        bitcoinDialog.countdownIntervalId = setInterval(function() {

            // Show number of minutes and seconds counting down
            var currentTimestamp = Math.round(Date.now() / 1000);
            var difference = expiryTime - currentTimestamp;
            var minutes = Math.floor(difference / 60);
            var minutesPadded = (minutes < 10) ? '0' + minutes : minutes;
            var seconds = difference - (minutes * 60);
            var secondsPadded = (seconds < 10) ? '0' + seconds : seconds;

            // If there is still time remaining
            if (difference > 0) {

                // Show full opacity when 1 minute countdown mark hit
                if (difference <= 60) {
                    dialog.find('.clock-icon').css('opacity', 1);
                    dialog.find('.expiry-instruction').css('opacity', 1);
                    dialog.find('.time-to-expire').css('opacity', 1);
                }

                // Show time remaining
                dialog.find('.time-to-expire').text(minutesPadded + ':' + secondsPadded);
            }
            else {
                // Grey out and hide details as the price has expired
                dialog.find('.scan-code-instruction').css('opacity', '0.25');
                dialog.find('.btn-open-wallet').css('visibility', 'hidden');
                dialog.find('.bitcoin-address').css('visibility', 'hidden');
                dialog.find('.bitcoin-qr-code').css('opacity', '0.15');
                dialog.find('.qr-code-mega-icon').hide();
                dialog.find('.plan-icon').css('opacity', '0.25');
                dialog.find('.plan-name').css('opacity', '0.25');
                dialog.find('.plan-duration').css('opacity', '0.25');
                dialog.find('.plan-price-euros').css('opacity', '0.25');
                dialog.find('.plan-price-bitcoins').css('opacity', '0.25');
                dialog.find('.plan-price-bitcoins-btc').css('opacity', '0.25');
                dialog.find('.expiry-instruction').text(l[8845]).css('opacity', '1');
                dialog.find('.time-to-expire').text('00:00').css('opacity', '1');
                dialog.find('.price-expired-instruction').show();

                // End countdown timer
                clearInterval(bitcoinDialog.countdownIntervalId);
            }
        }, 1000);
    },

    /**
     * Process the result from the API User Transaction Complete call
     * @param {Object} utcResult The results from the UTC call
     */
    processUtcResult: function(utcResult) {

        // Hide the loading animation
        pro.propay.hideLoadingOverlay();

        // Show the Bitcoin invoice dialog
        if (typeof utcResult.EUR === 'object') {
            bitcoinDialog.showInvoice(utcResult.EUR);
        }
        else {
            bitcoinDialog.showBitcoinProviderFailureDialog();
        }
    },

    /**
     * Show a failure dialog if the provider can't be contacted
     */
    showBitcoinProviderFailureDialog: function() {

        var $dialogBackgroundOverlay = $('.fm-dialog-overlay');
        var $bitcoinFailureDialog = $('.bitcoin-provider-failure-dialog');

        // Add styles for the dialog
        $bitcoinFailureDialog.removeClass('hidden');
        $dialogBackgroundOverlay.addClass('bitcoin-invoice-dialog-overlay').removeClass('hidden');

        // End countdown timer
        clearInterval(bitcoinDialog.countdownIntervalId);

        // Close dialog and reset to original dialog
        $bitcoinFailureDialog.find('.btn-close-dialog').rebind('click', function() {
            $dialogBackgroundOverlay.removeClass('bitcoin-invoice-dialog-overlay').addClass('hidden');
            $bitcoinFailureDialog.addClass('hidden');
        });
    }
};

if (is_chrome_firefox) {
    mBroadcaster.once('startMega', function() {
        "use strict";

        unionPay.redirectToSite =
        sabadell.redirectToSite =
            tryCatch(function(res) {
                mozSendPOSTRequest(res.EUR.url, res.EUR.postdata);
            }, function(error) {
                msgDialog('warninga', l[135], l[47], error, function() {
                    pro.propay.hideLoadingOverlay();
                });
            });
    });
}
