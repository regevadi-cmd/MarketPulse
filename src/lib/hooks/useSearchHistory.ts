'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult, ProviderName } from '@/types/analysis';

export interface SearchHistoryItem {
  id: string;
  companyName: string;
  provider: ProviderName;
  sentiment: AnalysisResult['sentiment'];
  timestamp: number;
  data: AnalysisResult;
}

const STORAGE_KEY = 'marketpulse_search_history';
const MAX_HISTORY_ITEMS = 50;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
    setLoaded(true);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    }
  }, [history, loaded]);

  const addToHistory = useCallback(
    (companyName: string, provider: ProviderName, data: AnalysisResult) => {
      const newItem: SearchHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyName,
        provider,
        sentiment: data.sentiment,
        timestamp: Date.now(),
        data
      };

      setHistory((prev) => {
        // Remove duplicate company searches (keep latest)
        const filtered = prev.filter(
          (item) => item.companyName.toLowerCase() !== companyName.toLowerCase()
        );
        // Add new item at the beginning and limit to MAX_HISTORY_ITEMS
        return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      });

      return newItem;
    },
    []
  );

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getHistoryItem = useCallback(
    (id: string) => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  return {
    history,
    loaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem
  };
}
