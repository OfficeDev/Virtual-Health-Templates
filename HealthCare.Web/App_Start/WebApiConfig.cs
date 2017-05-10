/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Web
{
  using System.Web.Http;

  /// <summary>
  /// Web API Config
  /// </summary>
  public static class WebApiConfig
  {
    /// <summary>
    /// Registers the specified configuration.
    /// </summary>
    /// <param name="config">The configuration.</param>
    public static void Register(HttpConfiguration config)
    {
      config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.LocalOnly;

      // Web API routes
      config.MapHttpAttributeRoutes();

      config.Routes.MapHttpRoute(
          name: "DefaultApi",
          routeTemplate: "api/{controller}/{id}",
          defaults: new { controller = "Meeting", id = RouteParameter.Optional });
    }
  }
}
