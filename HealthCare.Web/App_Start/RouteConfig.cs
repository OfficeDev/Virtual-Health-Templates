/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Web
{
  using System;
  using System.Web.Mvc;
  using System.Web.Routing;
  using HealthCare.Web.Infrastructure;

  /// <summary>
  /// Route Config
  /// </summary>
  public class RouteConfig
  {
    /// <summary>
    /// Registers the routes.
    /// </summary>
    /// <param name="routes">The routes.</param>
    public static void RegisterRoutes(RouteCollection routes)
    {
      routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

      routes.MapRoute(
          name: "Default",
          url: "{controller}/{action}/{id}",
          defaults: new { controller = "HealthCare", action = "Index", id = UrlParameter.Optional },
          constraints: new
          {
            serverRoute = new SinglePageRouteConstraint(url => url.PathAndQuery.StartsWith("/healthcare", StringComparison.InvariantCultureIgnoreCase))
          },
          namespaces: new[] { "HealthCare.Web.Controllers" });

      routes.MapRoute(
               name: "DefaultAll",
               url: "{*url}",
               defaults: new { controller = "HealthCare", action = "Index", id = UrlParameter.Optional });
    }
  }
}
