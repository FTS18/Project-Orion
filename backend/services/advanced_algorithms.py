"""
Advanced Algorithms Service
Implements:
1. Cosine & Jaccard Similarity
2. TF-IDF Vectorization
3. Weighted Scoring Model
4. k-NN Search (Simulated for Context)
"""
import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple

class AdvancedAlgorithms:
    
    # ============================================================================
    # 1. SIMILARITY ALGORITHMS (Cosine & Jaccard)
    # ============================================================================
    
    @staticmethod
    def jaccard_similarity(str1: str, str2: str) -> float:
        """
        Calculates Jaccard Similarity between two strings.
        J(A,B) = |A ∩ B| / |A ∪ B|
        """
        set1 = set(str1.lower().split())
        set2 = set(str2.lower().split())
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0

    @staticmethod
    def cosine_similarity(str1: str, str2: str) -> float:
        """
        Calculates Cosine Similarity between two strings using simple term frequency.
        """
        # Tokenize and count frequencies
        vec1 = Counter(str1.lower().split())
        vec2 = Counter(str2.lower().split())
        
        # Get all unique words
        intersection = set(vec1.keys()) & set(vec2.keys())
        
        # Calculate dot product: A . B
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        
        # Calculate magnitudes: ||A|| and ||B||
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        
        if not denominator:
            return 0.0
        
        return numerator / denominator

    # ============================================================================
    # 2. TF-IDF VECTORIZATION + FUZZY SEARCH
    # ============================================================================

    @staticmethod
    def compute_tf_idf(corpus: List[str]) -> List[Dict[str, float]]:
        """
        Computes TF-IDF vectors for a corpus of strings.
        Returns a list of dictionaries where each dict represents a document's vector.
        """
        # 1. Compute Term Frequency (TF)
        tfs = []
        for doc in corpus:
            words = doc.lower().split()
            word_count = len(words)
            counter = Counter(words)
            tf = {word: count/word_count for word, count in counter.items()}
            tfs.append(tf)
            
        # 2. Compute Inverse Document Frequency (IDF)
        idf = {}
        total_docs = len(corpus)
        all_words = set(word for doc in tfs for word in doc.keys())
        
        for word in all_words:
            # Count docs containing the word
            doc_count = sum(1 for tf in tfs if word in tf)
            idf[word] = math.log(total_docs / (1 + doc_count))
            
        # 3. Compute TF-IDF
        tf_idf_vectors = []
        for tf in tfs:
            vector = {word: tf_val * idf[word] for word, tf_val in tf.items()}
            tf_idf_vectors.append(vector)
            
        return tf_idf_vectors

    @staticmethod
    def fuzzy_search(query: str, corpus: List[str], threshold: float = 0.3) -> List[Tuple[str, float]]:
        """
        Performs fuzzy search using Cosine Similarity on TF-IDF vectors (simplified).
        """
        # For simplicity in this standalone version, we'll just use direct Cosine on the query vs docs
        results = []
        for doc in corpus:
            score = AdvancedAlgorithms.cosine_similarity(query, doc)
            if score >= threshold:
                results.append((doc, score))
        
        # Sort by score descending
        return sorted(results, key=lambda x: x[1], reverse=True)

    # ============================================================================
    # 3. WEIGHTED SCORING MODEL
    # ============================================================================

    @staticmethod
    def calculate_weighted_score(
        factors: Dict[str, float], 
        weights: Dict[str, float]
    ) -> float:
        """
        Calculates a weighted score.
        Score = Σ (Factor_i * Weight_i)
        """
        total_score = 0.0
        total_weight = 0.0
        
        for key, weight in weights.items():
            if key in factors:
                total_score += factors[key] * weight
                total_weight += weight
                
        return total_score / total_weight if total_weight > 0 else 0.0

    # ============================================================================
    # 4. k-NN SEARCH (Simulated for Context Memory)
    # ============================================================================

    @staticmethod
    def knn_search(
        query_vector: Dict[str, float], 
        database_vectors: List[Dict[str, float]], 
        k: int = 3
    ) -> List[int]:
        """
        Finds k-Nearest Neighbors using Cosine Similarity.
        Returns indices of the nearest neighbors.
        """
        scores = []
        
        # Convert query vector dict to a comparable format or just use the cosine_similarity logic
        # adapted for sparse vectors (dicts)
        
        def dict_cosine(v1: Dict[str, float], v2: Dict[str, float]) -> float:
            intersection = set(v1.keys()) & set(v2.keys())
            numerator = sum([v1[x] * v2[x] for x in intersection])
            sum1 = sum([v1[x]**2 for x in v1.keys()])
            sum2 = sum([v2[x]**2 for x in v2.keys()])
            denominator = math.sqrt(sum1) * math.sqrt(sum2)
            return numerator / denominator if denominator else 0.0

        for i, vec in enumerate(database_vectors):
            score = dict_cosine(query_vector, vec)
            scores.append((i, score))
            
        # Sort by score descending
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return [x[0] for x in scores[:k]]

