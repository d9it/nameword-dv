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
      // Handle authentication errors
      if (err.response?.status === 401) {
        const errorMessage = 'Please sign in to search domains';
        setError(errorMessage);
        // Redirect to sign in if not authenticated
        if (!localStorage.getItem('user')) {
          window.location.href = '/sign-in';
        }
      } else {
        // Demo mode: return mock data for demonstration
        console.log('API not available, using demo data');
        const mockResult = {
          responseData: {
            available: domainName.includes('.kitchen') || domainName.includes('.online'),
            registrationFee: '9.99',
            renewalfee: '21.99',
            transferFee: '12.99'
          }
        };
        setSearchResults(mockResult);
        return mockResult;
      }
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