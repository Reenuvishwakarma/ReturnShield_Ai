import os
import cv2
import numpy as np

def compute_image_similarity(image1_path, image2_path):
    """
    Experimental computer vision comparison comparing dispatch and return photographs.
    Uses color histogram correlation and structural comparison.
    
    IMPORTANT LIMITATION NOTICE:
    This algorithm provides an assistive visual similarity coefficient (0.0 to 1.0).
    It CANNOT scientifically prove whether an item is genuine, counterfeit, or used,
    due to lighting variations, angles, folds, and camera sensors.
    It serves only as an assistive discrepancy indicator.
    """
    if not os.path.exists(image1_path) or not os.path.exists(image2_path):
        return {
            'similarity_score': 0.50,
            'match_level': 'Inconclusive',
            'explanation': 'One or both comparative images were unavailable on the server.'
        }
        
    try:
        img1 = cv2.imread(image1_path)
        img2 = cv2.imread(image2_path)
        
        if img1 is None or img2 is None:
            return {
                'similarity_score': 0.50,
                'match_level': 'Inconclusive',
                'explanation': 'Image file encoding could not be decoded by OpenCV.'
            }
            
        # Resize both images to standard dimensions (300x300) for uniform comparison
        img1_std = cv2.resize(img1, (300, 300))
        img2_std = cv2.resize(img2, (300, 300))
        
        # Convert to HSV color space for lighting-tolerant color distribution comparison
        hsv1 = cv2.cvtColor(img1_std, cv2.COLOR_BGR2HSV)
        hsv2 = cv2.cvtColor(img2_std, cv2.COLOR_BGR2HSV)
        
        hist1 = cv2.calcHist([hsv1], [0, 1], None, [50, 60], [0, 180, 0, 256])
        hist2 = cv2.calcHist([hsv2], [0, 1], None, [50, 60], [0, 180, 0, 256])
        
        cv2.normalize(hist1, hist1, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        cv2.normalize(hist2, hist2, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        
        # Compare histograms using correlation
        hist_score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        
        # Normalized similarity between 0.0 and 1.0
        normalized_score = max(0.0, min(1.0, float((hist_score + 1.0) / 2.0)))
        
        if normalized_score >= 0.80:
            match_level = 'High Visual Similarity'
            explanation = 'Overall color distributions and patterns align closely with dispatch proof.'
        elif normalized_score >= 0.55:
            match_level = 'Moderate Discrepancy'
            explanation = 'Notable color, shadow, or packaging difference observed. Check for folding or lighting.'
        else:
            match_level = 'Severe Visual Mismatch'
            explanation = 'Returned item exhibits drastic color or visual deviation from original dispatch.'
            
        return {
            'similarity_score': round(normalized_score, 2),
            'match_level': match_level,
            'explanation': explanation
        }
    except Exception as e:
        return {
            'similarity_score': 0.50,
            'match_level': 'Analysis Error',
            'explanation': f'Computer vision processing error: {str(e)}'
        }
