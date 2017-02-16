var date = new Date();
var sessionId = "VIRTUAL" + date.getTime();
var dfd = null;

// Below JSON Input will be passed to trusted API
function AuthenticateUsingTrustedApi(trustedApiLink, nameOfUser, onlineMeetingUrl, allowedOrigin) {
    dfd = jQuery.Deferred();
    var anonAppInput = {
        ApplicationSessionId: sessionId,
        AllowedOrigins: allowedOrigin,
        MeetingUrl: onlineMeetingUrl
    }

    // Obtain the access token for Anonymouse user from Trusted API
    dfd.notify("Sending request for Anon Token");
    var AnonTokenRequest = $.ajax({
        url: hostUri + 'HealthCare/GetAnonToken', // GetAnonTokenJob api
        type: 'post',
        async: 'true',
        headers: {
            '__RequestVerificationToken': $('input[name=__RequestVerificationToken]').val(),
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'text',
        data: anonAppInput
    });
    var ucapSigninOption = null;

    AnonTokenRequest.done(function (txt) {
        dfd.notify("Received Anon token from GetAnonTokenJob api");
        var data = JSON.parse(txt);
        var token = data.Token;
        var discoverUri = data.DiscoverUri;
        ucapAppEndpoint = data.TenantEndpointId;
        /*This number is used to make each patient different*/
        var randomNumber = Math.floor((Math.random() * 20) + 1);
        if (nameOfUser == '')
        {
            nameOfUser = 'Guest-' + randomNumber;
        }
        // Sign In Option Object required to sign-in in Skype Web SDK
        dfd.notify('Authenticated and now creating sigin option');
        ucapSigninOption = {
            name: nameOfUser + '-' + randomNumber,
            token: "Bearer " + token,
            root: {
                user: discoverUri
            },
            cors: true
        };

        dfd.resolve(ucapSigninOption);
    });

    AnonTokenRequest.fail(function (XMLHttpRequest, textStatus, errorThrown) {
        dfd.notify(errorThrown);
        dfd.resolve(errorThrown);
    });

    return dfd.promise();
}



