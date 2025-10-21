import React, { useEffect, useRef, useState } from 'react';
import SuggestionList from './SuggestionList';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { searchMoviesAPI, lookupPosterAPI } from '../../services/api';

export default function TitleAutocomplete({ value, onChange, onMeta, placeholder = 'ex: A Origem', skipFirstSearch = false }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debouncedTitle = useDebouncedValue(value, 400);
  const containerRef = useRef(null);
  const suppressNextSearchRef = useRef(false);
  const hasTypedRef = useRef(false);

  // Debounced search
  useEffect(() => {
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    const q = debouncedTitle.trim();
    // Skippar procura ao abrir editar
    if (skipFirstSearch && !hasTypedRef.current) {

      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
      return;
    }//começar procura depois de 2 chars
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const items = await searchMoviesAPI(q, 20);
        if (cancelled) return;
        setSuggestions(items || []);
        setShowSuggestions((items || []).length > 0);
        setHighlightIndex(-1);
      } catch {
        if (cancelled) return;
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedTitle]);

  // fecha sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);
//ao escolher sugestão
  const handlePickSuggestion = async (s) => {
    setShowSuggestions(false);
    setSuggestions([]);
    suppressNextSearchRef.current = true;
    onChange(s.title);
    try {
      const meta = await lookupPosterAPI(s.title, s.year);
      if (onMeta) onMeta(meta);
      if (meta && meta.title && meta.title !== s.title) {
        suppressNextSearchRef.current = true;
        onChange(meta.title);
      }
    } catch {

    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          hasTypedRef.current = true;
          onChange(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-400 text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-gray-600 dark:placeholder-gray-500"
      />
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionList
          items={suggestions}
          highlightIndex={highlightIndex}
          onPick={handlePickSuggestion}
          onHover={setHighlightIndex}
        />
      )}
    </div>
  );
}
