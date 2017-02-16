/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Core.Common
{
    using System.IO;
    using System.Net;

    /// <summary>
    /// Utility Helper class
    /// </summary>
    public static class UtilityHelper
    {
        /// <summary>
        /// Creates the request.
        /// </summary>
        /// <param name="uri">The URI.</param>
        /// <param name="method">The method.</param>
        /// <param name="accessToken">The access token.</param>
        /// <param name="json">The java script notation.</param>
        /// <param name="contentType">Type of the content.</param>
        /// <returns>Web request</returns>
        public static HttpWebRequest CreateRequest(string uri, string method, string accessToken, string json,
            string contentType)
        {
            HttpWebRequest request = WebRequest.Create(uri) as HttpWebRequest;
            if (request != null)
            {
                request.KeepAlive = true;
                request.Method = method;
                request.ContentType = contentType;
                if (!string.IsNullOrEmpty(accessToken))
                {
                    request.Headers.Add("Authorization", string.Format("Bearer {0}", accessToken));
                }

                if (!string.IsNullOrEmpty(json))
                {
                    request.ContentLength = json.Length;
                    using (var streamWriter = new StreamWriter(request.GetRequestStream()))
                    {
                        streamWriter.Write(json);
                        streamWriter.Flush();
                    }
                }
                else
                {
                    request.ContentLength = 0;
                }
            }

            return request;
        }


    /// <summary>
        /// Gets the response.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <returns>String value of the request</returns>
        public static string GetResponse(HttpWebRequest request)
        {
            string response = null;
            using (HttpWebResponse httpResponse = request.GetResponse() as HttpWebResponse)
            {
                ////Get StreamReader that holds the response stream
                if (httpResponse != null)
                    using (StreamReader reader = new StreamReader(httpResponse.GetResponseStream()))
                    {
                        response = reader.ReadToEnd();
                    }
            }

            return response;
        }
    }
}
