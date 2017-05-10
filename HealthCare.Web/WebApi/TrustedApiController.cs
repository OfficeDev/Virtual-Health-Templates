/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

using System.Configuration;

namespace HealthCare.Web.WebApi
{
  using System;
  using System.Web.Http;
  using HealthCare.Core.Common;
  using HealthCare.Core;
  using HealthCare.Web.HelperClasses;
  using Newtonsoft.Json;
  using Newtonsoft.Json.Linq;
  using System.Net;
  using System.Threading.Tasks;
  using HealthCare.Web.Models;

  [RoutePrefix("api/trustedapi")]
  public class TrustedApiController : ApiController
  {
    /// <summary>
    /// Sets the configuration.
    /// </summary>
    /// <returns>
    /// returns string.
    /// </returns>
    [HttpPost]
    [Route("token")]
    public async Task<IHttpActionResult> GetGuestToken(TrustedApiOptions options)
    {
      string jsonResponseString;
      var jsonobject = new JObject
                {
                    {"ApplicationSessionId", options.ApplicationSessionId},
                    {"AllowedOrigins", options.AllowedOrigins},
                    {"MeetingUrl", options.MeetingUrl}
                };

      using (var wc = new WebClient())
      {
        //TODO: We can make this call directly from angular . Check Intend !!
        string trustedApiUri = $"{ConfigurationManager.AppSettings["TrustedApi"]}/GetAnonTokenJob";
        wc.Headers.Add(HttpRequestHeader.Accept, "application/json");
        wc.Headers.Add(HttpRequestHeader.ContentType, "application/json");
        wc.Headers.Add("user-agent", "Other");
        jsonResponseString =
            await wc.UploadStringTaskAsync(new Uri(trustedApiUri), "POST", jsonobject.ToString());
      }
      var result = JsonConvert.DeserializeObject(jsonResponseString);
      return Ok(result);
    }
  }
}