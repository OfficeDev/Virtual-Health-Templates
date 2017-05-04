$(".rating-input").change(function () {
    if (this.checked) {
        callRating = this.value;
    }
});

$(document).ready(function () {
    $("#loadingImage").show();
    $("#displayAllElements").hide();
    if (getCookie("pingSpeed") != "") {
        pingValue = getCookie("pingSpeed");
        bandwidthValue = getCookie("averageBandWidth");
    }
    cookievalue = getCookie("meetingdetails");
    if (cookievalue == "" || cookievalue == null) {
        GetDecryptedUri(function (output) {
            decryptedUriParameters = output;
            usertype = decodeURIComponent(getQueryStringParameter("userType", decryptedUriParameters));
            displayName = decodeURIComponent(getQueryStringParameter("displayName", decryptedUriParameters));
            meetingId = decodeURIComponent(getQueryStringParameter("meetingId", decryptedUriParameters));
            var qs = meetingId + ":" + usertype + ":" + displayName;
            setCookie("meetingdetails", qs);
            GetMeetingDetails();
        });
    }
    else {
        var arr = cookievalue.split(':');
        meetingId = arr[0];
        usertype = arr[1];
        displayName = arr[2];
        GetMeetingDetails();
    }

    window.closeModal = function () {
        $("#myModal").removeClass("in");
        $(".modal-backdrop").remove();
        //$("#myModal").hide();
    };

    $('#btn-showLobby').click(function () {
        $("#ParticipantsLobby").show();
    });
    $('#divParticipantsLobbyClose').click(function () {
        $("#ParticipantsLobby").hide();
    });
    $('#LinkConfigureDevices').click(function () {
        $('#ConfigureDevices').show();
    });
    $("#linkVideoExpand").on('click', function () {
        if ($("#videoContainer").hasClass("vh-video--max")) {
            $("#videoContainer").removeClass("vh-video--max");
            $("#videoContainer").addClass("vh-video");
            StopRenderingVideo(meetingUri);
            HideOthersVideo();
            setTimeout(function () {
                RenderVideo(meetingUri);
                ShowOthersVideo();
            }, 1000);
        }
        else {
            var participantCount = conversation.participantsCount();
            $("#videoContainer").removeClass("vh-video");
            $("#videoContainer").addClass("vh-video--max");
            for (var i = 0; i < participantCount; i++) {
                $('#video' + i).find("video").css('height', '100%');
                $('#video' + i).find("object").css('height', '100%');
            }
        }
    });

    $("#questionaireCancelbtn").click(function () {
        questionaireSubmitted = true;
        CheckQuestionnaireRequired();
        InitializeConferenceCall();
    });
});

