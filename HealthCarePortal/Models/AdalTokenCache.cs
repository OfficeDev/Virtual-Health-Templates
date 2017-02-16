/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.Models
{
    using System;
    using System.Data.Entity;
    using System.Linq;
    using System.Web.Security;
    using Microsoft.IdentityModel.Clients.ActiveDirectory;

    /// <summary>
    /// ADAL Token cache class.
    /// </summary>
    /// <seealso cref="Microsoft.IdentityModel.Clients.ActiveDirectory.TokenCache" />
    /// <seealso cref="System.IDisposable" />
    public class ADALTokenCache : TokenCache, IDisposable
    {
        /// <summary>
        /// The database
        /// </summary>
        private ApplicationDbContext db = new ApplicationDbContext();

        /// <summary>
        /// The user identifier
        /// </summary>
        private string userId;

        /// <summary>
        /// The cache
        /// </summary>
        private UserTokenCache cache;

        /// <summary>
        /// Initializes a new instance of the <see cref="ADALTokenCache"/> class.
        /// </summary>
        /// <param name="signedInUserId">The signed in user identifier.</param>
        public ADALTokenCache(string signedInUserId)
        {
            //// associate the cache to the current user of the web app
            this.userId = signedInUserId;
            this.AfterAccess = this.AfterAccessNotification;
            this.BeforeAccess = this.BeforeAccessNotification;
            this.BeforeWrite = this.BeforeWriteNotification;
            //// look up the entry in the database
            this.cache = this.db.UserTokenCacheList.FirstOrDefault(c => c.WebUserUniqueId == this.userId);
            //// place the entry in memory
            this.Deserialize((this.cache == null) ? null : MachineKey.Unprotect(this.cache.CacheBits, "ADALCache"));
        }

        /// <summary>
        /// Clears the cache by deleting all the items. Note that if the cache is the default shared cache, clearing it would
        /// impact all the instances of <see cref="T:Microsoft.IdentityModel.Clients.ActiveDirectory.AuthenticationContext" /> which share that cache.
        /// </summary>
        public override void Clear()
        {
            base.Clear();
            var cacheEntry = this.db.UserTokenCacheList.FirstOrDefault(c => c.WebUserUniqueId == this.userId);
            this.db.UserTokenCacheList.Remove(cacheEntry);
            this.db.SaveChanges();
        }

        /// <summary>
        /// Deletes an item from the cache.
        /// </summary>
        /// <param name="item">The item to delete from the cache</param>
        public override void DeleteItem(TokenCacheItem item)
        {
            base.DeleteItem(item);
        }

        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        /// <param name="disposing"><c>true</c> to release both managed and unmanaged resources; <c>false</c> to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                this.db.Dispose();
            }
            //// free native resources if there are any.
        }

        /// <summary>
        /// Before the access notification.
        /// Notification raised before ADAL accesses the cache.
        /// This is your chance to update the in-memory copy from the DB, if the in-memory version is stale
        /// </summary>
        /// <param name="args">The arguments.</param>
        private void BeforeAccessNotification(TokenCacheNotificationArgs args)
        {
            if (this.cache == null)
            {
                //// first time access
                this.cache = this.db.UserTokenCacheList.FirstOrDefault(c => c.WebUserUniqueId == this.userId);
            }
            else
            {
                //// retrieve last write from the DB
                var status = from e in this.db.UserTokenCacheList
                             where (e.WebUserUniqueId == this.userId)
                             select new
                             {
                                 LastWrite = e.LastWrite
                             };

                //// if the in-memory copy is older than the persistent copy
                if (status.First().LastWrite > this.cache.LastWrite)
                {
                    //// read from from storage, update in-memory copy
                    this.cache = this.db.UserTokenCacheList.FirstOrDefault(c => c.WebUserUniqueId == this.userId);
                }
            }

            this.Deserialize((this.cache == null) ? null : MachineKey.Unprotect(this.cache.CacheBits, "ADALCache"));
        }

        /// <summary>
        /// After the access notification.
        /// Notification raised after ADAL accessed the cache.
        /// If the HasStateChanged flag is set, ADAL changed the content of the cache
        /// </summary>
        /// <param name="args">The arguments.</param>
        private void AfterAccessNotification(TokenCacheNotificationArgs args)
        {
            //// if state changed
            if (this.HasStateChanged)
            {
                this.cache = new UserTokenCache
                {
                    WebUserUniqueId = this.userId,
                    CacheBits = MachineKey.Protect(this.Serialize(), "ADALCache"),
                    LastWrite = DateTime.Now
                };

                //// update the DB and the lastwrite 
                this.db.Entry(this.cache).State = this.cache.UserTokenCacheId == 0 ? EntityState.Added : EntityState.Modified;
                this.db.SaveChanges();
                this.HasStateChanged = false;
            }
        }

        /// <summary>
        /// Before the write notification.
        /// </summary>
        /// <param name="args">The arguments.</param>
        private void BeforeWriteNotification(TokenCacheNotificationArgs args)
        {
            // if you want to ensure that no concurrent write take place, use this notification to place a lock on the entry
        }
    }
}
