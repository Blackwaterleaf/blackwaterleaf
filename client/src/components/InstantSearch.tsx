/**
 * BlackWaterLeaf – Instant Search Component
 * Premium-Stil: dunkle Oberflächen, grüne Akzente, elegante Rundungen.
 * 
 * Features:
 * - Debounce mit korrektem Cleanup
 * - Fuzzy-Matching (client-seitig)
 * - Highlighting von Suchtreffer
 * - Intelligente Behandlung von leeren Ergebnissen
 * - Tastaturnavigation (Escape zum Schließen)
 * 
 * Verwendung:
 * <InstantSearch
 *   onSearch={(query) => handleSearch(query)}
 *   results={searchResults}
 *   isLoading={isLoading}
 *   placeholder=\"Botanik, Aquarien oder Beiträge suchen...\"
 * />
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';

export interface InstantSearchProps {
  /** Callback wenn die Suchanfrage sich ändert (nach Debounce) */
  onSearch: (query: string) => void;
  /** Suchergebnisse zum Anzeigen */
  results?: {
    plants?: Array<{ id: string; name: string; scientificName?: string }>;
    aquariums?: Array<{ id: string; name: string }>;
    posts?: Array<{ id: string; content: string }>;
  };
  /** Ist die Suche gerade am Laden? */
  isLoading?: boolean;
  /** Placeholder-Text für das Eingabefeld */
  placeholder?: string;
  /** Debounce-Verzögerung in Millisekunden */
  debounceDelay?: number;
  /** Optionale CSS-Klasse */
  className?: string;
  /** Callback wenn der Suchbereich geschlossen wird */
  onClose?: () => void;
}

/**
 * Fuzzy-Matching-Funktion
 * Prüft, ob ein Suchtext in einem String enthalten ist (mit Toleranz für Tippfehler)
 */
function fuzzyMatch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exakte Übereinstimmung hat höchste Priorität
  if (textLower.includes(queryLower)) {
    return true;
  }

  // Fuzzy-Matching: Alle Zeichen des Queries müssen in Reihenfolge im Text vorkommen
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
}

/**
 * Highlighting-Funktion
 * Markiert Suchergebnisse im Text
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Finde alle Vorkommen des Query-Strings (case-insensitive)
  let startIndex = 0;
  while (true) {
    const index = textLower.indexOf(queryLower, startIndex);
    if (index === -1) break;

    // Füge den Text vor dem Match hinzu
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }

    // Füge den gehighlighteten Match hinzu
    parts.push(
      <span
        key={`highlight-${index}`}
        style={{
          backgroundColor: 'rgba(45,155,110,0.30)',
          color: '#34D399',
          fontWeight: '600',
        }}
      >
        {text.substring(index, index + queryLower.length)}
      </span>
    );

    lastIndex = index + queryLower.length;
    startIndex = index + 1;
  }

  // Füge den restlichen Text hinzu
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Instant Search Component
 * Bietet eine verbesserte Suchfunktion mit Debounce, Fuzzy-Matching und Highlighting
 */
export function InstantSearch({
  onSearch,
  results,
  isLoading = false,
  placeholder = 'Suchen...',
  debounceDelay = 300,
  className = '',
  onClose,
}: InstantSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce-Logik mit korrektem Cleanup
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(value.trim().length > 0);

      // Cleanup des vorherigen Timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Setze einen neuen Timer
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value);
      }, debounceDelay);
    },
    [onSearch, debounceDelay]
  );

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Tastaturnavigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      onClose?.();
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
    onSearch('');
  };

  const totalResults =
    (results?.plants?.length ?? 0) +
    (results?.aquariums?.length ?? 0) +
    (results?.posts?.length ?? 0);

  const isSearching = query.trim().length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => isSearching && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
          style={{
            background: '#111614',
            border: '1px solid rgba(45,107,63,0.30)',
            color: 'rgba(255,255,255,0.88)',
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              (e.currentTarget as HTMLElement).style.borderColor =
                'rgba(45,107,63,0.30)';
            }
          }}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded transition-all duration-150 hover:bg-opacity-100"
            style={{
              color: 'rgba(255,255,255,0.45)',
              backgroundColor: 'transparent',
            }}
            aria-label="Suchfeld leeren"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && isSearching && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
          style={{
            background: '#0D110E',
            border: '1px solid rgba(45,107,63,0.30)',
          }}
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block">
                <div
                  className="w-5 h-5 rounded-full animate-spin"
                  style={{
                    borderTop: '2px solid #2D9B6E',
                    borderRight: '2px solid rgba(45,155,110,0.30)',
                    borderBottom: '2px solid rgba(45,155,110,0.30)',
                    borderLeft: '2px solid rgba(45,155,110,0.30)',
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Wird gesucht...
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: 'rgba(45,107,63,0.40)' }}
              />
              <p className="font-medium" style={{ color: 'rgba(255,255,255,0.88)' }}>
                Keine Ergebnisse gefunden
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Versuche andere Suchbegriffe
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {/* Plants */}
              {results?.plants && results.plants.length > 0 && (
                <div className="p-3">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: '#2D9B6E' }}
                  >
                    Botanik
                  </p>
                  <div className="space-y-1">
                    {results.plants.map((plant) => (
                      <div
                        key={plant.id}
                        className="p-2 rounded-lg cursor-pointer transition-all duration-150 hover:bg-opacity-100"
                        style={{
                          backgroundColor: 'rgba(45,155,110,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(45,155,110,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(45,155,110,0.08)';
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'rgba(255,255,255,0.88)' }}
                        >
                          {highlightMatch(plant.name, query)}
                        </p>
                        {plant.scientificName && (
                          <p
                            className="text-xs italic"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                          >
                            {plant.scientificName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aquariums */}
              {results?.aquariums && results.aquariums.length > 0 && (
                <div className="p-3">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(100,160,240,0.90)' }}
                  >
                    Aquarien
                  </p>
                  <div className="space-y-1">
                    {results.aquariums.map((aq) => (
                      <div
                        key={aq.id}
                        className="p-2 rounded-lg cursor-pointer transition-all duration-150 hover:bg-opacity-100"
                        style={{
                          backgroundColor: 'rgba(100,160,240,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(100,160,240,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(100,160,240,0.08)';
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'rgba(255,255,255,0.88)' }}
                        >
                          {highlightMatch(aq.name, query)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results?.posts && results.posts.length > 0 && (
                <div className="p-3">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(212,175,55,0.90)' }}
                  >
                    Beiträge
                  </p>
                  <div className="space-y-1">
                    {results.posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-2 rounded-lg cursor-pointer transition-all duration-150 hover:bg-opacity-100"
                        style={{
                          backgroundColor: 'rgba(212,175,55,0.08)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(212,175,55,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(212,175,55,0.08)';
                        }}
                      >
                        <p
                          className="text-xs line-clamp-2"
                          style={{ color: 'rgba(255,255,255,0.72)' }}
                        >
                          {highlightMatch(post.content, query)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InstantSearch;
