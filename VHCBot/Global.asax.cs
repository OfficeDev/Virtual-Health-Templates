using System.Configuration;
using System.Web.Http;
using HealthCare.Core.Common;
using HealthCare.Core.Helper;
using Microsoft.Azure.KeyVault;

namespace Bot_Application
{
    public class WebApiApplication1 : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
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
            KeyVaultHelper.EncryptionKey = ConfigurationManager.AppSettings["EncryptionKey"];
            KeyVaultHelper.EncryptionSalt = ConfigurationManager.AppSettings["EncryptionSalt"];
            KeyVaultHelper.SpoPassword = ConfigurationManager.AppSettings["SpoPassword"];
            CertificateHelper.SpoPassword = KeyVaultHelper.SpoPassword;
        }
    }
}