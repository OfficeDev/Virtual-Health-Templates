![](media/75818f144b07db5af377978bef2bbff0.png)

1.  Introduction

This document provides a detailed walkthrough of steps required to deploy
Virtual Health. The deployment guide explains the deployment of following
components.

| Component Name        | Component Description  | Component Type  |
|-----------------------|------------------------|-----------------|
| **HealthCare.Portal** | Virtual Health Web App | Web App         |
| **SharePoint assets** | SharePoint artifacts   | SharePoint Site |
| **VHCBot**            | Virtual Health Web App | Web App         |

1.  System Requirments

    1.  Office 365 Plan Requirements

It is recommended to use Office 365 Enterprise E3 and above

E3 Plan details are available here
<https://products.office.com/en-us/business/office-365-enterprise-e3-business-software>

Other plans:

<http://office.microsoft.com/en-us/business/compare-all-office-365-for-business-plans-FX104051403.aspx>

1.  Azure Subscription

Virtual health requires Azure subscription to host following services

-   Website/Web App

-   Application Insight

-   Key vault

-   Azure table

    1.  Minimum Azure Web App Configuration

Virtual Health web apps need at least Standard configuration to cater the needs
of pilot. However it can be scaled out as per the application need.

| Configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Details                                                                                                                                                                            |         |                         |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|-------------------------|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mode – Standard Instances – A single instance in Shared or Standard mode already benefits from high availability, but you can provide even greater throughput and fault tolerance by running additional web site instances. In Standard mode, you can choose from 1 through 10 instances, and if you enable the Auto scale feature, you can set the minimum and maximum number of virtual machines to be used for automatic scaling. <http://www.windowsazure.com/en-us/documentation/articles/web-sites-scale/> | Web Sites Standard (Promotional Pricing): The Standard tier offers multiple instance sizes as well as scaling to meet changing capacity needs. Prices for Standard are as follows: |         |                         |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| SIZE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | CPU CORES                                                                                                                                                                          | MEMORY  | PRICE PER HOUR          |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| Small                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 1                                                                                                                                                                                  | 1.75 GB | \$0.10                  |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                    |         | (\~\$74 / month)        |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| Medium                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 2                                                                                                                                                                                  | 3.5 GB  | \$0.20                  |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                    |         | (\~\$149 / month)       |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| Large                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 4                                                                                                                                                                                  | 7 GB    | \$0.40                  |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                    |         | (\~\$298 / month)       |   |   |   |   |   |   |   |   |   |   |   |   |   |   |

**Note**: Refer to the below link to know more about the pricing models:
<http://www.windowsazure.com/en-us/pricing/details/web-sites/>

1.  Software Requirments

Since the services will be deployed in Azure PaaS, hence there is no separate
software requirements

1.  Prerequisites

The following prerquisites are important for the virtual health application

| Office 365                   | Details                                                                                                                                                                                                                                              |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Plan                         | Purchase Office 365 Enterprise E3 plan: <https://products.office.com/en-us/business/office-365-enterprise-e3-business-software> Other plans: <http://office.microsoft.com/en-us/business/compare-all-office-365-for-business-plans-FX104051403.aspx> |
| Domain(Optional)             | Domain for Office 365 *This is optional for Virtual Health Deployment*                                                                                                                                                                               |
| Site Collection              | Provision a site collection for Virtual Health. Preferably Publishing site                                                                                                                                                                           |
| Azure                        | Details                                                                                                                                                                                                                                              |
| Azure Subscription           | Azure subscriptions will host following services                                                                                                                                                                                                     |
| SSL certificate              | SSL certificates are required for azure web sites and key vaults. It is recommended to have two CA issues SSL certificates for the domain CA issued certificates are required for Trusted Application Endpoint configuration and deployment          |
| Active Directory Integration | Setup and synchronize existing Organization Active Directory on O365 portal <http://technet.microsoft.com/en-us/library/hh967642>                                                                                                                    |
| Domain (Optional)            | Domain for azure website                                                                                                                                                                                                                             |
| Azure Websites               | Provision Azure website for the Virtual Office Solution                                                                                                                                                                                              |
| Application Insights         | Provision Application insights for the Virtual Office Solution                                                                                                                                                                                       |
| Key Vault                    | Provision a key vault for the Virtual Office Solution. This is optional                                                                                                                                                                              |
| User Account                 | User should have access to provision and configure services in the Azure PaaS and also should be site collection Administrator                                                                                                                       |
| Trusted Application Endpoint | This application must be deployed as cloud service before the deployment of Virtual Health. For further details go to link [**TBD**]                                                                                                                 |

