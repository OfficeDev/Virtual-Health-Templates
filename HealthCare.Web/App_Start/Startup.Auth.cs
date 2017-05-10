/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

using System;
using System.Configuration;
using System.Globalization;
using System.Threading.Tasks;
using HealthCare.Web.Models;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.IdentityModel.Protocols;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Notifications;
using Microsoft.Owin.Security.OpenIdConnect;

namespace HealthCare.Web
{
  using Owin;
  using System.IdentityModel.Claims;

  /// <summary>
  /// Configures Authentication for the application
  /// </summary>
  public partial class Startup
  {
    /// <summary>
    /// The authority
    /// </summary>
    public static readonly string Authority =
        $"{ConfigurationManager.AppSettings["ida:AuthorizationUri"]}/{ConfigurationManager.AppSettings["ida:TenantId"]}";

    /// <summary>
    /// The graph resource identifier
    /// </summary>
    public static readonly string GraphResourceId = "https://graph.microsoft.com";

    /// <summary>
    /// Configures the authentication.
    /// </summary>
    /// <param name="app">The application.</param>
    public void ConfigureAuth(IAppBuilder app)
    {
      string appURl = ConfigurationManager.AppSettings["ida:HealthCarePortal"];
      app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);

      app.UseCookieAuthentication(new CookieAuthenticationOptions
      {
        CookieManager = new VirtualWebCookieManager()
      });

      app.UseOpenIdConnectAuthentication(
          new OpenIdConnectAuthenticationOptions
          {
            ClientId = ConfigurationManager.AppSettings["ida:ClientId"],
            Authority = Authority,
            PostLogoutRedirectUri = appURl,
            RedirectUri = appURl,
            Notifications = new OpenIdConnectAuthenticationNotifications()
            {
              // If there is a code in the OpenID Connect response, redeem it for an access token and refresh token, and store those away.
              AuthorizationCodeReceived = this.OnAuthorizationCodeReceived,
              AuthenticationFailed = this.OnAuthenticationFailed
            }
          });
    }

    /// <summary>
    /// Called when [authentication failed].
    /// </summary>
    /// <param name="context">The context.</param>
    /// <returns>Authentication failure task</returns>
    private Task OnAuthenticationFailed(AuthenticationFailedNotification<OpenIdConnectMessage, OpenIdConnectAuthenticationOptions> context)
    {
      context.HandleResponse();
      context.Response.Redirect("/Error?message=" + context.Exception.Message);
      return Task.FromResult(0);
    }

    /// <summary>
    /// Called when [authorization code received].
    /// </summary>
    /// <param name="context">The context.</param>
    /// <returns>Athentication success task</returns>
    private async Task OnAuthorizationCodeReceived(AuthorizationCodeReceivedNotification context)
    {
      string appURl = ConfigurationManager.AppSettings["ida:HealthCarePortal"];

      var code = context.Code;

      ClientCredential credential = new ClientCredential(ConfigurationManager.AppSettings["ida:ClientId"], ConfigurationManager.AppSettings["ida:ClientSecret"]);
      string tenantId = context.AuthenticationTicket.Identity.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid").Value;
      string signedInUserId = context.AuthenticationTicket.Identity.FindFirst(ClaimTypes.NameIdentifier).Value;

      AuthenticationContext authContext = new AuthenticationContext(string.Format(CultureInfo.InvariantCulture, "{0}/{1}", ConfigurationManager.AppSettings["ida:AuthorizationUri"], tenantId));

      // If you create the redirectUri this way, it will contain a trailing slash.
      // Make sure you've registered the same exact Uri in the Azure Portal (including the slash).
      Uri uri = new Uri(new Uri(appURl).GetLeftPart(UriPartial.Path));
      AuthenticationResult result = await authContext.AcquireTokenByAuthorizationCodeAsync(code, uri, credential, GraphResourceId);
    }
  }
}