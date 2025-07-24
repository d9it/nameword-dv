import { useState, useCallback } from 'react';
import { domainAPI } from '../api/domains';

export const useDomainSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const getSuggestions = useCallback(async (keyword, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { keyword, limit };
      const result = await domainAPI.getSuggestions(params);
      const suggestionList = result.registryDomainSuggestionList || [];
      setSuggestions(suggestionList);
      return suggestionList;
    } catch (err) {
      // Handle authentication errors
      if (err.response?.status === 401) {
        const errorMessage = 'Please sign in to get domain suggestions';
        setError(errorMessage);
        setSuggestions([]);
        // Redirect to sign in if not authenticated
        if (!localStorage.getItem('user')) {
          window.location.href = '/sign-in';
        }
      } else {
        // Demo mode: return mock suggestions
        console.log('API not available, using demo suggestions');
        const mockSuggestions = [
          { domainName: `${keyword}.com` },
          { domainName: `${keyword}.net` },
          { domainName: `${keyword}.org` },
          { domainName: `${keyword}.online` },
          { domainName: `${keyword}.store` }
        ];
        setSuggestions(mockSuggestions);
        return mockSuggestions;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    getSuggestions,
    suggestions,
    loading,
    error,
    clearSuggestions,
  };
}; 