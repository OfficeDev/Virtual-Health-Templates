/// <reference path="jquery-1.11.3.intellisense.js" />

var self = this;
var client;
var chatClient;
var participantState;

var emailAddress;
var conversation;
var meetingUri;
var isCommon = true;
var xHistory = $('#message-history');
var chatServiceWithPatient;

function InitialiseSkype() {
    $('#signInStatus').html("Signing In............");
    var config = {
        apiKey: 'a42fcebd-5b43-4b89-a065-74450fb91255', // SDK
    };
    Skype.initialize({ apiKey: config.apiKey }, function (api) {
        window.skypeWebAppCtor = api.application;
        window.skypeWebApp = new api.application();
        client = new window.skypeWebAppCtor;
        SingInToSkype();
    }, function (err) {
        console.log(err);
        alert('Cannot load the SDK.');
    });
}
function SingInToSkype() {
    var options = {
        "client_id": clientId,
        "origins": ["https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root"],
        "cors": true, "version": 'VirtualHealthTemplates/1.0.0.0',
    }

    if (authTokenFromTrustedApi != null && authTokenFromTrustedApi != '' && authTokenFromTrustedApi != undefined) {
        options = authTokenFromTrustedApi;
    }
    client.signInManager.signIn(
        options
    ).then(function () {
        $('#signInStatus').html("successfully signed In!");
        console.log("successfully signed In!");
        emailAddress = client.personsAndGroupsManager.mePerson.email();
        JoinConferenceCall();
    }, function (err) {
        console.error("Error joining conference anonymously: " + err);
    });
}

function JoinConferenceCall() {
    console.log("Joining " + meetingUri + " ...");
    conversation = client.conversationsManager.getConversationByUri(meetingUri);
    client.conversationsManager.conversations.added(meetingConversationAdded);
    isCommon = false;
    $("#loadingImage").hide();
    $("#displayAllElements").show();
    if (usertype == "Doctor") {
        //StartParticipantVideo();
        angular.element('#peersList').scope().loadData();
        angular.element('#patientResponse').scope().loadData();
    }
    var id = conversation.selfParticipant.person.id();
    id = id.substring(id.indexOf('sip:') + 4, id.indexOf("@"));
    chatServiceWithPatient = conversation.chatService;
    chatServiceWithPatient.start().then(function () {
        console.log("conversation started.");
    });
    conversation.historyService.activityItems.added(function (message) {
        if (message.type() === "TextMessage") {
            openChatWindow();
            historyAppend(id, XMessage(message));
        }
    });

    SubscribeToDevices();
}

