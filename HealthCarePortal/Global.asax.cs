/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal
{
    using System;
    using System.Diagnostics;
    using System.Web.Configuration;
    using System.Web.Helpers;
    using System.Web.Http;
    using System.Web.Mvc;
    using System.Web.Optimization;
    using System.Web.Routing;
    using HealthCare.Core.Common;
    using HealthCare.Portal.HelperClasses;
    using Microsoft.Azure.KeyVault;
    using System.Configuration;

    /// <summary>
    /// MVC Application class.
    /// </summary>
    /// <seealso cref="System.Web.HttpApplication" />
    public class MvcApplication : System.Web.HttpApplication
    {
        /// <summary>
        /// Applications the start.
        /// </summary>
        protected void Application_Start()
        {
            // Clearing all the defualt view engines and adding only Razor View Engine
            ViewEngines.Engines.Clear();
            ViewEngines.Engines.Add(new RazorViewEngine());
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            ControllerBuilder.Current.DefaultNamespaces.Add("HealthCare.Portal.Controllers");
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AntiForgeryConfig.UniqueClaimTypeIdentifier = System.IdentityModel.Claims.ClaimTypes.Name;
            AntiForgeryConfig.SuppressXFrameOptionsHeader = true;
            //Turn OFF the KeyVault for Development environment if required but not recommended in PRODUCTION
            if (
                string.CompareOrdinal(ConfigurationManager.AppSettings["IsKeyVaultEnabled"].ToLower(),
                    "false") == 0)
            {
                KeyVaultHelper.EncryptionKey = ConfigurationManager.AppSettings["EncryptionKey"];
                KeyVaultHelper.EncryptionSalt = ConfigurationManager.AppSettings["EncryptionSalt"];
                KeyVaultHelper.SpoPassword = ConfigurationManager.AppSettings["SpoPassword"];
                CertificateHelper.SpoPassword = KeyVaultHelper.SpoPassword;
            }
            else
            {
                CertificateHelper.GetCert();
                var keyVault =
                    new KeyVaultClient(new KeyVaultClient.AuthenticationCallback(CertificateHelper.GetAccessToken));
                KeyVaultHelper.SpoPassword = keyVault.GetSecretAsync(ConfigurationManager.AppSettings["KeyVaultBaseUrl"], "SpoPassword").Result.Value;
                KeyVaultHelper.EncryptionKey = keyVault.GetSecretAsync(ConfigurationManager.AppSettings["KeyVaultBaseUrl"], "EncryptionKey").Result.Value;
                KeyVaultHelper.EncryptionSalt = keyVault.GetSecretAsync(ConfigurationManager.AppSettings["KeyVaultBaseUrl"], "EncryptionSalt").Result.Value;
                CertificateHelper.SpoPassword = KeyVaultHelper.SpoPassword;
            }

            // set the application insights as per environment
            Microsoft.ApplicationInsights.Extensibility.TelemetryConfiguration.Active.InstrumentationKey = WebConfigurationManager.AppSettings["iKey"];
        }

        /// <summary>
        /// Application_s the end.
        /// </summary>
        protected void Application_End()
        {
            try
            {
                // free up any resources
            }
            catch (Exception ex)
            {
                Trace.TraceError(ex.StackTrace);
            }
        }

        /// <summary>
        /// Handles the Error event of the Application control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">The <see cref="EventArgs"/> instance containing the event data.</param>
        protected void Application_Error(object sender, EventArgs e)
        {
            var ex = Server.GetLastError();
            Trace.TraceError(ex.StackTrace);
        }
    }
}