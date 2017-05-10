/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Web.Infrastructure
{
  using System;
  using System.Web;
  using System.Web.Routing;

  /// <summary>
  /// Single Page Route Constraint
  /// </summary>
  public class SinglePageRouteConstraint : IRouteConstraint
  {
    private readonly Func<Uri, bool> _predicate;

    /// <summary>
    /// Initializes a new instance of the <see cref="SinglePageRouteConstraint" /> class.
    /// </summary>
    /// <param name="predicate">The predicate.</param>
    public SinglePageRouteConstraint(Func<Uri, bool> predicate)
    {
      this._predicate = predicate;
    }

    /// <summary>
    /// Matches the specified HTTP context.
    /// </summary>
    /// <param name="httpContext">The HTTP context.</param>
    /// <param name="route">The route.</param>
    /// <param name="parameterName">Name of the parameter.</param>
    /// <param name="values">The values.</param>
    /// <param name="routeDirection">The route direction.</param>
    /// <returns></returns>
    public bool Match(HttpContextBase httpContext, Route route, string parameterName,
          RouteValueDictionary values, RouteDirection routeDirection)
    {
      return this._predicate(httpContext.Request.Url);
    }
  }
}