// Callback from Skype Web SDK for when a new conversation has been added.
function meetingConversationAdded(conversation) {
    console.log("Conversation added!");
    if (!isCommon) {
        return;
    }
    // Handle conversation disconnections by removing them from memory.
    conversation.state.changed(function (newStatus, reason, oldStatus) {
        if (newStatus === "Disconnected") {
            console.log("Conversation disconnected. Removing it.");
        }
    });

    conversation.selfParticipant.state.changed(function (state) {
        console.log("self participant state: " + state);
        if (state === "InLobby") {
            $('#signInStatus').html("In Lobby");
            $('#patientQuestionnairePopup').hide();
            $('#loadingText1').html("We will start your virtual visit soon. Please wait for a health care professional.");
            $('#landingContent').show();
            $('#landingContent').css('height', $(window).height());
        }
        if (state === 'Connected') {
            joined = true;
            $('#landingContent').hide();
            $("#loadingImage").hide();
            $("#displayAllElements").show();
            $('#allVideoControls').show();
            var countOfParticipantsAndSelf = conversation.participantsCount() + 1;
            $('#participantsList').empty();
            $('#participantCount').text(countOfParticipantsAndSelf);
            var listOfParticipantDiv = "<div class='vh-list__item vh-list__item--divider'>" +
                conversation.selfParticipant.person.displayName(); +"</div>";
            conversation.participants.each(function (callParticipant) {
                listOfParticipantDiv = listOfParticipantDiv + "<div class='vh-list__item vh-list__item--divider'>" + callParticipant.person.displayName() + "</div>";
            });
            $('#participantsList').append(listOfParticipantDiv);
            $('#participantCount').text(countOfParticipantsAndSelf);
            if (usertype === "Patient") {
                $('#PatientsList').css("visibility", "hidden");
                $('#doctorSection').css("visibility", "hidden");
                if (conversation.audioService.state() !== "Connected") {
                    conversation.audioService.start().then(function () {
                        console.log("audio service started!");
                    }, function (err) {
                        console.log("Error starting audio service: " + err);
                    });
                }
            }
            else {
                StartParticipantVideo();
                $('#PatientsList').show();
                $('#PatientsList').css('display', 'table-cell');
                $('#loadingText').html("Patient did not join the conference.");
            }

            $('#signInStatus').html("Connected");
        }
    });

    conversation.selfParticipant.video.state.changed(function (newState) {
        console.log("self participant video state: " + newState);
        if (newState == 'Notified') {
            $('#signInStatus').html("Notified");
            conversation.videoService.accept();
        }
        if (newState == 'Connected') {
            $('#signInStatus').html("Connected");
            if (usertype === 'Patient') {
                RenderVideo(meetingUri);
                ShowOthersVideo();
            }
        }
        if (newState == 'Disconnected') {
            $('#signInStatus').html("Disconnected");
            if (joined) {
                console.log("selfparticipant video state now disconnected: " + emailAddress);
            }
        }
    });

    conversation.participants.added(function (skypeParticipant) {
        console.log("Participant added! ...");

        skypeParticipant.state.changed(function (state) {
            participantState = state;
            console.log("Participant state: " + state);
            if (state == 'InLobby') {
                $('#noLobbyUsers').hide();
                ParticipantWaitingInLobby(skypeParticipant);
            }
            if (state == 'Connected') {
                joined = true;
                $('#loadingText').html("The meeting has started. Use the buttons at the bottom to share your video or see video of other participants.");
                var countOfParticipantsAndSelf = conversation.participantsCount() + 1;
                $('#participantsList').empty();
                $('#participantCount').text(countOfParticipantsAndSelf);
                var listOfParticipantDiv = "<div class='vh-list__item vh-list__item--divider'>" +
                    conversation.selfParticipant.person.displayName().split("-")[0]; +"</div>";
                conversation.participants.each(function (callParticipant) {
                    listOfParticipantDiv = listOfParticipantDiv + "<div class='vh-list__item vh-list__item--divider'>" + callParticipant.person.displayName().split("-")[0] + "</div>";
                });
                $('#participantsList').append(listOfParticipantDiv);
                $('#participantCount').text(countOfParticipantsAndSelf);
            }
            if (state == 'Disconnected') {
                if (joined) {
                    $("#patientWindow").hide();
                    StopRenderingVideo(meetingUri);
                    HideOthersVideo();
                    if (usertype == 'Patient' && skypeParticipant.person.displayName().indexOf(displayName) < 0) {
                        $('#loadingText').html("Doctor left the conference, please close and join again");
                        conversation.participants.remove(skypeParticipant);
                        hangUp();
                    }
                    if (usertype == 'Doctor') {
                        if (!skypeParticipant.person.id()) {
                            console.log("Patient logged in for the first time");
                        } else {
                            $('#loadingText').html("Patient left the conference");
                            console.log("Patient left conference " + skypeParticipant.person.displayName());
                            conversation.participants.remove(skypeParticipant);
                        }
                    }

                    $('#loadingText').show();
                }
            }

            skypeParticipant.video.state.when('Connected', function () {
                // lets assign a container.
                skypeParticipant.video.channels(0).isVideoOn.when(true, function () {
                    setTimeout(function () {
                        RenderVideo(meetingUri);
                        ShowOthersVideo();
                    }, 2000);
                });
                skypeParticipant.video.channels(0).isVideoOn.when(false, function () {
                    skypeParticipant.video.channels(0).stream.source.sink.container.set(null);
                    StopRenderingVideo(meetingUri);
                    HideOthersVideo();
                });
            });
            skypeParticipant.video.channels(0).isVideoOn.subscribe();
            skypeParticipant.video.state.subscribe();
        });
    });

    conversation.participants.removed(function (skypeParticipant) {
        var countOfParticipantsAndSelf = conversation.participantsCount() + 1;
        $('#participantsList').empty();
        $('#participantCount').text(countOfParticipantsAndSelf);
        var listOfParticipantDiv = "<div class='vh-list__item vh-list__item--divider'>" +
            conversation.selfParticipant.person.displayName().split("-")[0]; +"</div>";
        conversation.participants.each(function (callParticipant) {
            listOfParticipantDiv = listOfParticipantDiv + "<div class='vh-list__item vh-list__item--divider'>" + callParticipant.person.displayName().split("-")[0] + "</div>";
        });
        $('#participantsList').append(listOfParticipantDiv);
        $('#participantCount').text(countOfParticipantsAndSelf);
        var state = skypeParticipant.state;
        console.log("Participant removed.");
        console.log(skypeParticipant);
    });
}

