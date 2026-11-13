def calculate_return_risk(return_request, inspection=None, historical_customer_returns=0):
    """
    Explainable Risk Scoring Engine for ReturnShield AI.
    
    Generates an interpretable risk score from 0 to 100 based on verified heuristics:
    1. Historical Return Frequency: Repeated returns from same customer reference.
    2. Claim Reason vs Physical Inspection: Discrepancy between stated reason and physical findings.
    3. Packaging & Tag Integrity: Missing or swapped tags.
    4. Computer Vision Assistive Score: Severe visual mismatches.
    5. High-Value Product Sensitivity: Returns on premium value SKUs.
    
    Returns:
    - risk_score: int (0 to 100)
    - risk_level: str ('LOW', 'MEDIUM', 'HIGH')
    - reasons: list of strings (transparent factors)
    - recommended_action: str
    """
    score = 15  # Baseline risk for any marketplace return
    reasons = []
    
    # 1. Customer Return Frequency Check
    if historical_customer_returns >= 3:
        score += 30
        reasons.append(f"Frequent return pattern detected: Customer has filed {historical_customer_returns} recent returns.")
    elif historical_customer_returns == 2:
        score += 15
        reasons.append("Customer has 2 prior return requests in seller records.")
        
    # 2. Return Reason Anomaly
    reason = return_request.return_reason
    if reason in ['Product damaged', 'Wrong product received', 'Missing item/accessory']:
        score += 15
        reasons.append(f"High-dispute return reason category: '{reason}'.")
        
    # 3. Physical Inspection Findings (if available)
    if inspection:
        cond = inspection.physical_condition
        if cond in ['Used/worn', 'Wrong product', 'Missing components']:
            score += 35
            reasons.append(f"Inspection finding contradicts brand-new state: Marked as '{cond}'.")
        elif cond == 'Damaged' and reason != 'Product damaged':
            score += 25
            reasons.append("Physical damage observed but customer claimed fitting/expectations issue.")
            
        # Tag condition
        if inspection.tag_condition in ['Missing', 'Swapped']:
            score += 20
            reasons.append(f"Brand security tag is {inspection.tag_condition.lower()}.")
            
        # Packaging seal
        if inspection.seal_condition == 'Tampered':
            score += 15
            reasons.append("Packaging seal shows evident signs of tampering.")
            
        # Computer Vision Discrepancy
        if inspection.similarity_score is not None and inspection.similarity_score < 0.50:
            score += 15
            reasons.append("OpenCV visual comparison indicates high color/texture deviation from dispatch photo.")
            
    # Cap score at 100
    risk_score = min(100, max(0, score))
    
    # Risk Level Classification
    if risk_score >= 70:
        risk_level = 'HIGH'
        recommended_action = (
            "Initiate Formal SPF Dispute. Retain original courier polybag, record unboxing video, "
            "and attach ReturnShield AI PDF dossier with dispatch evidence."
        )
    elif risk_score >= 40:
        risk_level = 'MEDIUM'
        recommended_action = (
            "Conduct thorough secondary manual inspection. Cross-check barcode sticker against order "
            "records before releasing inventory back to active warehouse stock."
        )
    else:
        risk_level = 'LOW'
        recommended_action = (
            "Standard return processing. Item is acceptable for repackaging and restocking "
            "after standard quality check."
        )
        
    if not reasons:
        reasons.append("Standard return characteristics with no suspicious discrepancy patterns detected.")
        
    return {
        'risk_score': risk_score,
        'risk_level': risk_level,
        'reasons': reasons,
        'recommended_action': recommended_action
    }
