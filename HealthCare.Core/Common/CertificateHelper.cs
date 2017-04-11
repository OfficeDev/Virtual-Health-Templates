/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Core.Common
{
    using System;
    using System.Configuration;
    using System.Security.Cryptography.X509Certificates;
    using System.Threading.Tasks;
    using System.Web.Configuration;
    using Microsoft.Azure.KeyVault;
    using Microsoft.IdentityModel.Clients.ActiveDirectory;

    /// <summary>
    /// This helper class provides all the methods required for key vault certificate i.e. to find certificate by thumbprint etc...
    /// </summary>
    public static class CertificateHelper
    {
        /// <summary>
        /// The SPO password
        /// </summary>
        private static string _spoPassword;

        /// <summary>
        /// Gets or sets the SPO Password.
        /// </summary>
        /// <value>
        /// The encrypt secret.
        /// </value>
        public static string SpoPassword
        {
            get
            {
                if (!string.IsNullOrEmpty(_spoPassword))
                {
                    return _spoPassword;
                }

                GetCert();
                var keyVault =
                    // ReSharper disable once RedundantDelegateCreation
                    new KeyVaultClient(new KeyVaultClient.AuthenticationCallback(GetAccessToken));
                _spoPassword = keyVault.GetSecretAsync(ConfigurationManager.AppSettings["KeyVaultBaseUrl"], "SpoPassword").Result.Value;
                return _spoPassword;
            }

            set
            {
                _spoPassword = value;
            }
        }

        /// <summary>
        /// Gets or sets the assertion cert.
        /// </summary>
        /// <value>
        /// The assertion cert.
        /// </value>
        public static ClientAssertionCertificate AssertionCert { get; set; }

        /// <summary>
        /// Finds the certificate by thumb print.
        /// </summary>
        /// <param name="certificateThumbprint">The certificate thumbprint.</param>
        /// <returns>certificate for key vault</returns>
        /// <exception cref="System.ArgumentNullException">certificate Thumb print</exception>
        /// <exception cref="System.Exception">throws exception</exception>
        public static X509Certificate2 FindCertificateByThumbprint(string certificateThumbprint)
        {
            if (certificateThumbprint == null)
            {
                throw new ArgumentNullException(nameof(certificateThumbprint));
            }

            try
            {
                foreach (StoreLocation storeLocation in (StoreLocation[])
               Enum.GetValues(typeof(StoreLocation)))
                {
                    foreach (StoreName storeName in (StoreName[])
                        Enum.GetValues(typeof(StoreName)))
                    {
                        X509Store store = new X509Store(storeName, storeLocation);

                        store.Open(OpenFlags.ReadOnly);
                        X509Certificate2Collection col = store.Certificates.Find(X509FindType.FindByThumbprint, certificateThumbprint, false); // Don't validate certs, since the test root isn't installed.
                                                                                                                                               // ReSharper disable once ConditionIsAlwaysTrueOrFalse
                        if (col != null && col.Count != 0)
                        {
                            foreach (X509Certificate2 cert in col)
                            {
                                if (cert.HasPrivateKey)
                                {
                                    store.Close();
                                    return cert;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw new Exception(
                $"Could not find the certificate with thumbprint {certificateThumbprint} in any certificate store.");
            }

            return null;
        }

        /// <summary>
        /// Gets the access token.
        /// </summary>
        /// <param name="authority">The authority.</param>
        /// <param name="resource">The resource.</param>
        /// <param name="scope">The scope.</param>
        /// <returns>access token</returns>
        public static async Task<string> GetAccessToken(string authority, string resource, string scope)
        {
            var context = new AuthenticationContext(authority, TokenCache.DefaultShared);
            var result = await context.AcquireTokenAsync(resource, AssertionCert);
            return result.AccessToken;
        }

        /// <summary>
        /// Gets the cert.
        /// </summary>
        public static void GetCert()
        {
            var clientAssertionCertPfx = FindCertificateByThumbprint(ConfigurationManager.AppSettings["Thumbprint"]);
            AssertionCert = new ClientAssertionCertificate(
                ConfigurationManager.AppSettings["ClientId"],
                clientAssertionCertPfx);
        }
    }
}