/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Core.Common
{
    using System.Configuration;
    using System.Net.Mail;

    /// <summary>
    /// This class has methods related to meeting invitation
    /// </summary>
    public class MeetingInvitation
    {
        /// <summary>
        /// Sends the email.
        /// </summary>
        /// <param name="meetingUrl">The meeting URL.</param>
        /// <param name="participantEmail">The participant email.</param>
        /// <param name="error">The error</param>
        /// <returns>True or false</returns>
        public static bool SendEmail(string meetingUrl, string participantEmail, out string error)
        {
            error = string.Empty;
            if (string.IsNullOrEmpty(meetingUrl))
            {
                error = "Invalid meeting url";
                return false;
            }

            if (string.IsNullOrEmpty(meetingUrl))
            {
                error = "Invalid meeting url";
                return false;
            }

            string userName = ConfigurationManager.AppSettings["SpoUserName"];
            string password = CertificateHelper.SpoPassword;
            MailMessage msg = new MailMessage();
            msg.To.Add(new MailAddress(participantEmail));
            msg.From = new MailAddress(userName);
            msg.Subject = "Online Skype Meeting Invitation";
            msg.Body = GetEmailTemplate(meetingUrl);
            msg.IsBodyHtml = true;
            SmtpClient client = new SmtpClient();
            client.Host = ConfigurationManager.AppSettings["EmailServer"]; // "smtp.office365.com";
            client.Credentials = new System.Net.NetworkCredential(userName, password);
            client.Port = 587;
            client.EnableSsl = true;
            client.Send(msg);
            return true;
        }

        /// <summary>
        /// Gets the email template.
        /// </summary>
        /// <param name="encrypteduri">The encrypted URI</param>
        /// <returns>email template</returns>
        private static string GetEmailTemplate(string encrypteduri)
        {
            //// THIS URL TO NEW HOSTED SITE or USE Request.Url.AbsoluteUri
            string url = encrypteduri;
            string template = "<html><head><meta http-equiv=Content-Type content=\"text/html;charset=windows-1252\">"
                 + "<meta name=Generator content=\"Microsoft Word 15 (filtered)\">"
                 + "<style> @font-face {"
                 + "font-family:Wingdings;"
                 + "panose-1:5 0 0 0 0 0 0 0 0 0;}"
                 + "@font-face {"
                 + "font-family:\"Cambria Math\";"
                 + "panose-1:2 4 5 3 5 4 6 3 2 4; }"
                 + "@font-face  {"
                 + "font-family:Calibri;"
                 + "panose-1:2 15 5 2 2 2 4 3 2 4; }"
                 + "p.MsoNormal, li.MsoNormal, div.MsoNormal{"
                 + "margin: 0cm;"
                 + "margin-bottom:.0001pt;"
                 + "font-size:11.0pt;"
                 + "font-family:\"Calibri\",sans - serif;  }"
                + "a:link, span.MsoHyperlink {"
                 + "color: blue;"
                 + "text-decoration:underline; }"
                 + "a:visited, span.MsoHyperlinkFollowed {"
                 + "color: purple;"
                 + "text-decoration:underline;}"
                 + ".MsoChpDefault{ font-family:\"Calibri\",sans-serif; }"
                 + ".MsoPapDefault {"
                 + "margin-bottom:10.0pt;"
                 + "line-height:115%;}"
                 + "@page WordSection1{"
                 + "size: 595.3pt 841.9pt;"
                 + "margin: 72.0pt 72.0pt 72.0pt 72.0pt;  }"
                + "div.WordSection1 { page: WordSection1; }"
                + "</style>"
                + "</head>"
                + "<body lang=EN-IN link=blue vlink=purple>"
                + " <div class=WordSection1>"
                + "<p class=MsoNormal style='text-autospace:none' ><a name=OutJoinLink><span lang=EN-US style='font-size:14.0pt;font-family:Wingdings;color:#0066CC'></span></a>"
                + "<span lang=EN-US style='font-size:14.0pt;color:#0066CC'> </span>"
                + "<a href=\"" + url + "\">"
                + "<span lang=EN-US  style='font-size:16.0pt;color:#0066CC'> Join Skype Meeting</span></a>"
                + "<span lang=EN-US style='font-size:14.0pt'> <a name=OutSharedNoteBorder></a>"
                + "<a name=OutSharedNoteLink></a></span></p>"
                 + "<table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0 style='border-collapse:collapse'>"
               + "<tr> <td width=500 valign=top style='width:300.0pt;padding:0cm 0cm 0cm 0cm'>"
               + "<p class=MsoNormal style='margin-top:3.0pt;margin-right:0cm;margin-bottom:12.0pt;margin-left:16.0pt;line-height:125%;text-autospace:none'>"
               + "<span style='font-size:10.0pt;line-height:125%'>This is an online meeting for Skype for Business, the professional meetings and communications app formerly known as Lync.</span></p></td></tr></table>"
               + "<p class=MsoNormal style='text-autospace:none'><span lang=EN style='font-size:13.0pt;color:black'>Join by phone</span></p>"
               + "<p class=MsoNormal style='margin-bottom:2.0pt;text-autospace:none'><span lang=EN style='font-size:10.0pt'><a href=\"tel:1-813-995-6081\"><span style='color:#0066CC'>1-813-995-6081</span></a> (Tampa)English(United States)</span></p>"
               + "<p class=MsoNormal style='margin-bottom:2.0pt;text-autospace:none'><u><span lang=EN style='font-size:10.0pt;color:#943634'><a href=\"https://dialin.lynclabs.com\"><span style='color:#0066CC'> Find a local number</span></a></span></u><span lang=EN> </span></p>"
               + "<p class=MsoNormal style='margin-bottom:2.0pt;text-autospace:none'><span lang=EN style='font-size:8.0pt'> &nbsp;</span></p>"
               + "<p class=MsoNormal style='margin-bottom:2.0pt;text-autospace:none'><span lang=EN style='font-size:10.0pt'>Conference ID: 79261</span></p>"
               + "<p class=MsoNormal style='text-autospace:none'><span lang=EN style='font-size:3.0pt'> </span><span lang=EN style='font-size:10.0pt;color:#0066CC'><a href=\"https://dialin.lynclabs.com\"><span style='color:#0066CC'> Forgot your dial-in PIN?</span></a></span><span lang = EN style='font-size:3.0pt'> </span><span  lang=EN>|</span><span lang=EN style='font-size:10.0pt'><a href=\"http://o15.officeredir.microsoft.com/r/rlidLync15?clid=1033&amp;p1=5&amp;p2=2009\"><span style='color:#0066CC'>Help</span></a></span><span lang=EN style='font-size:3.0pt'></span></p>"
               + "<p class=MsoNormal>&nbsp;</p>"
               + "</div></body></html>";

            return template;
        }
    }
}
