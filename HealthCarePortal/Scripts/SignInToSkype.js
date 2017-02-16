
function SignIn() {
    if (!location.hash) {
        location.assign('https://login.windows.net/common/oauth2/authorize?response_type=token' + //"&userType=" + usertype + "&displayName=" + displayName + "&meetingId=" + meetingId +
        '&client_id=' + clientId +
        '&redirect_uri=' + location.href +
        '&resource=https://webdir.online.lync.com');
    }
    if (/^#access_token=/.test(location.hash)) {
        InitialiseSkype();
    }
}