Array.remove = function (array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

//this variable represents the total number of popups can be displayed according to the viewport width
var total_popups = 0;

//arrays of popups ids
var popups = [];

function register_popup(participantEmail, id, name) {
    $("#lobbyUsers").hide();
    $("#multipleChats").show();
    for (var iii = 0; iii < popups.length; iii++) {
        //already registered. Bring it to front.
        if (id == popups[iii]) {
            console.log("already registered at :" + iii + ", " + popups[iii]);
            Array.remove(popups, iii);

            popups.unshift(id);
            calculate_popups();
            return;
        }
    }

    var objExists = document.getElementById('chatPopUp_' + id);
    console.log("object exists: " + objExists);
    if (objExists == null) {
        var element = '<div id="' + id + '"><div id="chatPopUp_' + id + '" >' +
            '<div id="chatServiceWrap_' + id + '" class="chatServiceWrap"> ' +
            '<div class="panel panel-primary">' +
            '<div class="panel-heading" id="accordion">' +
            '<span class="glyphicon glyphicon-comment"></span> ' + name +
            '<div class="btn-group pull-right">' +
            '<a type="button" class="btn-default-override btn-xs" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" id="chatClose_' + id + '" >' +
            '<button type="button" class="close" style="color:#fff;" ><span aria-hidden="true" >&times;</span></button>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="panel-body">' +
            '<div id="message-history_' + id + '" class="messages"></div>' +
            '<div>' +
            '<input id="message_' + id + '" type="text" placeholder="Type Message here" style="border:1px solid black;width:100%"/>'
        '</div>' +
            '</div>' +
            '</div>' +
            '</div></div>';

        $('#multipleChats').append(element);

        $('#chatMinimize_' + id).attr('onclick', 'minimize_popup("' + id + '")');
        $('#message_' + id).keypress(function (e) {
            if (e.which == 13) {
                if (participantEmail != '') {
                    SendIMMessages(participantEmail, id);
                }
                else {
                    sendMessage(meetingUri, id);
                }
            }
        });

        if (participantEmail != '') {
            $('#sendMessasge_' + id).attr('onclick', 'SendIMMessages("' + participantEmail + '","' + id + '")');
            $('#chatClose_' + id).attr('onclick', 'close_multipleChats("' + participantEmail + '", "' + id + '")');
        }
        else {
            $('#sendMessasge_' + id).attr('onclick', 'sendMessage("' + meetingUri + '", "' + id + '")');
            $('#chatClose_' + id).attr('onclick', 'close_popup("' + meetingUri + '", "' + id + '")');
        }
    }
    popups.unshift(id);
    calculate_popups();
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

function calculate_popups() {
    var width = window.innerWidth;
    if (width < 540) {
        total_popups = 0;
    }
    else {
        width = width - 200;
        //320 is width of a single popup box
        total_popups = parseInt(width / 320);
    }

    display_popups();
}
//displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
function display_popups() {
    var right = 0;

    var iii = 0;
    var element;
    for (iii; iii < total_popups; iii++) {
        if (popups[iii] != undefined) {
            element = document.getElementById('chatPopUp_' + popups[iii]);
            if (element != null) {
                element.style.right = right + "px";
                right = right + 360;
                element.style.display = "block";
            }
        }
    }

    for (var jjj = iii; jjj < popups.length; jjj++) {
        element = document.getElementById('chatPopUp_' + popups[jjj]);
        element.style.display = "none";
    }
}

function minimize_popup(id) {
    for (var iii = 0; iii < popups.length; iii++) {
        if (id == popups[iii]) {
            Array.remove(popups, iii);
            document.getElementById('chatPopUp_' + id).style.display = "none";
            calculate_popups();
            $('#lobbyUsers').show();
            return;
        }
    }
}
function close_multipleChats(participantEmail, id) {
    for (var iii = 0; iii < popups.length; iii++) {
        if (id == popups[iii]) {
            if (confirm("Are you sure to stop the conversation?")) {
                Array.remove(popups, iii);
                StopMultipleConversations(participantEmail);
                $('#' + id).remove();
                calculate_popups();
                $('#lobbyUsers').show();
                return;
            }
        }
    }
}
function close_popup(meetingUri, id) {
    for (var iii = 0; iii < popups.length; iii++) {
        if (id == popups[iii]) {
            if (confirm("Are you sure to stop the conversation?")) {
                Array.remove(popups, iii);
                $('#' + id).remove();
                calculate_popups();
                $('#lobbyUsers').show();
                return;
            }
        }
    }
}
//recalculate when window is loaded and also when window is resized.
window.addEventListener("resize", calculate_popups);
window.addEventListener("load", calculate_popups);

function GetMeetingDetails() {
    var url = hostUri + 'HealthCare/GetMeetingUri?meetingId=' + meetingId;
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data) {
            CheckPrerequisites(data);
        },
        error: function (request, status, error) {
            console.log(error);
        }
    });
}

function GetDecryptedUri(handleData) {
    var url = hostUri + 'HealthCare/GetDecryptedUri?encryptedUri=' + encodeURIComponent(document.URL.split("?")[1]);
    $.ajax({
        url: url,
        type: 'GET',
        cache: false,
        success: function (data) {
            handleData(data);
        },
        error: function (request, status, error) {
            alert("error: " + error);
        }
    });
}

function CheckPrerequisites(meetingDetails) {
    cid = meetingDetails["OnLineMeetingId"];
    meetingUri = meetingDetails["OnlineMeetingUri"];
    meetingUrl = meetingDetails["OnlineMeetingUrl"];
    questionnaireRequired = meetingDetails["QuestionnaireRequired"];
    doctorsName = meetingDetails["DoctorsName"].replace("Dr. ", "");
    questionCategory = meetingDetails["QuestionCategory"];
    startDateTimeOfMeeting = meetingDetails["StartTime"];
    endDateTimeOfMeeting = meetingDetails["EndTime"];
    CheckTimeOfJoining();
}

function CheckQuestionnaireRequired() {
    if (questionnaireRequired == 'True') {
        if (!questionaireSubmitted) {
            $('#landingContent').show();
            angular.element('#questionControllerDiv').scope().loadData();
            $('#landingContent').css('height', $(window).height());
            $('#loadingText1').html('We will start your virtual visit soon. <br/> Please fill the Patient Questionnaire form.');
            $('#patientQuestionnairePopup').show();
            questionaireSubmitted = false;
        }
        else {
            $('#patientQuestionnairePopup').hide();
            $('#loadingText1').html('We will start your virtual visit soon. Please wait for a health care professional.');
            questionaireSubmitted = true;
        }
    }
    else {
        $('#patientQuestionnairePopup').hide();
        questionaireSubmitted = true;
    }
}

