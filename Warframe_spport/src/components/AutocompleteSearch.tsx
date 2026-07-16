import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface Suggestion {
  value: string;
  label: string;
}

interface AutocompleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (e?: React.FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'warframes' | 'relics' | 'all';
}

export const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = '検索...',
  disabled = false,
  type = 'all'
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when value changes
  useEffect(() => {
    if (!value || value.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(value)}&type=${type}`);
        const data = await res.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    // Debounce slightly to prevent spamming
    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [value, type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[selectedIndex].value;
        onChange(selected);
        setShowSuggestions(false);
        // Wait a tick for state to update before submitting search
        setTimeout(() => onSearch(), 0);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestionValue: string) => {
    onChange(suggestionValue);
    setShowSuggestions(false);
    setTimeout(() => onSearch(), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(e);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, display: 'flex' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flex: 1 }}>
        <input
          type="text"
          className="input-text"
          style={{ flex: 1 }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          disabled={disabled}
        />
        <button type="submit" className="btn-primary" disabled={disabled}>
          <Search size={16} /> 検索
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: '80px', // Leave space for search button
          backgroundColor: 'rgba(20, 20, 30, 0.95)',
          border: '1px solid var(--border-light)',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          listStyle: 'none',
          padding: '4px 0',
          margin: '4px 0 0 0',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectSuggestion(s.value)}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: idx === selectedIndex ? 'rgba(0, 200, 255, 0.2)' : 'transparent',
                color: 'var(--text-color)',
                fontSize: '14px',
                borderLeft: idx === selectedIndex ? '3px solid var(--color-teal)' : '3px solid transparent',
              }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