function openChatWindow() {
    var id = conversation.selfParticipant.person.id();
    id = id.substring(id.indexOf('sip:') + 4, id.indexOf("@"));
    register_popup('', id, conversation.selfParticipant.person.displayName().split("-")[0]);
}

function StartChatConversation(participantEmail, selfParticipant, id) {
    var chatConversation = client.conversationsManager.getConversation("sip:" + participantEmail);
    if (chatConversation.participantsCount() == 0) {
        var chatConvParticipant = chatConversation.createParticipant("sip:" + selfParticipant);
        chatConversation.participants.add(chatConvParticipant);
    }
    client.conversationsManager.conversations.add(chatConversation);
    var chatServiceWithPeer = chatConversation.chatService;
    chatConversation.historyService.activityItems.added(function (message) {
        console.log("history service message: " + message);
        if (message.type() === "TextMessage") {
            historyAppend(id, XMessage(message));
        }
    });
    chatServiceWithPeer.start().then(function () {
        console.log("conversation started.");
    });
    return chatServiceWithPeer;
}
function StartIMConversation(meetingUri) {
    var chatConversation = client.conversationsManager.getConversationByUri(meetingUri);
    var id = conversation.selfParticipant.person.id();
    id = id.substring(id.indexOf('sip:') + 4, id.indexOf("@"));
    chatServiceWithPatient = chatConversation.chatService;
    chatServiceWithPatient.start().then(function () {
        console.log("conversation started.");
    });
}
function SendIMMessages(participantEmail, id) {
    var chatConversation = client.conversationsManager.getConversation("sip:" + participantEmail);
    var chatServiceWithPeer = chatConversation.chatService;
    if (chatConversation.state._value == "Created") {
        selfParticipantEmail = emailAddress;
        chatServiceWithPeer = StartChatConversation(participantEmail, selfParticipantEmail, id);
    }

    var textmessage = $('#message_' + id).val();
    chatServiceWithPeer.sendMessage(textmessage).catch(function (error) {
        console.log('Cannot send the message ' + error);
    });
    $('#message_' + id).val("");
}

function sendMessage(meetingUri, id) {
    var message = $('#message_' + id).val();
    if (message) {
        chatServiceWithPatient.sendMessage(message).catch(function (error) {
            console.log('Cannot send the message ' + error);
        });
    }
    $('#message_' + id).val("");
}
function StopConversation(meetingUri) {
    var chatConversation = client.conversationsManager.getConversationByUri(meetingUri);
    if (chatConversation) {
        chatConversation.leave();
    }
}
function StopMultipleConversations(participantEmail) {
    var chatConversation = client.conversationsManager.getConversation("sip:" + participantEmail);
    if (chatConversation) {
        chatConversation.leave();
    }
}