-   Website/Web App

-   Application Insight

-   Key vault

-   Azure table

-   Azure Subscription Admin or similar Role

-   Office 365 Site Collection Administrator

1.  Certificates Required for Deployment

Certificates required for deployment are given in the below table

| Certificate Type         | Application                         | Purpose                                                                                                           |
|--------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| Self-signed or CA issued | Trusted Application Endpoints       | This certificate will be used to setup the OAuth with Azure AD application in section 4.7.2                       |
| CA issued                | Trusted Application – Cloud Service | This certificate will be required to configure the https endpoint for Cloud Service                               |
| Self-Sign or CA Issues   | Key Vault Application               | This certificate will be used to setup Key Vault application access. This certificate will be used in section 4.5 |

1.  Single time configuration

This section will provide steps to configure any new environment for the first
time. This step is not required once the new environment is setup.

Open a notepad or xml notepad to note down the configuration values as you go
through this section. These configurations will be used during the deployment of
the Web Apps

1.  SharePoint Site Collection Provisioning

This section describes the steps required to provision a SharePoint site
collection

1.  Provision SharePoint site collection

    1.  Sign in to the Office 365 admin center with your SharePoint Online admin
        user name and password

    2.  Go to Admin \> SharePoint

    3.  Click on site collection tab

    4.  Contribute New Private Site Collection

        ![](media/7eca9459ee4901f5ce04a2e09c27a7db.png)

    5.  Click on Private Site Collection

    6.  Fill in the details as shown below

        ![](media/9d7d88101b13eba42541d49e33473b87.png)

    7.  Click Ok

    8.  Note down the site collection url in below format

\<add key="SharepointSite" value="SITE\_COLLECTION\_URL" /\>

1.  SharePoint Configurations

Create a SharePoint Group and Add the people to the group who will have access
to the settings page of the Virtual Health solution

-   Open the site collection

-   Go to site settings Peoples and Group

-   Click on More

-   Click on New

-   Fill in the details like Name as “VirtualPatientCare Admin” and select group
    permission as contribute

    ![](media/7d9222ad0d96d312c5fbbe5e7ce2c32e.png)

-   Click Save

-   Note down the SharePoint Group Name in below format

\<add key="SharepointAdminGroup" value="SHAREPOINT\_GROUP\_NAME" /\>

1.  Azure Web Apps Provisioning

Virtual Health solution has following web apps

-   HealthCare.Portal

-   VHCBot

All the above web apps can be provisioned using below steps (steps only
explaining for HealthCare.Portal web app)

1.  Steps to provision an azure website

2.  Login to [Azure](https://portal.azure.com/) management portal

3.  Select Web Apps and click on Add button

    ![](media/49697f1087718518230d115b0f630fd2.png)

4.  Enter name for web app and appropriate subscription Resource group and App
    Service plan as shown below

    ![](media/3c533ef6365ea43a33206cf0eccfcc19.png)

5.  Click on create button at the bottom of the panel

    **Note**: *You should select the App Service Location closest to your users.
    This will help in reducing network latency and potentially provide better
    experience for users. App Service Location (in above example Southeast Asia)
    will be used to automatically create other services in the same location (in
    above example it will be Southeast Asia) so that all required objects are
    co-located.*

6.  Steps to configure Application Insights

    1.  While creating the website if you mark the option “Applications
        Insights” to **ON ,** it will be provisioned

    2.  Note down the application insight key

7.  Website – Scaling

    1.  If you want to change the scaling of the website you can scale as per
        pre-requisite section

Note down the following values from this section

\<add key="ida:HealthCarePortal" value="HEALTH\_CARE\_PORTAL\_URL /\>

\<add key="iKey" value="APP\_INSIGHT\_KEY\_HEALTH\_CARE\_PORTAL" /\>

BOT\_WEBSITE\_URL = <https://xxxx.azurewebsites.net> [It will be used in BOT
Configuration Section]

1.  Bot Configuration

Register a Bot

-   Go to <https://dev.botframework.com>

-   Click on Register a bot

-   Add the following details

    -   Name: display name

    -   Bot handle: unique ID, not used elsewhere

    -   Messaging endpoint: HTTPS endpoint used by the bot framework; if Azure
        Bot Web App deployment is on *https://x.azurewebsites.net* then this
        will be <https://x.azurewebsites.net/api/messages>

