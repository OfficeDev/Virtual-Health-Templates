/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Web.WebApi
{
  using System.Collections.Generic;
  using System.Configuration;
  using System.Linq;
  using System.Web.Http;

  public class ConfigController : ApiController
  {
    public IHttpActionResult Get()
    {
      var configs = new Dictionary<string, string>();

      var clientId = ConfigurationManager.AppSettings["ida:ClientId"];

      configs.Add("ClientId", clientId);

      return Ok(configs.ToList());
    }
  }
}