function historyAppend(id, message) {
    var historyElement = "";
    if (id == '') {
        historyElement = $('#message-history');
    }
    else {
        historyElement = $('#message-history_' + id);
    }
    historyElement.append(message);
    historyElement.animate({ "scrollBottom": historyElement[0].scrollHeight }, 'fast');
}

function XMessage(message) {
    var xTitle = $('<div>').addClass('sender');
    var xStatus = $('<div>').addClass('status');
    var xText = $('<div>').addClass('text').text(message.text());
    var xMessage = $('<div>').addClass('message');
    xMessage.append(xTitle, xStatus, xText);
    if (message.sender) {
        message.sender.displayName.get().then(function (displayName) {
            if (message.sender.id() != client.personsAndGroupsManager.mePerson.id()) {
                xTitle.text(displayName.split("-")[0]);
            } else if (message.sender.id() == client.personsAndGroupsManager.mePerson.id()) {
                xTitle.text("Me");
            }
        });
    }
    message.status.changed(function (status) {
        //xStatus.text(status);
    });
    if (message.sender.id() == client.personsAndGroupsManager.mePerson.id())
        xMessage.addClass("fromMe");
    return xMessage;
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
    var selectedCamera = client.devicesManager.selectedCamera().id();
    $('#cameras option[value=' + selectedCamera + ']').attr('selected', 'selected');
    var selectedMicrophone = client.devicesManager.selectedMicrophone().id();
    $('#mics option[value=' + selectedMicrophone + ']').attr('selected', 'selected');
    var selectedSpeaker = client.devicesManager.selectedSpeaker().id();
    $('#speakers option[value=' + selectedSpeaker + ']').attr('selected', 'selected');
}

function SubscribeToDevices() {
    SubscribeToEvents();
    ListAvailableDevices();
}

function SubscribeToEvents() {
    client.devicesManager.cameras.subscribe();
    client.devicesManager.microphones.subscribe();
    client.devicesManager.speakers.subscribe();
}
function ChangeDevices(meetingUri) {
    var stopAudio;
    var changedMicrophone = null, changedSpeaker = null;
    var chosenCameraId = $('#cameras').val();
    var chosenMicId = $('#mics').val();
    var chosenSpeakerId = $('#speakers').val();
    client.devicesManager.cameras.get().then(function (list) {
        for (var i = 0; i < list.length; i++) {
            var camera = list[i];
            if (camera.id() == chosenCameraId) {
                client.devicesManager.selectedCamera.set(camera);
                console.log("camera has changed to: " + chosenCameraId);
            }
        }
    });

    client.devicesManager.microphones.get().then(function (list) {
        console.log("get Mic");
        for (var i = 0; i < list.length; i++) {
            var microphone = list[i];
            if (microphone.id() == chosenMicId) {
                changedMicrophone = microphone;
                //stopAduio = true;
                client.devicesManager.selectedMicrophone.set(microphone);
            }
        }
    });

    client.devicesManager.speakers.get().then(function (list) {
        console.log("get Speaker");
        for (var i = 0; i < list.length; i++) {
            var speaker = list[i];
            if (speaker.id() == chosenSpeakerId) {
                changedSpeaker = speaker;
                client.devicesManager.selectedSpeaker.set(speaker);
            }
        }
    });
}

