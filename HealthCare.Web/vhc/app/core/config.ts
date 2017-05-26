export let TimeSlots = [
    '1 AM',
    '2 AM',
    '3 AM',
    '4 AM',
    '5 AM',
    '6 AM',
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
    '12 AM',
    '1 PM',
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
    '6 PM',
    '7 PM',
    '8 PM',
    '9 PM',
    '10 PM',
    '11 PM',
    '12 PM'
];

export let CONFIG = {
    AppSettings: '/api/config',
    BaseUrls: {
        Meetings: '',
        Leaders: '/api/healthcare/leaders',
        Doctors: '/api/healthcare/doctors',
        Configuration: '',
        SaveAppointment: '/api/healthcare/appointment',
        MeetingMetadata: '/api/healthcare/meeting-metadata',
        MeetingDetails: '/api/healthcare/meeting-details',
        Appointments: '/api/healthcare/appointments',
        CheckTimeOfJoining: '/api/healthcare/checktimeofjoining',
        Questionnaires: '/api/healthcare/questionnaires',
        BotToken: '/api/healthcare/bot-token',
        EmailInvite: '/api/healthcare/email-invite'
    },
    TrustedApi: {
        AnonymousToken: '/api/trustedapi/token'
    },
    SkypeApiKey: 'a42fcebd-5b43-4b89-a065-74450fb91255',
    // Skype Client ID is retrieved using config service
    SkypeClientId: '',
    ErrorPrefix: {
        SkypeErrorPrefix: 'SKYPE ERROR: ',
        SkypeEvents: 'SKYPE EVENT: ',
        SkypeLog: 'SKYPE LOG: '
    },
    TimeSlots: TimeSlots
};