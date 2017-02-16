var pageTitle = 'Configure Devices';
var client;

var registeredListeners = registeredListeners || [];
registeredListeners.forEach(function (listener) { listener.dispose(); });
registeredListeners = [];
var meetingId, usertype, displayName, validatePeripherals, questionaireSubmitted, devicesCheck;
var pluginVerified = false;

var ucapSigninOption = null;
var meetingUri;
var meetingUrl;

$(document).ready(function () {
    document.getElementById("net_check_result").innerHTML = "Network Speed Test is in progress ...";

    function getAdhocMeeting() {
        var getadhocmeetinginput = { Subject: 'This is a test VHC', Description: 'This is a test', AccessLevel: '' };
        $.ajax({
            url: trustedApiLink + '/GetAdhocMeetingJob',
            type: 'post',
            async: true,
            dataType: 'text',
            data: getadhocmeetinginput,
            error: function (err) {
                console.log(err.responseText);
            },
            success: function (d) {
                var data = JSON.parse(d);
                meetingUrl = data.JoinUrl;
                meetingUri = data.OnlineMeetingUri;
                $.when(AuthenticateUsingTrustedApi(trustedApiLink, "Guest", meetingUrl, location.origin)).then(
                    function (response) {
                        //Success
                        ucapSigninOption = response;
                        initialiseSkype();
                    },
                function (response) {
                    //error
                    console.log(response);
                },
                function (response) {
                    //notification
                    console.log(response);
                });
            }
        });
    }

    function initialiseSkype() {
        var config = {
            apiKey: 'a42fcebd-5b43-4b89-a065-74450fb91255' // SDK
        };
        Skype.initialize({ apiKey: config.apiKey }, function (api) {
            var Application = api.application;
            window.skypeWebApp = new Application();
        }, function (err) {
            console.log(err);
            alert('Cannot load the SDK.');
        });
    }

    function detectIE() {
        var ua = window.navigator.userAgent;
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            var rv = ua.indexOf('rv:');
            if (parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)) {
                return true;
            }
            return false;
        }

        return false;
    }

    function SignInToSkype() {
        window.skypeWebApp.signInManager.signIn(ucapSigninOption).then(function () {
            client = window.skypeWebApp;
            SubscribeToDevices();
            var ieVersion = detectIE();
            if (ieVersion) {
                document.getElementById("PluginStatus").innerHTML = "Plugin is installed.";
                $("#PluginState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
                $("#btnPluginOk").removeAttr("disabled");
            } else {
                document.getElementById("PluginStatus").innerHTML = "Plugin is not required.";
                $("#PluginState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
                $("#btnPluginOk").removeAttr("disabled");
            }
            pluginVerified = true;
            document.getElementById("MicrophoneStatus").innerHTML = "";
            document.getElementById("SpeakerStatus").innerHTML = "";
            $("#MicrophoneTab").css("display", "block");
            $("#SpeakerTab").css("display", "block");
        });

        return true;
    }

    document.getElementById("MicrophoneStatus").innerHTML = "Plugin is not yet verified. Go back to plugin tab....";
    document.getElementById("SpeakerStatus").innerHTML = "Plugin is not yet verified. Go back to plugin tab....";

    $("#btnCheckPlugin").click(function () {
        $("#PluginDetails").css("display", "block");
        if (pluginVerified == false) {
            document.getElementById("PluginStatus").innerHTML = "<img src='/Content/Images/preloader.gif'>";
            var ieVersion = detectIE();
            if (ieVersion) {
                checkPlugin();
            } else {
                SignInToSkype();
            }
        }
    });
    $("#btnSkipInternet").click(function () {
        $("#liInternet").removeClass("active");
        $("#internet").removeClass("active");
        $("#liPlugin").addClass("active");
        $("#plugin").addClass("active");
        if (document.getElementById("btnInternetOk").hasAttribute("disabled")) {
            $("#internetState").removeClass("tick-icon").removeClass("cancel-icon").addClass("quetion-icon");
        } else {
            $("#internetState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
        }
    });

    $("#btnInternetOk").click(function () {
        $("#liInternet").removeClass("active");
        $("#internet").removeClass("active");
        $("#liPlugin").addClass("active");
        $("#plugin").addClass("active");
        $("#internetState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
    });

    $("#btnGoToInternetTab").click(function () {
        $("#liPlugin").removeClass("active");
        $("#plugin").removeClass("active");
        $("#liInternet").addClass("active");
        $("#internet").addClass("active");
    });

    $("#btnPluginOk").click(function () {
        $("#liPlugin").removeClass("active");
        $("#plugin").removeClass("active");
        $("#liWebcam").addClass("active");
        $("#webcam").addClass("active");
    });

    $("#btnWebcamError").click(function () {
        $("#WebcamState").removeClass("quetion-icon").removeClass("tick-icon").addClass("cancel-icon");
        $("#liWebcam").removeClass("active");
        $("#webcam").removeClass("active");
        $("#liMicrophone").addClass("active");
        $("#microphone").addClass("active");
    });

    $("#btnWebcamOk").click(function () {
        $("#WebcamState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
        $("#liWebcam").removeClass("active");
        $("#webcam").removeClass("active");
        $("#liMicrophone").addClass("active");
        $("#microphone").addClass("active");
    });

    $("#btnSkipWebcam").click(function () {
        $("#WebcamState").removeClass("tick-icon").removeClass("cancel-icon").addClass("quetion-icon");
        $("#liWebcam").removeClass("active");
        $("#webcam").removeClass("active");
        $("#liMicrophone").addClass("active");
        $("#microphone").addClass("active");
    });

    $("#btnMicrophoneError").click(function () {
        $("#MicrophoneState").removeClass("quetion-icon").removeClass("tick-icon").addClass("cancel-icon");
        $("#liMicrophone").removeClass("active");
        $("#microphone").removeClass("active");
        $("#liSpeaker").addClass("active");
        $("#speaker").addClass("active");
    });

    $("#btnMicrophoneOk").click(function () {
        $("#MicrophoneState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
        $("#liMicrophone").removeClass("active");
        $("#microphone").removeClass("active");
        $("#liSpeaker").addClass("active");
        $("#speaker").addClass("active");
    });

    $("#btnSkipMicrophone").click(function () {
        $("#MicrophoneState").removeClass("tick-icon").removeClass("cancel-icon").addClass("quetion-icon");
        $("#liMicrophone").removeClass("active");
        $("#microphone").removeClass("active");
        $("#liSpeaker").addClass("active");
        $("#speaker").addClass("active");
    });

    $("#btnSpeakerError").click(function () {
        $("#SpeakerState").removeClass("quetion-icon").removeClass("tick-icon").addClass("cancel-icon");
        $("#btnSpeakerOk").prop("disabled", true);
        $("#btnSpeakerError").prop("disabled", true);
    });

    $("#btnSpeakerOk").click(function () {
        $("#SpeakerState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
        $("#btnSpeakerOk").prop("disabled", true);
        $("#btnSpeakerError").prop("disabled", true);
        if ($("#SpeakerState").hasClass("tick-icon") && $("#MicrophoneState").hasClass("tick-icon") && $("#WebcamState").hasClass("tick-icon") && $("#PluginState").hasClass("tick-icon") && $("#internetState").hasClass("tick-icon")) {
        } else {
            alert("Please verify all steps.");
        }
    });

    $("#btnSkipSpeaker").click(function () {
        $("#SpeakerState").removeClass("tick-icon").removeClass("cancel-icon").addClass("quetion-icon");

    });

    $('#btnSkipDevicesCheck').click(function () {
    });

    function checkPlugin() {
        var pluginManager = Skype.Web.Media.PluginManager();
        pluginManager.init();
        if ((pluginManager.isPluginInstalled._value) && (pluginManager.installedVersion._value.split('.')[0] >= 16)) {
            SignInToSkype();
        } else {
            document.getElementById("PluginStatus").innerHTML = "Plugin is not installed.";
            pluginVerified = false;
            $("#PluginState").removeClass("quetion-icon").removeClass("tick-icon").addClass("cancel-icon");
            $("#downloadPlugins").css("display", "block");
        }
    }

    function SubscribeToDevices() {
        SubscribeToEvents();
        ListAvailableDevices();
        ShowCurrentDevices();
    }

    function SubscribeToEvents() {
        var app = client;
        app.devicesManager.cameras.subscribe();
        app.devicesManager.microphones.subscribe();
        app.devicesManager.speakers.subscribe();
    }

    function ListAvailableDevices() {
        //cameras
        client.devicesManager.cameras.added(function (newCamera) {
            $('#cameras')
                .append($("<option></option>")
                .attr("value", newCamera.id())
                .text(newCamera.name()));

        });

        //microphones
        client.devicesManager.microphones.added(function (newMicrophone) {
            $('#mics')
                .append($("<option></option>")
                .attr("value", newMicrophone.id())
                .text(newMicrophone.name()));
        });

        //speakers
        client.devicesManager.speakers.added(function (newSpeaker) {
            $('#speakers')
                .append($("<option></option>")
                .attr("value", newSpeaker.id())
                .text(newSpeaker.name()));

        });
    }

    function ShowCurrentDevices() {
        client.devicesManager.selectedCamera.changed(function (theCamera) {
            $('#selectedCamera').text(theCamera.name());
        });


        client.devicesManager.selectedMicrophone.changed(function (theMicrophone) {
            $('#selectedMicrophone').text(theMicrophone.name());
        });


        client.devicesManager.selectedSpeaker.changed(function (theSpeaker) {
            $('#selectedSpeaker').text(theSpeaker.name());
        });

    }

    $('#cameras').change(function () {
        var chosenCameraId = $('#cameras').val();
        client.devicesManager.cameras.get().then(function (list) {
            for (var i = 0; i < list.length; i++) {
                var camera = list[i];
                if (camera.id() == chosenCameraId) {
                    client.devicesManager.selectedCamera.set(camera);
                }
            }

        });
    });

    $('#mics').change(function () {

        var chosenMicId = $('#mics').val();
        client.devicesManager.microphones.get().then(function (list) {
            for (var i = 0; i < list.length; i++) {
                var microphone = list[i];
                if (microphone.id() == chosenMicId) {
                    client.devicesManager.selectedMicrophone.set(microphone);
                }
            }

        });
    });

    $('#speakers').change(function () {

        var chosenSpeakerId = $('#speakers').val();
        client.devicesManager.speakers.get().then(function (list) {
            for (var i = 0; i < list.length; i++) {
                var speaker = list[i];
                if (speaker.id() == chosenSpeakerId) {
                    client.devicesManager.selectedSpeaker.set(speaker);
                }
            }

        });
    });

    $('#btnStartWebcam').click(function () {
        if (pluginVerified) {
            document.getElementById("WebCamStatus").innerHTML = "";
            $("#WebCamShow").css("display", "block");
            createVideoMeeting();
        }
        else {
            document.getElementById("WebCamStatus").innerHTML = "Plugin is not yet verified. Go back to plugin tab....";
            $("#WebCamShow").css("display", "none");
        }

    });

    $('#btnStartMicrophone').click(function () {
        $("#MicrophoneShow").css("display", "block");
    });

    $('#btnNetworkTest').click(function () {
        $('#networkTest').show();
        $('#btnNetworkTest').hide();
        getAdhocMeeting();

        // Purposly called click method twise as per requirement of speedtest.js
        $('#stbutton').click();
        $('#stbutton').click();
    });

    function addListner() {
        client.conversationsManager.conversations.get().then(function (conversationsArray) {
            if (conversationsArray && conversationsArray.length > 1) {
                conversationsArray.forEach(function (element, index, array) {
                    console.log("Closing existed conversation...");
                    client.conversationsManager.conversations.remove(element);
                });
            }
        });

        var addedListener = client.conversationsManager.conversations.added(function (conversation) {
            var chatService, dfdChatAccept, audioService, dfdAudioAccept, videoService, dfdVideoAccept, selfParticipant, name, timerId;
            selfParticipant = conversation.selfParticipant;
            chatService = conversation.chatService;
            audioService = conversation.audioService;
            videoService = conversation.videoService;

            selfParticipant.audio.state.changed(function (newState, reason, oldState) {
                if (newState == 'Notified' && !timerId)
                    timerId = setTimeout(onAudioVideoNotified, 0);
            });
            selfParticipant.video.state.changed(function (newState, reason, oldState) {
                var selfChannel;
                if (newState == 'Notified' && !timerId) {
                    timerId = setTimeout(onAudioVideoNotified, 0);
                }
                else if (newState == 'Connected') {
                    selfChannel = conversation.selfParticipant.video.channels(0);
                    selfChannel.stream.source.sink.container.set(document.getElementById("previewWindow"));
                }
            });
            conversation.state.changed(function onDisconnect(state) {
                if (state == 'Disconnected') {
                    conversation.state.changed.off(onDisconnect);
                    client.conversationsManager.conversations.remove(conversation);
                }
            });
        });
        registeredListeners.push(addedListener);
    }

    function createVideoMeeting() {
        window.conversation = window.skypeWebApp.conversationsManager.getConversationByUri(meetingUri);
        window.skypeWebApp.conversationsManager.conversations.added(addListner);
        window.conversation.videoService.start().then(function () {
            console.log("video service started!");
        }, function (err) {
            console.log("Error starting audio service: " + err);
        });

    }
});



function watchspeed() {
    var downloadspeed = Number(($('#downloadValue').text()).replace(/[^\d.-]/g, ''));
    var uploadspeed = Number(($('#uploadValue').text()).replace(/[^\d.-]/g, ''));
    var pingSpeed = Number(($('#pingValue').text()).replace(/[^\d.-]/g, ''));
    console.log(downloadspeed);
    console.log(uploadspeed);

    if ((downloadspeed <= 5) || (uploadspeed <= 5)) {
        document.getElementById("net_check_result").innerHTML = "Slow network speed - Only Audio is recommended";
        console.log('slow');
    }
    else if ((downloadspeed <= 10 && downloadspeed >= 5) || (uploadspeed > 5 && uploadspeed <= 10)) {

        document.getElementById("net_check_result").innerHTML = "Average network speed - Audio & Video are recommended";
        console.log('average');

    }
    else if ((downloadspeed > 10 || uploadspeed > 10)) {
        document.getElementById("net_check_result").innerHTML = "Fast network speed - Audio, Video are recommended ";
        console.log('fast');

    }
    else {
        document.getElementById("net_check_result").innerHTML = "Fast network speed - Audio, Video & Sharing are recommended ";
    }

    var averageBandWidth = (downloadspeed + uploadspeed) / 2;
    setCookie("averageBandWidth", averageBandWidth);
    setCookie("pingSpeed", pingSpeed);
    clearInterval(handle);
};

previousVal = "";

function InputChangeListener() {
    if ($('#uploadValue').text()
       != previousVal) {
        previousVal = $('#uploadValue').text();
        console.log($('#uploadValue').text());
        $('#net_check_icon').attr('src', '/Content/Images/tick.png');
        watchspeed();
        $("#internetState").removeClass("quetion-icon").removeClass("cancel-icon").addClass("tick-icon");
        $("#btnInternetOk").removeAttr("disabled");
    }
}

var handle = setInterval(InputChangeListener, 500);

function setCookie(key, cvalue) {
    sessionStorage.setItem(key, cvalue);
}

function meetingConversationAdded(conversation) {
    conversation.selfParticipant.state.changed(function (state) {
        console.log("self participant state: " + state);
    });
    conversation.selfParticipant.video.state.changed(function (newState) {
        var selfChannel;
        if (newState == 'Notified') {
            conversation.videoService.accept();
        }
        if (newState == 'Connected') {
            selfChannel = conversation.selfParticipant.video.channels(0);
            selfChannel.stream.source.sink.container.set(document.getElementById("previewWindow"));
        }
        if (newState == 'Disconnected') {

        }
    });
}