function CheckAndSubmit() {
    $("#loadingImage").hide();
    $("#displayAllElements").show();
    CheckQuestionnaireRequired();
    if (questionaireSubmitted) {
        InitializeConferenceCall();
    }
}

function CheckDevices() {
    devicesCheck = getInternalCookie("devicesCheck");
    if (devicesCheck) {
        devicesChecked = true;
    }
    else if (!devicesCheck) {
        var devicesLink = "<a href='" + hostUri + "HealthCare/ConfigureDevices'>here</a>";
        $('#landingContent').show();
        $('#landingContent').css('height', $(window).height());
        $('#loadingText1').html('We will start your virtual visit soon. We have identified that you have not set your devices. <br />Please click ' + devicesLink + ' to set the devices.');
        devicesChecked = false;
    }
}

function UpdatePatientStatus(cid) {
    var url = hostUri + 'HealthCare/UpdatePatientStatus?itemId=' + cid;
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'text',
        success: function (data) {
            console.log("Updated patient status");
        },
        error: function (x, y, z) {
            console.log("Error updating patient status" + z);
        }
    });
}

function InitializeConferenceCall() {
    $("#loadingImage").show();
    $("#displayAllElements").hide();
    if (usertype === "Doctor") {
        $('.vh-header').show();
        SignIn();
        $("#lobbyUsers").show();
    }
    else {
        $.when(AuthenticateUsingTrustedApi(trustedApiLink, displayName, meetingUrl, location.origin)).then(
            function (response) {
                //Success
                authTokenFromTrustedApi = response;
                InitialiseSkype();
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
}

$('#btnChatService').click(function () {
    openChatWindow(meetingUri);
});

$('#input-message').on('keypress', function (evt) {
    if (evt.keyCode == 13) {
        evt.preventDefault();
        sendMessage(meetingUri);
    }
});

function ChatPopUpClose(id) {
    $('#chatPopUp_' + id).hide();
}
$('#chatClose').click(function () {
    $('#chatPopUp').hide();
});

$('#btnShowDevices').click(function () {
    $('#divDevicesPopUpBox').show();
});
$('#btnHideDevices').click(function () {
    $('#divDevicesPopUpBox').hide();
});
$('#btnHideShow').click(function () {
    var value = $(this).attr('class');
    if (value == "right-arrow") {
        $('#PatientQuestionnaire').animate({
            right: "-" + $('#PatientQuestionnaire').width(),
        }, 500, function () {
            // Animation complete.
        });
        $(this).removeClass('right-arrow');
        $(this).addClass('left-arrow');
    }
    else {
        $('#PatientQuestionnaire').animate({
            right: '0px',
        }, 500, function () {
            // Animation complete.
        });
        $(this).removeClass('left-arrow');
        $(this).addClass('right-arrow');
    }
});

$('#btn-showothers-video').click(function () {
    ShowOthersVideo();
    RenderVideo(meetingUri);
});
$('#btn-hideothers-video').click(function () {
    HideOthersVideo();
    StopRenderingVideo(meetingUri);
});

$('#btnHangUp, #hang-up').click(function () {
    if (confirm("Are you sure to end the call?")) {
        hangUp();
    }
});
function hangUp() {
    if (meetingUri.trim()) {
        HangUpCall(meetingUri);

        try {
            if (usertype == undefined) {
                usertype = decodeURIComponent(getQueryStringParameter("userType", decodedecryptedUriParameters));
            }
            if (usertype == "Doctor") {
                updateMeetingEndTime();
            }
            else if (usertype == undefined) {
                console.log("usertype is undefined");
            }
        }
        catch (err) {
            console.log("error in updating meeting time. Message: " + err.message);
        }
    }
}
$('#btn-mute, #btn-unmute').click(function () {
    MuteAndUnMute(meetingUri);
});

$('#btn-show-video').click(function () {
    ShowMyVideo(meetingUri);
});
$('#btn-hide-video').click(function () {
    HideMyVideo(meetingUri);
});

$('#btn-start-video').click(function () {
    StartParticipantVideo();
});
$('#btn-stop-video').click(function () {
    StopParticipantVideo();
});
$('#btnSetDevices').click(function () {
    if (confirm("Are you sure to set devices.")) {
        ChangeDevices(meetingUri);
        $('#divDevicesPopUpBox').hide();
    }
});

function getQueryStringParameter(paramToRetrieve, decodedParameters) {
    var params = null;
    if (decodedParameters != "") {
        var fullQueryString = decodedParameters;
        if (-1 == fullQueryString.indexOf(paramToRetrieve)) {
            console.log("Decoded fullQueryString to " + atob(fullQueryString));
            fullQueryString = atob(fullQueryString);
        } else {
            console.log("No decoding required for " + fullQueryString);
        }

        params = fullQueryString.split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }
    else {
        return null;
    }
}

function setCookie(key, cvalue) {
    sessionStorage.setItem(key, cvalue);
}

function getCookie(cname) {
    var result = "";
    var ca = sessionStorage.getItem(cname);
    if (ca != null && ca != "null" && ca != "" && ca.length != 0) {
        result = ca;
    }
    return result;
}

function getInternalCookie(cname) {
    var result = "";
    var ca = localStorage.getItem(cname);
    if (ca != null && ca != "null" && ca != "" && ca.length != 0) {
        result = ca;
    }
    return result;
}
$('#btnMinScreen').click(function () {
    $('#allVideoControls').addClass('container');
    $('#callControls').css('height', '514px');
    $('#btnMaxScreen').show();
    $('#btnMinScreen').hide();
});

$('#btnMaxScreen').click(function () {
    $('#allVideoControls').removeClass('container');
    $('#callControls').css('height', $(window).height() - 150);
    $('#btnMaxScreen').hide();
    $('#btnMinScreen').show();
});

$("#btnAddFeedback").click(function () {
    var audioIssues = 'No';
    var videoIssues = 'No';
    var comments = '';
    var audioIssueList = '';
    var videoIssueList = '';
    var browser = '';
    $('input[class=audio]').each(function () {
        if (this.checked) {
            audioIssues = 'Yes';
            if (audioIssueList == '') {
                audioIssueList = this.value;
            }
            else {
                audioIssueList = audioIssueList + ',' + this.value;
            }
        }
    });

    if (audioIssueList == '') {
        audioIssueList = 'None';
    }

    $('input[class=video]').each(function () {
        if (this.checked) {
            videoIssues = 'Yes';
            if (videoIssueList == '') {
                videoIssueList = this.value;
            }
            else {
                videoIssueList = videoIssueList + ',' + this.value;
            }
        }
    });

    if (videoIssueList == '') {
        videoIssueList = 'None';
    }

    comments = $('#comments').val();
    browser = getBrowser();
    var url = hostUri + 'HealthCare/InsertAttendees?meetingId=' + meetingId + '&callRating=' + callRating + '&audioIssues=' + audioIssues + '&audioIssueList=' + audioIssueList + '&videoIssues=' + videoIssues + '&videoIssueList=' + videoIssueList + '&comments=' + comments + '&userName=' + displayName + '&bandwidth=' + bandwidthValue + '&ping=' + pingValue + '&browserType=' + browser;
    $.ajax({
        url: url,
        cache: false,
        type: 'GET',
        success: function (data) {
            setTimeout(function () {
                self.close();
            }, 3000);
        },
        error: function (x, y, z) {
            setTimeout(function () {
                self.close();
            }, 3000);
        }
    });
});

function openPopUpBox() {
    $("#divPopBox").show();
}

function delay(ms) {
    var start = +new Date;
    while ((+new Date - start) < ms);
}

window.onbeforeunload = function (e) {
    if (joined) {
        e.stopPropagation();
        e.preventDefault();
        HangUpCall(meetingUri);
        return null;
    }
}

$("#divPopBoxClose").click(function () {
    setTimeout(function () {
        self.close();
    }, 3000);
});

function updateMeetingEndTime() {
    var url = hostUri + 'HealthCare/UpdateMeetingEndTime?itemId=' + meetingId + '&time=' + new Date().toISOString();
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            console.log("meeting end time successfully updated");
        },
        error: function (x, y, z) {
            console.log("meeting end time :Error");
        }
    });
}
function getBrowser() {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M[0];
}

