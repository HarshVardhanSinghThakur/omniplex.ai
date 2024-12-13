"use client";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { DictionaryType } from "@/utils/types";
import styles from "./DictionaryPage.module.css";

// Dynamically import components to ensure they're only loaded client-side
const Dictionary = dynamic(() => import("@/components/Dictionary/Dictionary"), { ssr: false });
const Skeleton = dynamic(() => import("@nextui-org/skeleton").then(mod => mod.Skeleton), { ssr: false });

const DictionaryPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [word, setWord] = useState<string>(""); 
  const [dictionaryResults, setDictionaryResults] = useState<DictionaryType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
  };

  const handleSearch = async () => {
    if (!word) return;

    setLoading(true);
    setError(null);
    setDictionaryResults(null);

    try {
      const response = await fetch(`/api/dictionary?word=${word}`);

      if (!response.ok) {
        throw new Error("Failed to fetch word definitions.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setDictionaryResults(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className={styles.pageContainer}>
      {/* Results Tab (above search bar) */}
      <div className={styles.resultsTab}>
        {!dictionaryResults && !loading && !error && (
          <h2 className={styles.heading}>Search any word to get its definition</h2>
        )}

        {/* Show results only after successful search */}
        {dictionaryResults && (
          <div className={styles.resultContainer}>
            <h2 className={styles.resultHeading}>Results for {word}:</h2>
            <Dictionary dictionaryResults={dictionaryResults} />
          </div>
        )}

        {/* Error Handling */}
        {error && <div className={styles.errorMessage}><p>{error}</p></div>}
      </div>

      {/* Search Input */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={word}
          onChange={handleInputChange}
          placeholder="Enter single word..."
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className={styles.skeletonContainer}>
          <Skeleton className={styles.skeletonWord} />
          <div className={styles.skeletonPhonetic}>
            <Skeleton className={styles.skeletonAudioContainer} />
            <Skeleton className={styles.skeletonText} />
          </div>
          <div className={styles.skeletonMeaning}>
            <Skeleton className={styles.skeletonPartOfSpeech} />
            <Skeleton className={styles.skeletonDefinition} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;