function RenderVideo(uri) {
    var conv = client.conversationsManager.getConversationByUri(uri);
    conv.videoService.accept();
    if (conv) {
        var participantCount = conv.participantsCount();
        if (participantCount > 0) {
            $('#loadingText').hide();
            if (participantCount == 1 || participantCount == 2) {
                $('#top-row-videos').show();
                $('#top-row-videos').css('display', 'table-row');
                $('#bottom-row-videos').hide();
            }
            else if (participantCount == 3 || participantCount == 4) {
                $('#top-row-videos').show();
                $('#top-row-videos').css('display', 'table-row');
                $('#bottom-row-videos').show();
                $('#bottom-row-videos').css('display', 'table-row');
            }
            for (var i = 0; i < participantCount; i++) {
                $('#video' + i).show();
                $('#video' + i).css('display', 'table-cell');
                var participant = conv.participants(i);
                var participantChannel = participant.video.channels(0);
                participantChannel.stream.source.sink.container.set(document.getElementById("video" + i));
                participant.video.channels(0).isStarted.set(true).then(function () {
                    for (var i = 0; i < participantCount; i++) {
                        $('#video' + i).find("video").css('height', '378px');
                        $('#video' + i).find("object").css('height', '378px');
                    }
                });
                $('#video' + i + 'Name').html(participant.person.displayName().split("-")[0]);
            }

            $("#patientWindow").show();
        }
    }
}

function StopRenderingVideo(uri) {
    var conv = client.conversationsManager.getConversationByUri(uri);
    if (conv) {
        var participantCount = conv.participantsCount();
        if (participantCount > 0) {
            for (var i = 0; i < participantCount; i++) {
                var participant = conv.participants(i);
                var participantChannel = participant.video.channels(0);
                participantChannel.stream.source.sink.container.set(document.getElementById("video" + i));
                participant.video.channels(0).isStarted.set(false);
                $('#video' + i + 'Name').html();
                $('#video' + i).closest("object").remove();
                $('#video' + i).closest("video").remove();
                $('#video' + i).hide();
            }
        }
    }
}

function ParticipantWaitingInLobby(participant) {
    var dispName, participantId;
    participant.person.id.get().then(function (id) {
        participantId = id;
        dispName = participant.person.displayName().split("-")[0];
        participantId = participantId.substring(participantId.indexOf('sip:') + 4, participantId.indexOf("@"));
        var participantsDiv = "<div class='vh-list__item vh-list__item--divider'>" +
            "<div class='mv-participant' id='mv-participant_" + participantId + "'> " +
            "<span class='pp-pic orange-status'></span>" +
            "<span class='mv-name'>" + dispName + "</span>" +
            "</div>" +
            "<div class='mv-admitClass' id='" + participantId + "'>" +
            "<input type='button' value='Admit' class='btn btn-primary' id='btnAdmitParticipant_" + participantId + "' />" +
            "</div>" +
            "</div>";
        $('#mv-participants').append(participantsDiv);
        $("#multipleChats").hide();
        $("#lobbyUsers").show();
        $('#btnAdmitParticipant_' + participantId).attr('onclick', 'AdmitParticipant("' + participantId + '","' + dispName + '");');
    });
}
function AdmitParticipant(dispEmail, dispName) {
    console.log("admit participant: " + dispEmail);
    var conversation = client.conversationsManager.getConversationByUri(meetingUri);
    var currentParticipant;
    if (conversation) {
        var participantsInLobby = 0;
        var participantCount = conversation.participantsCount();
        if (participantCount > 0) {
            for (var i = 0; i < participantCount; i++) {
                var p = conversation.participants(i);
                if (p.state._value == 'InLobby') {
                    participantsInLobby++;
                }
                p.person.id.get().then(function (id) {
                    currentParticipant = id;
                    if (currentParticipant != null && currentParticipant != "" && currentParticipant != "undefined") {
                        currentParticipant = currentParticipant.substring(currentParticipant.indexOf('sip:') + 4, currentParticipant.indexOf("@"));
                        if (currentParticipant == dispEmail) {
                            p.admit.enabled.get().then(function (isEnabled) {
                                console.log("isEnabled: " + isEnabled);
                                $('#mv-participant_' + dispEmail).remove();
                                $('#' + dispEmail).remove();
                                p.admit();
                                var countOfParticipantsAndSelf = conversation.participantsCount() + 1;
                                $('#participantsList').empty();
                                $('#participantCount').text(countOfParticipantsAndSelf);
                                var listOfParticipantDiv = "<div class='vh-list__item vh-list__item--divider'>" +
                                    conversation.selfParticipant.person.displayName().split("-")[0]; +"</div>";
                                conversation.participants.each(function (callParticipant) {
                                    listOfParticipantDiv = listOfParticipantDiv + "<div class='vh-list__item vh-list__item--divider'>" + callParticipant.person.displayName().split("-")[0] + "</div>";
                                });
                                $('#participantsList').append(listOfParticipantDiv);
                            });
                        }
                    }
                });
            }
            if (participantsInLobby == 1) {
                $('#noLobbyUsers').show();
            }
        }
    }
}

