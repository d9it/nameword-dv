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
      const errorMessage = err.response?.data?.message || 'Failed to get suggestions';
      setError(errorMessage);
      setSuggestions([]);
      throw err;
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