//Questionaire Logic below
var questions = [];
var app = angular.module('healthCare', []);
$("#questionaireSubmitbtn").text("Loading Questionaire");
app.controller('myCtrl', function ($scope, $http) {
    $scope.loadData = function () {
        var url = hostUri + 'HealthCare/GetQuestionaire?meetingId=' + meetingId + '&questionCategory=' + questionCategory;
        console.log("Getting Questionaire from  " + url);
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.length > 0) {
                    questions = data;
                    console.log("Sucessfully got Questionaire");
                    $scope.QuestionsModel = questions;
                    $scope.$digest();
                }
                $("#questionaireSubmitbtn").text("Submit");
            },
            error: function (request, status, error) {
                alert("error in get Questionaire: " + error);
            }
        });
    }
});

app.controller('PeersCtrl', function ($scope, $http) {
    $scope.loadData = function () {
        var url = hostUri + 'HealthCare/GetDoctors?department=all';
        console.log("Getting doctors list from  " + url);
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.length > 0) {
                    console.log("Sucessfully got doctors list");
                    $('#peerChatControl').show();
                    $scope.doctors = data;
                    $scope.$digest();
                }
            },
            error: function (request, status, error) {
                alert("error in get doctors list: " + error);
            }
        });
    }
    $scope.getContactPresence = function (email) {
        GetPresence(email);
    }
    $scope.openChat = function (email, name) {
        var id = GetSubString(email);
        register_popup(email, id, name);
    }
});