function HangUpCall(uri) {
    var conversation = client.conversationsManager.getConversationByUri(uri);
    if (conversation) {
        $('#myVideo').hide();
        conversation.selfParticipant.video.channels(0).stream.source.sink.container.set(null);
        conversation.selfParticipant.video.channels(0).isStarted.set(false);
        conversation.audioService.stop();
        conversation.videoService.stop();
        conversation.leave();
        joined = false;
        client.signInManager.signOut();
        $('#loadingText').hide();
        console.log("call ended for: " + emailAddress);
    }
};

function MuteAndUnMute(uri) {
    var conv, audio;
    conv = client.conversationsManager.getConversationByUri(uri);
    if (conv) {
        audio = conv.selfParticipant.audio;
        if (audio.isMuted()) {
            $("#btn-unmute").hide();
            $("#btn-mute").show();
        }
        else {
            $("#btn-unmute").show();
            $("#btn-mute").hide();
        }
        audio.isMuted.set(!audio.isMuted());
    }
};

function StartParticipantVideo() {
    $('#btn-start-video').hide();
    $('#btn-stop-video').show();
    if (conversation.videoService.state !== "Connected") {
        conversation.videoService.start();
    }
    conversation.selfParticipant.video.state.changed(function (newState, reason, oldState) {
        if (newState == 'Connected') {
            var selfChannel = conversation.selfParticipant.video.channels(0);
            selfChannel.stream.source.sink.format('Crop');
            selfChannel.stream.source.sink.container.set(document.getElementById("myVideo"));
            conversation.selfParticipant.video.channels(0).isStarted.set(true);
            ShowMyVideo();
        }
    });
};

function StopParticipantVideo() {
    $('#btn-start-video').show();
    $('#btn-stop-video').hide();
    conversation.selfParticipant.video.channels(0).isStarted.set(false).then(function () {
        conversation.selfParticipant.video.channels(0).stream.source.sink.container.set(null);
    });
    HideMyVideo();
};

// Joins a conference as an anonymous participant.
// uri: A SfB conference URI.
function joinConferenceAnonymously() {
    SignIn();
};
function returnConversationObj(uri) {
    return client.conversationsManager.getConversationByUri(uri);
};
function returnClientObj() {
    return client;
};

function signOut() {
    client.signInManager.signOut().then(function () {
        console.log("Signed out.");
    }, function (err) {
        console.error("Error signing out: " + err);
    });
};
function ShowMyVideo() {
    $("#btn-show-video").hide();
    $("#btn-hide-video").show();
    $('#myVideo').show();
    $('#myVideo').css('display', 'inline-block');
}

function HideMyVideo() {
    $("#btn-show-video").show();
    $("#btn-hide-video").hide();
    $('#myVideo').hide();
}

function ShowOthersVideo() {
    $("#btn-hideothers-video").show();
    $("#btn-showothers-video").hide();
}
function HideOthersVideo() {
    $("#btn-hideothers-video").hide();
    $("#btn-showothers-video").show();
}

