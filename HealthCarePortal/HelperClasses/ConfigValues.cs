/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.HelperClasses
{
    using System.Web.Configuration;

    /// <summary>
    /// Configuration Values class used in the complete projects.
    /// </summary>
    public class ConfigValues
    {
        /// <summary>
        /// The connection string
        /// </summary>
        private static string connectionString = WebConfigurationManager.AppSettings["ida:ConnectionString"];

        /// <summary>
        /// The bot URL embed
        /// </summary>
        private static string botUrlEmbed = WebConfigurationManager.AppSettings["botUrlEmbed"];

        /// <summary>
        /// The client identifier
        /// </summary>
        private static string clientId = WebConfigurationManager.AppSettings["ida:ClientId"];

        /// <summary>
        /// The application key
        /// </summary>
        private static string appKey = WebConfigurationManager.AppSettings["ida:ClientSecret"];

        /// <summary>
        /// The Azure AD instance
        /// </summary>
        private static string aadInstance = WebConfigurationManager.AppSettings["ida:AuthorizationUri"];

        /// <summary>
        /// The health care portal
        /// </summary>
        private static string healthCarePortal = WebConfigurationManager.AppSettings["ida:HealthCarePortal"];

        /// <summary>
        /// The SharePoint site
        /// </summary>
        private static string spoSite = WebConfigurationManager.AppSettings["SharepointSite"];

        /// <summary>
        /// The SharePoint user name
        /// </summary>
        private static string spoUserName = WebConfigurationManager.AppSettings["SPOUserName"];

        /// <summary>
        /// The SharePoint password
        /// </summary>
        private static string spoPassword = KeyVaultHelper.SpoPassword;

        /// <summary>
        /// The meeting subject
        /// </summary>
        private static string meetingSubject = WebConfigurationManager.AppSettings["ida:MeetingSubject"];

        /// <summary>
        /// The meeting body
        /// </summary>
        private static string meetingBody = "<div>There is an appointment scheduled, below are the details</div> " +
                                            "<div>Start Date: {0} </div> " +
                                            "<div>End Date: {1} </div>" +
                                            "<div>Meeting Link: {2} </div>";

        /// <summary>
        /// The o365 unified API resource
        /// </summary>
        private static string o03655UnifiedAPIResource = @"https://graph.microsoft.com/";

        /// <summary>
        /// The send message URL
        /// </summary>
        private static string sendMessageUrl = @"https://graph.microsoft.com/v1.0/me/microsoft.graph.sendmail";

        /// <summary>
        /// The get me URL
        /// </summary>
        private static string getMeUrl = @"https://graph.microsoft.com/v1.0/me";

        /// <summary>
        /// The graph resource identifier
        /// </summary>
        private static string graphResourceID = "https://graph.windows.net";

        /// <summary>
        /// The graph calendar resource identifier
        /// </summary>
        private static string graphCalendarResourceId = @"https://graph.microsoft.com/v1.0/me/calendar/events";

        /// <summary>
        /// The native application client identifier
        /// </summary>
        private static string nativeAppClientId = WebConfigurationManager.AppSettings["ida:NativeAppClientId"];

        /// <summary>
        /// The native application user name
        /// </summary>
        private static string nativeAppUserName = WebConfigurationManager.AppSettings["ida:UserName"];

        /// <summary>
        /// The native application password
        /// </summary>
        private static string nativeAppPassword = KeyVaultHelper.IdaPassword;

        /// <summary>
        /// The domain name
        /// </summary>
        private static string domainName = WebConfigurationManager.AppSettings["ida:Domain"];

        /// <summary>
        /// The encryption password
        /// </summary>
        private static string encryptionPassword = WebConfigurationManager.AppSettings["EncryptionPassword"];

        /// <summary>
        /// The encryption salt
        /// </summary>
        private static string encryptionSalt = WebConfigurationManager.AppSettings["EncryptionSalt"];

        /// <summary>
        /// The trusted API link
        /// </summary>
        private static string trustedApiLink = WebConfigurationManager.AppSettings["TrustedApi"];

        /// <summary>
        /// The mobile site URI
        /// </summary>
        private static string mobileSiteUri = WebConfigurationManager.AppSettings["MobileSiteUri"];

        /// <summary>
        /// The admin group
        /// </summary>
        private static string adminGroup = WebConfigurationManager.AppSettings["SharepointAdminGroup"];

        /// <summary>
        /// Gets the name of the domain.
        /// </summary>
        /// <value>
        /// The name of the domain.
        /// </value>
        public static string DomainName
        {
            get
            {
                return domainName;
            }
        }

        /// <summary>
        /// Gets the native application password.
        /// </summary>
        /// <value>
        /// The native application password.
        /// </value>
        public static string NativeAppPassword
        {
            get
            {
                return nativeAppPassword;
            }
        }

        /// <summary>
        /// Gets the name of the native application user.
        /// </summary>
        /// <value>
        /// The name of the native application user.
        /// </value>
        public static string NativeAppUserName
        {
            get
            {
                return nativeAppUserName;
            }
        }

        /// <summary>
        /// Gets the native application client identifier.
        /// </summary>
        /// <value>
        /// The native application client identifier.
        /// </value>
        public static string NativeAppClientId
        {
            get
            {
                return nativeAppClientId;
            }
        }

        /// <summary>
        /// Gets the o03655 unified API resource.
        /// </summary>
        /// <value>
        /// The o03655 unified API resource.
        /// </value>
        public static string O03655UnifiedAPIResource
        {
            get
            {
                return o03655UnifiedAPIResource;
            }
        }

        /// <summary>
        /// Gets the send message URL.
        /// </summary>
        /// <value>
        /// The send message URL.
        /// </value>
        public static string SendMessageUrl
        {
            get
            {
                return sendMessageUrl;
            }
        }

        /// <summary>
        /// Gets the get me URL.
        /// </summary>
        /// <value>
        /// The get me URL.
        /// </value>
        public static string GetMeUrl
        {
            get
            {
                return getMeUrl;
            }
        }

        /// <summary>
        /// Gets the graph resource identifier.
        /// </summary>
        /// <value>
        /// The graph resource identifier.
        /// </value>
        public static string GraphResourceID
        {
            get
            {
                return graphResourceID;
            }
        }

        /// <summary>
        /// Gets the graph calendar resource identifier.
        /// </summary>
        /// <value>
        /// The graph calendar resource identifier.
        /// </value>
        public static string GraphCalendarResourceId
        {
            get
            {
                return graphCalendarResourceId;
            }
        }

        /// <summary>
        /// Gets the connection string.
        /// </summary>
        /// <value>
        /// The connection string.
        /// </value>
        public static string ConnectionString
        {
            get
            {
                return connectionString;
            }
        }

        /// <summary>
        /// Gets the bot URL embed.
        /// </summary>
        /// <value>
        /// The bot URL embed.
        /// </value>
        public static string BotUrlEmbed => botUrlEmbed;

        /// <summary>
        /// Gets the client identifier.
        /// </summary>
        /// <value>
        /// The client identifier.
        /// </value>
        public static string ClientId
        {
            get
            {
                return clientId;
            }
        }

        /// <summary>
        /// Gets the client secret.
        /// </summary>
        /// <value>
        /// The client secret.
        /// </value>
        public static string ClientSecret
        {
            get
            {
                return appKey;
            }
        }

        /// <summary>
        /// Gets the Azure AD instance.
        /// </summary>
        /// <value>
        /// The Azure AD instance.
        /// </value>
        public static string AADInstance
        {
            get
            {
                return aadInstance;
            }
        }

        /// <summary>
        /// Gets the application key.
        /// </summary>
        /// <value>
        /// The application key.
        /// </value>
        public static string APPKey
        {
            get
            {
                return appKey;
            }
        }

        /// <summary>
        /// Gets the health care portal.
        /// </summary>
        /// <value>
        /// The health care portal.
        /// </value>
        public static string HealthCarePortal
        {
            get
            {
                return healthCarePortal;
            }
        }

        /// <summary>
        /// Gets the SharePoint site.
        /// </summary>
        /// <value>
        /// The SharePoint site.
        /// </value>
        public static string SPOSite
        {
            get
            {
                return spoSite;
            }
        }

        /// <summary>
        /// Gets the name of the SharePoint user.
        /// </summary>
        /// <value>
        /// The name of the SharePoint user.
        /// </value>
        public static string SPOUserName
        {
            get
            {
                return spoUserName;
            }
        }

        /// <summary>
        /// Gets the SharePoint password.
        /// </summary>
        /// <value>
        /// The SharePoint password.
        /// </value>
        public static string SPOPassword
        {
            get
            {
                return spoPassword;
            }
        }

        /// <summary>
        /// Gets the meeting subject.
        /// </summary>
        /// <value>
        /// The meeting subject.
        /// </value>
        public static string MeetingSubject
        {
            get
            {
                return meetingSubject;
            }
        }

        /// <summary>
        /// Gets the meeting body.
        /// </summary>
        /// <value>
        /// The meeting body.
        /// </value>
        public static string MeetingBody
        {
            get
            {
                return meetingBody;
            }
        }

        /// <summary>
        /// Gets the patient number.
        /// </summary>
        /// <value>
        /// The patient number.
        /// </value>
        public static string PatientNumber
        {
            get
            {
                return "1234567";
            }
        }

        /// <summary>
        /// Gets the encryption password.
        /// </summary>
        /// <value>
        /// The encryption password.
        /// </value>
        public static string EncryptionPassword
        {
            get
            {
                return encryptionPassword;
            }
        }

        /// <summary>
        /// Gets the encryption salt.
        /// </summary>
        /// <value>
        /// The encryption salt.
        /// </value>
        public static string EncryptionSalt
        {
            get
            {
                return encryptionSalt;
            }
        }

        /// <summary>
        /// Gets the trusted API link.
        /// </summary>
        /// <value>
        /// The trusted API link.
        /// </value>
        public static string TrustedApiLink
        {
            get { return trustedApiLink; }
        }

        /// <summary>
        /// Gets the mobile site URI.
        /// </summary>
        /// <value>
        /// The mobile site URI.
        /// </value>
        public static string MobileSiteUri
        {
            get { return mobileSiteUri; }
        }

        /// <summary>
        /// Gets the admin group.
        /// </summary>
        /// <value>
        /// The admin group.
        /// </value>
        public static string AdminGroup
        {
            get { return adminGroup; }
        }
    }
}