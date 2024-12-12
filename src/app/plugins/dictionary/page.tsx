"use client";
import React, { useState } from "react";
import { DictionaryType } from "@/utils/types"; // Ensure you have this type defined
import Dictionary from "@/components/Dictionary/Dictionary";
import { Skeleton } from "@nextui-org/skeleton";
import styles from "./DictionaryPage.module.css"; // Make sure your styles are defined properly

const DictionaryPage = () => {
  const [word, setWord] = useState<string>(""); // User input for the word
  const [dictionaryResults, setDictionaryResults] = useState<DictionaryType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle user input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
  };

  // Handle the search request when user presses enter or clicks search button
  const handleSearch = async () => {
    if (!word) return; // Don't search if the input is empty

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

      setDictionaryResults(data); // Store the fetched results
    } catch (error: any) {
      setError(error.message); // Display error message if something goes wrong
    } finally {
      setLoading(false);
    }
  };

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