>   [./media/image9.png](./media/image9.png)

-   Click “Create Microsoft App ID and Password”

-   It will generate App Id and password and make a note of it and you need to
    update same in web.config file of Bot Project

-   Click on Register to register the bot

-   Note down the configurations values in below format

>   \<add key="BotId" value="BOT\_ID" /\>

>   \<add key="MicrosoftAppId" value="BOT\_APP\_ID" /\>

>   \<add key="MicrosoftAppPassword" value="BOT\_APP\_PASSWORD" /\>

To get the Bot embed code, follow the below steps (Execute this step after
execution of 5.5)

-   Go to <https://dev.botframework.com> after registering the Bot

-   Click on My Bots

-   Click on the Bot created for the Virtual Health

-   Click on the “Get bot embed codes”

-   Copy the embed code as it will be required to be updated in Web.Config file
    of HealthCare.Portal web project.

-   Note down the configuration value in below format

    ![](media/de00c2f582d168fbe36e1a0000a6ee3b.png)

\<add key="botUrlEmbed" value="BOT\_EMBED\_URL" /\>

1.  Key Vault Provisioning

Key Vault Provisioning and Configuration

>   *Note\*:* User should have access to

-   Create an active directory application using PowerShell

-   Asssign the service principal to an azure active directory application.

