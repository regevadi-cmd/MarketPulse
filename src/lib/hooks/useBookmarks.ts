'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalysisResult, ProviderName } from '@/types/analysis';

export interface BookmarkItem {
  id: string;
  companyName: string;
  provider: ProviderName;
  sentiment: AnalysisResult['sentiment'];
  timestamp: number;
  data: AnalysisResult;
  notes?: string;
}

const STORAGE_KEY = 'marketpulse_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
    setLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Failed to save bookmarks:', error);
      }
    }
  }, [bookmarks, loaded]);

  const addBookmark = useCallback(
    (companyName: string, provider: ProviderName, data: AnalysisResult, notes?: string) => {
      // Check if already bookmarked
      const existing = bookmarks.find(
        (b) => b.companyName.toLowerCase() === companyName.toLowerCase()
      );
      if (existing) {
        // Update existing bookmark
        setBookmarks((prev) =>
          prev.map((b) =>
            b.id === existing.id
              ? { ...b, data, provider, sentiment: data.sentiment, timestamp: Date.now(), notes }
              : b
          )
        );
        return existing.id;
      }

      const newBookmark: BookmarkItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyName,
        provider,
        sentiment: data.sentiment,
        timestamp: Date.now(),
        data,
        notes
      };

      setBookmarks((prev) => [newBookmark, ...prev]);
      return newBookmark.id;
    },
    [bookmarks]
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (companyName: string) => {
      return bookmarks.some(
        (b) => b.companyName.toLowerCase() === companyName.toLowerCase()
      );
    },
    [bookmarks]
  );

  const getBookmark = useCallback(
    (companyName: string) => {
      return bookmarks.find(
        (b) => b.companyName.toLowerCase() === companyName.toLowerCase()
      );
    },
    [bookmarks]
  );

  const updateNotes = useCallback((id: string, notes: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, notes } : b))
    );
  }, []);

  return {
    bookmarks,
    loaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmark,
    updateNotes
  };
}
