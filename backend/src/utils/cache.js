import NodeCache from 'node-cache';

/**
 * Simple in-memory cache
 * Cache TTL: 5 minutes (300 seconds)
 */
class CacheManager {
  constructor(ttl = 300) {
    this.cache = new NodeCache({ stdTTL: ttl, checkperiod: 60 });
  }
  
  /**
   * Generate cache key
   */
  generateKey(query, location, period) {
    return `${query}-${location}-${period}`.toLowerCase().replace(/\s+/g, '-');
  }
  
  /**
   * Get cached data
   */
  get(query, location, period) {
    const key = this.generateKey(query, location, period);
    return this.cache.get(key);
  }
  
  /**
   * Set cache data
   */
  set(query, location, period, data) {
    const key = this.generateKey(query, location, period);
    this.cache.set(key, data);
  }
  
  /**
   * Clear all cache
   */
  clear() {
    this.cache.flushAll();
  }
  
  /**
   * Get cache stats
   */
  getStats() {
    return this.cache.getStats();
  }
}

export default new CacheManager();