1.  Key Vault Provisioning

    1.  Login to [Azure](https://portal.azure.com/) management portal

    2.  Click on New (+) on left navigation Panel

    3.  Search for Key Vault

        ![](media/e57d3e9125ab654205b3b5cdf164347e.png)

    4.  Click on Key Vaults

    5.  Click on Add

    6.  Fill in the details as shown below

        ![](media/8b0bcd9c49c8f1fb8f6b37400c617bad.png)

    7.  Click Create

    8.  Once it is provisioned, open the Key Vault

    9.  Click on Secrets

    10. Click Add and fill the values like below

        ![](media/66f99e59ff03ced99a1f5d30ad592c6d.png)

    11. Click Create

    12. Add another secret with Name “SpoPassword”

    13. Note down the Key Vault Base URL in below format

\<add key="KeyVaultBaseUrl" value="KEY\_VAULT\_BASE\_URL"/\>

1.  Configure Azure AD application for Key Vault and associate certificate

    1.  Get the certificate for the Key Vault

    2.  Open the PowerShell command as Administrator

    3.  Login to tenant with account which has permission to create application
        in azure AD and creates service principal

        ![](media/49857d12fcc124176ac9aa8af8126af7.png)

    4.  Run the following PowerShell after updating the yellow highlighted below

        It does create following items

-   Creates the AD application with the certificate

-   Create service principal

-   Assign reader role to the service principal

    "C:\\data\\KVWebApp.cer" – Path of the certificate file

    \$x509 = New-Object
    System.Security.Cryptography.X509Certificates.X509Certificate2

    \$x509.Import("C:\\data\\KVWebApp.cer")

    \$keyValue = [System.Convert]::ToBase64String(\$x509.GetRawCertData())

>   \$app = New-AzureRmADApplication -DisplayName "exampleapp" -HomePage
>   "https://www.contoso.org" -IdentifierUris "https://www.contoso.org/example"
>   -CertValue \$keyValue -EndDate \$cert.NotAfter -StartDate \$cert.NotBefore

New-AzureRmADServicePrincipal -ApplicationId \$app.ApplicationId

New-AzureRmRoleAssignment -RoleDefinitionName Reader -ServicePrincipalName
\$app.ApplicationId

\$app

\$x509.Thumbprint

Refer to this link for more details
<https://docs.microsoft.com/en-in/azure/azure-resource-manager/resource-group-authenticate-service-principal>

1.  Note down the thump print and application Id as it will be used in
    web.config of the HealthCare.Portal application

\<add key="ClientId" value="AZURE\_AD\_APPLICATION\_ID" /\>

\<add key="Thumbprint" value="THUMB\_PRINT\_CERTIFICATE" /\>

1.  Azure AD application Configuration

Provision Azure AD applications

1.  Login to [Classic Azure Management Portal](https://manage.windowsazure.com/)
    with Azure Admin Account

2.  Click on the Active Directory link on the left menu

3.  Select the Active Directory

4.  Click on Applications tab

5.  Then click on Add link at bottom

6.  It will pop up a window, select “Add an application my organization is
    developing”

7.  Provision Azure Application for HealthCare Portal

    1.  Select “Web Application AND/OR Web API” option

    2.  Provide name “HealthcarePortal”

        ![](media/064e4c65054950e276ee88198b565356.png)

    3.  Click next

    4.  Enter sign-ON and APP ID URL as valid URL e.g. Azure Portal Web App
        provisioned in above steps as shown below

        ![](media/57dfe5fa14d96f42c3ca93cf037bbe08.png)

    5.  Click Ok

    6.  Click on the created application

    7.  Then navigate to Configure tab

    8.  Go to key’s section, add a key and save the application settings by
        clicking save

    9.  It will generate a secret against key, **make a note of it**

    10. **Make a note of client Id**

    11. Now go to single sign-on section and add reply URL as per application
        URL i.e. HealthCare.Portal URL

    12. Go to permissions to other applications

    13. Click on Add application

    14. Select Skype for business online and click ok

    15. Select the delegated permissions as shown in the below picture

    16. Click on save to save the application settings

    17. **Note down the application secrect from keys sections**

\<add key="ida:ClientId"
value="CLIENT\_ID\_AZURE\_AD\_APP\_HEALTH\_CARE\_PORTAL" /\>

\<add key="ida:ClientSecret"
value="CLIENT\_PWD\_AZURE\_AD\_APP\_HEALTH\_CARE\_PORTAL " /\>

1.  Provision Azure AD application for Native Application

    1.  Execute step 1-6 in this section

    2.  Select “Native Client Application”

    3.  And Provide name

        ![](media/4a5c8b54bd9eab8a2c69981b7d31040c.png)

    4.  Click Ok

    5.  Enter Redirect URI <http://healthcarenativeclient> and click Ok

        ![](media/6c0f19c56b028edec60a96ccf0fd9dfb.png)

    6.  Click on the native client application created

    7.  Go to configure tab

    8.  Note down **Client Id**

    9.  Go to **“permissions to other applications”** section

    10. Click on **Add Application**

    11. Select **Skype for Business Online and Microsoft Graph** and Click Ok

    12. Provide following delegate permission to **Skype for Business Online**

        ![](media/03981672232057d58ab2bd6fad022819.png)

    13. Provide following delegate permission to **Microsoft Graph**

    14. Provide following delegated permission to **Windows Azure Active
        Directory**

    15. Click Save

    16. Note down the **Client ID** in below format

\<add key="ida:NativeAppClientId" value="NATIVE\_APP\_CLIENT\_ID" /\>

1.  Azure Web App Configurations

The following configuration is required on the HealthCare.Portal Web App

1.  Add the certificate to Web App

    1.  Click on App Services available in Left Navigation of Azure Portal

    2.  Click on the Web App

    3.  Then Click on SSL Certificates

    4.  Then click upload certificate

    5.  Select \*.pfx file and enter the password for the PFX file

        ![](media/f4fbb027195228fa1329566c17316210.png)

    6.  Click Upload

2.  Add the Key to Azure Web App

    1.  To load the certificate, add the following entry in azure web app

    2.  Click on the Application Settings

    3.  Scroll down and look for App Settings section

    4.  Enter WEBSITE\_LOAD\_CERTIFICATES as key and \* as value

    5.  Then save the setting.

    6.  Other Configurations

This section will list down other configurations elements that needs to be
captured before deploying the Web Apps.

\<add key="ida:AuthorizationUri" value="https://login.microsoftonline.com" /\>

\<add key="ida:AADInstance" value="https://login.microsoftonline.com" /\>

\<add key="ida:Domain" value="O365\_DOMAIN" /\>

\<add key="ida:TenantId" value="TENANT\_ID" /\>

\<add key="ida:UserName" value="USER\_NAME" /\>

\<add key="SPOUserName" value="SPO\_USER\_NAME" /\>

\<add key="ida:PostLogoutRedirectUri" value="HEALTH\_CARE\_PORTAL\_URL" /\>

\<add key="ida:MeetingSubject" value="MEETING\_SUBJECT" /\>

\<add key="TrustedApi" value="TRUSTED\_API\_URL" /\>

\<add key="MobileSiteUri" value="MOBILE\_SITE\_URL"/\>

\<add key="DemoUserId" value="O365\_USER\_ID"/\>

\<add key="EmailServer" value="smtp.office365.com"/\>

1.  Azure Web Apps Deployment (Continuos)

    1.  Updated Config files

-   Open the HealthCarePortal.Sln file in Visual Studio 2015

-   Make sure that all the projects load successfully

    1.  Update VHCBot Config File

-   Open Web.Config file

-   Update the following values

\<add key="BotId" value="BOT\_ID" /\>

\<add key="MicrosoftAppId" value=" BOT\_APP\_ID" /\>

\<add key="MicrosoftAppPassword" value="BOT\_APP\_PASSWORD" /\>

\<add key="ida:HealthCarePortal" value="HEALTH\_CARE\_PORTAL\_URL"/\>

\<add key="ida:UserName" value="O365\_USER\_NAME" /\>

-   Save the file and close it

    1.  Update HealthCare Config File

-   Open Web.Config file

>   Update the following values with values captured in above section (user your
>   notepad or xml notepad)

\<add key="ida:ClientId"
value="CLIENT\_ID\_AZURE\_AD\_APP\_HEALTH\_CARE\_PORTAL" /\>

\<add key="ida:ClientSecret"
value="CLIENT\_PWD\_AZURE\_AD\_APP\_HEALTH\_CARE\_PORTAL" /\>

\<add key="ida:Domain" value="O365\_DOMAIN" /\>

\<add key="ida:TenantId" value="TENANT\_ID" /\>

\<add key="ida:NativeAppClientId" value="NATIVE\_APP\_CLIENT\_ID" /\>

\<add key="ida:UserName" value="USER\_NAME" /\>

\<add key="SharepointSite" value="SHAREPOINT\_SITE\_URL" /\>

\<add key="SPOUserName" value="SPO\_USER\_NAME" /\>

\<add key="ida:PostLogoutRedirectUri" value="HEALTH\_CARE\_PORTAL\_URL/" /\>

\<add key="ida:MeetingSubject" value="MEETING\_SUBJECT" /\>

\<add key="ida:HealthCarePortal" value="HEALTH\_CARE\_PORTAL\_URL" /\>

\<add key="KeyVaultBaseUrl" value="KEY\_VAULT\_BASE\_URL"/\>

\<add key="ClientId" value="AZURE\_AD\_APPLICATION\_ID" /\>

\<add key="Thumbprint" value="THUMB\_PRINT\_CERTIFICATE" /\>

\<add key="TrustedApi" value="TRUSTED\_API\_URL" /\>

\<add key="iKey" value="HEALTH\_CARE\_PORTAL\_APP\_INSIGHT\_KEY" /\>

\<add key="botUrlEmbed" value="BOT\_URL\_EMBED" /\>

\<add key="MobileSiteUri" value="MOBILE\_SITE\_URL"/\>

\<add key="DemoUserId" value="O365\_USER\_ID"/\>

\<add key="EmailServer" value="smtp.office365.com"/\>

\<add key="SharepointAdminGroup" value="SHAREPOINT\_GROUP\_NAME"/\>

-   Save the file and close it

    1.  Update Deployment Tool Config file

Follow the below steps to update thd config file of deployment tool

1.  Open **DeploymentTool.exe.config** file

2.  Update the appsettings values as per environment

    Pathe of

>   \<add key="basePath" value="SHAREPOINT\_SITE\_URL"/\>

>   \<add key="username" value="SPO\_USER\_NAME"/\>

>   \<add key="password" value="SPO\_USER\_PASSWORD"/\>

1.  Save it

    1.  SharePoint Deployment

Deploy the SharePoint artefacts using below steps

-   Download the Deployment Tool [GIT URL]

-   The folder would contain following file

    ![](media/e3b29fa172ef5dbb30d48a645bef154f.png)

    ![](media/9178086eed70fb4c2652a3f13c528dd0.png)

-   Double click DeploymentTool.exe

-   Select Option 6

-   Wait for PowerShell to complete the operation

    1.  Virtual Health Deployment

There are multiple ways to deploy a Web App in Azure. This section talks about
Visual Studio Web Deploy publishing.

In **Solution Explorer**, right-click the project (HealthCare.Portal), and
choose **Publish**.

>   [./media/image27.png](./media/image27.png)

>   In a few seconds, the **Publish Web** wizard appears. The wizard opens to a
>   *publish profile* that has settings for deploying the web project to the new
>   web app.

Tip

The publish profile includes a user name and password for deployment. These
credentials have been generated for you, and you don't have to enter them. The
password is encrypted in a hidden user-specific file in the
Properties\\PublishProfiles folder.

1.  On the **Connection** tab of the **Publish Web** wizard, click **Next**.

>   [./media/image28.png](./media/image28.png)

>   Click Next on Connection tab of Publish Web wizard

>   Next is the **Settings** tab. Here you can change the build configuration to
>   deploy a debug build for [remote
>   debugging](https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-dotnet-troubleshoot-visual-studio#remotedebug).
>   The tab also offers several [File Publish
>   Options](https://msdn.microsoft.com/library/dd465337.aspx#Anchor_2).

1.  On the **Settings** tab, click **Next**.

>   [./media/image29.png](./media/image29.png)

>   Settings tab of Publish Web wizard

>   The **Preview** tab is next. Here you have an opportunity to see what files
>   are going to be copied from your project to the API app. When you're
>   deploying a project to an API app that you already deployed to earlier, only
>   changed files are copied. If you want to see a list of what will be copied,
>   you can click the **Start Preview** button.

1.  On the **Preview** tab, click **Publish**.

>   [./media/image30.png](./media/image30.png)

>   Preview tab of Publish Web wizard

>   When you click **Publish**, Visual Studio begins the process of copying the
>   files to the Azure server. This may take a minute or two.

>   The **Output** and **Azure App Service Activity** windows show what
>   deployment actions were taken and report successful completion of the
>   deployment.

>   [./media/image31.png](./media/image31.png)

>   Visual Studio Output window reporting successful deployment

>   Upon successful deployment, the default browser automatically opens to the
>   URL of the deployed web app, and the application that you created is now
>   running in the cloud. The URL in the browser address bar shows that the web
>   app is loaded from the Internet.

>   For more detail visit
>   <https://docs.microsoft.com/en-us/azure/app-service-web/web-sites-dotnet-get-started>

1.  VHC Bot Web App Deployment

Follow the same step as given in Section 5.3 HealthCare.Portal deployment

1.  Post Deployment Configuration

2.  BotUrlEmbed in Web.Config file of HealthCare.Portal

-   Go to section 4.4 and Get Url Embed code steps, follow the steps to get the
    Url Embed Code

-   Note down the BotUrlEmbed

-   Update the Web.Config of HealthCare.Portal with above value

-   Republish the HealthCare.Portal project again using Visual Studio

    1.  Generate the Meeting Slots

You can generate the meeting slots using following steps

-   Open the SharePoint Site Collection created in section 4.1

-   Login as site collection administrator

-   Go to **Settings Site Contents**

-   Click on “**Available Dates**” list

-   On botton left corner, there will be a link to change to classic view, click
    on “**Return to classic SharePoint**”

-   Click on **Items** tab and then click on **Generate Appointments**

    ![](media/ecf86a064d83c232ae586dd2d12489b4.png)

-   Fill in the details as shown below (Date and Check Select All CheckBox)

    ![](media/14c217de2858b974c2382fdab6df6c85.png)

-   Click **Create Appointments**

-   System will show below messagex

    ![](media/1931d2712f1102e9b8feb9b43c064e5a.png)

1.  Post Deployment Validations

    1.  HealthCare Portal Validation

Validate Home Page is Opening

-   Open the HealthCare Portal Web App

-   Login as Active O365 Tenant user

-   Home page should look like below (Since there is no appointment look like

    ![](media/2a9446ecdaf33e367615e9c466a383d8.png)

Validate Book Meeting

-   Click on Book Meeting link on top navigation

-   Fill in the details

-   Click Submit

-   Dashboard should show the meeting in a grid as shown below

    ![](media/580bb7567c31a615fdc1edf8ac221ec1.png)

Join a Conference as Doctor

-   Home page, Click on the Join as Doctor Link

-   It will open the page in a new tab

-   Wait for the page to load

-   It should look like below

    ![](media/53c634f08f18e473abdd067341e5c465.png)

Join Conference as Patient

-   Go to dashboard

-   Join the copy the URL of the patient link from the meeting which Doctor has
    joined ealier

-   Open a new browser window

-   Paste the URL

-   Wait for the page to load, the patient will wait in lobby

    ![](media/164a6f1dfadc3c345415dbbd226f2b20.png)

-   Go to the doctor window

-   Click on Admit

    ![](media/28d402e199ababc86ce2b5a9b1dcb4a7.png)

-   Meeting starts and doctor window will look like below

    ![](media/d7554f123c1c84edf3c59a056ce66983.png)

-   Go to Patient Window, it will look like below

    ![](media/fe33d67369991a3d3ca332ecbb462302.png)
