import { useState, useCallback } from 'react';
import { domainAPI } from '../api/domains';

export const useDomainSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const searchDomain = useCallback(async (domainName, feePercentages = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        websiteName: domainName,
        renewalFeePerc: feePercentages.renewal || 50,
        transferFeePerc: feePercentages.transfer || 50,
        registrationFeePerc: feePercentages.registration || 50,
      };
      
      const result = await domainAPI.searchDomain(params);
      setSearchResults(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Domain search failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  return {
    searchDomain,
    searchResults,
    loading,
    error,
    clearResults,
  };
}; 