app.controller('PatientResponseCtrl', function ($scope) {
    $scope.loadData = function () {
        var url = hostUri + 'HealthCare/GetQuestionnaireInformation?meetingId=' + meetingId;
        console.log("Getting list of Question and Answer  " + url);
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.length > 0) {
                    console.log("Sucessfully got list of Questionnaire");
                    $('#patientResponse').show();
                    $scope.answerModel = data;
                    $scope.$digest();
                } else {
                    $('#patientResponse').css("visibility", "hidden");
                }
            },
            error: function (request, status, error) {
                alert("error in get doctors list: " + error);
            }
        });
    }
});

function SaveQuestionnaire() {
    questions[0].MeetingId = meetingId;
    var jsonObj = JSON.stringify(questions);
    var url = hostUri + 'HealthCare/SaveQuestionnaire';
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        headers: {
            '__RequestVerificationToken': $('input[name=__RequestVerificationToken]').val(),
            'X-Requested-With': 'XMLHttpRequest'
        },
        data: jsonObj,
        contentType: 'application/json; charset=utf-8',
        cache: false,
        success: function (data) {
            console.log('sucess');
        },
        error: function (request, status, error) {
            console.log(error);
        }
    });

    $("#questionaireSubmitbtn").text("Saved");
    $("#questionaireSubmitbtn").attr("disabled", "disabled");
    questionaireSubmitted = true;
    CheckQuestionnaireRequired();
    InitializeConferenceCall();
}

function watchspeed() {
    var downloadspeed = Number(($('#downloadValue').text()).replace(/[^\d.-]/g, ''));
    var uploadspeed = Number(($('#uploadValue').text()).replace(/[^\d.-]/g, ''));
    var pingSpeed = Number(($('#pingValue').text()).replace(/[^\d.-]/g, ''));
    var averageBandWidth = (downloadspeed + uploadspeed) / 2;
    bandwidthValue = averageBandWidth;
    pingValue = pingSpeed;
};

previousVal = "";
function InputChangeListener() {
    watchspeed();
}

var handle = 0;
function PerformBandwidthTest() {
    var url = hostUri + 'HealthCare/GetConfigurationDetailsByKey?Key=CalculateBandwidthDuringConference';
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            if (data == "True") {
                console.log("Bandwidth Test initiated");
                handle = setInterval(InputChangeListener, 500);
                $('#stbutton').click();
                $('#stbutton').click();
                setTimeout(function () { console.log("Test Completed Bandwidth:" + bandwidthValue + " PingValue: " + pingValue); clearInterval(handle); }, 30000);
            }
            else {
                console.log("Bandwidth Test skipped");
            }
        },
        error: function (x, y, z) {
            console.error(x + '\n' + y + '\n' + z + "Error rror while bandwidth test");
        }
    });
}

function CheckTimeOfJoining() {
    var d = new Date();
    var n = d.getTimezoneOffset();
    var url = hostUri + 'HealthCare/CheckTimeOfJoiningMeeting?itemId=' + meetingId + '&offsetTime=' + n;
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            if (data == "True") {
                if (meetingUri == null || meetingUri == '') {
                    CreateMeetingUri();
                }
                else {
                    if (usertype == 'Patient') {
                        console.log("checking for Prerequistes.");
                        UpdatePatientStatus(meetingId);
                        CheckAndSubmit();
                    }
                    else {
                        InitializeConferenceCall();
                    }
                }
            }
            else {
                $("#loadingImage").hide();
                $("#displayAllElements").show();
                $('#landingContent').show();
                $('#landingContent').css('height', $(window).height());
                $('#PatientQuestionnaire').css('height', $(window).height() - 70);
                $('#loadingText1').html("You can only join the meeting 30 minutes prior to the meeting start time.");
            }
        },
        error: function (x, y, z) {
            console.error(x + '\n' + y + '\n' + z + "Error while checking start time with current time.");
        }
    });
}