function GetPresence(emailAddress) {
    var pSearch = client.personsAndGroupsManager.createPersonSearchQuery();
    console.log("email: " + emailAddress);
    pSearch.text(emailAddress);
    pSearch.limit(1);
    pSearch.getMore().then(function () {
        var sr = pSearch.results();
        if (sr[0] != null) {
            return sr[0].result;
        }
    }).then(function (contact) {
        if (contact != undefined || contact != null) {
            var name = contact.displayName();
            console.log("contact name: " + name);
            var id = emailAddress.substring(0, emailAddress.indexOf('@'));
            if (contact.company() != undefined) {
                $('#presence_' + id).css('background-image', 'url(' + contact.avatarUrl() + ')');
            }
            contact.status.changed(function (newStatus, reason, oldStatus) {
                if (oldStatus !== undefined) {
                    console.log("status is: " + newStatus + ", old status: " + oldStatus);
                    $('#presence_' + id)
                        .removeClass(oldStatus.toLowerCase())
                        .addClass(newStatus.toLowerCase());
                } else {
                    console.log("status is: " + newStatus);
                    $('#presence_' + id)
                        .addClass(newStatus.toLowerCase());
                }
            });
            contact.status.subscribe();
        }
    }).then(null, function (error) {
        console.log(error || 'Something went wrong');
    });
}
function GetSubString(email) {
    return email.substring(0, email.indexOf('@'));
}

function CreateMeetingUri() {
    var getadhocmeetinginput = { Subject: 'Virtual Health - Meeting', Description: 'This meeting was schedule anonymously by virtual health' };
    $.ajax({
        url: hostUri + 'HealthCare/GetAnonMeeting',
        type: 'post',
        async: true,
        dataType: 'text',
        headers: {
            '__RequestVerificationToken': $('input[name=__RequestVerificationToken]').val(),
            'X-Requested-With': 'XMLHttpRequest'
        },
        data: getadhocmeetinginput,
        error: function (err) {
            logError(err.responseText);
        },
        success: function (data) {
            data = JSON.parse(data);
            meetingUrl = data.JoinUrl;
            meetingUri = data.OnlineMeetingUri;
            UpdateMeetingDetails();
        }
    });
}

function CreateUcwaMeeting() {
    $.ajax({
        type: "Get",
        cache: false,
        url: hostUri + "HealthCare/MeetingInvitationWithoutUri?itemId=" + meetingId + "&startDateTime=" + startDateTimeOfMeeting + "&endDateTime=" + endDateTimeOfMeeting + "&patientName=" + displayName,
        contentType: "application/json",
        dataType: "text",
    }).done(function (data) {
        console.log('token success.');
        console.log(data);
        var arr = JSON.parse(data);
        if (arr != null) {
            meetingUri = arr[0];
            meetingUrl = arr[1];
            if (usertype == 'Patient') {
                console.log("checking for Prerequistes.");
                UpdatePatientStatus(meetingId);
                CheckAndSubmit();
            }
            else {
                InitializeConferenceCall();
            }
        } else {
            console.log('could not set meeting uri and url.');
        }
    }).fail(function (response) {
        console.log('failed to create meeting uri');
        console.log(response);
    });
}

/*This function will be used when adhoc meeting starts working*/
function UpdateMeetingDetails() {
    $.ajax({
        type: "Get",
        cache: false,
        url: hostUri + "HealthCare/UpdateMeetingDetails?itemId=" + meetingId + "&meetingUrl=" + meetingUrl + "&meetingUri=" + meetingUri,
        contentType: "application/json",
        dataType: "text",
    }).done(function () {
        console.log('Updated item details for the item: ' + meetingId);
        if (usertype == 'Patient') {
            console.log("checking for Prerequistes.");
            UpdatePatientStatus(meetingId);
            CheckAndSubmit();
        }
        else {
            InitializeConferenceCall();
        }
    }).fail(function (response) {
        console.log('failed to update meeting details in sharepoint list');
        console.log(response);
    });;
}