import os
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from flask import current_app

def generate_evidence_qr(evidence_token, upload_folder):
    """
    Generates a QR code image encoding the dispatch evidence token
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(f"RETURNSHIELD-EVIDENCE-VERIFY://{evidence_token}")
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    filename = f"qr_{evidence_token}.png"
    filepath = os.path.join(upload_folder, 'dispatch', filename)
    img.save(filepath)
    return f"/uploads/dispatch/{filename}"


def generate_claim_dossier_pdf(claim, order, return_request, inspection, risk, upload_folder):
    """
    Generates an official, tamper-evident Return Dispute Dossier PDF (ReportLab)
    suitable for manual dispute submission to marketplace support.
    """
    pdf_filename = f"dossier_{claim.claim_ref}.pdf"
    pdf_path = os.path.join(upload_folder, 'reports', pdf_filename)
    
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )
    section_style = ParagraphStyle(
        'SectionH',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#4338ca'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )
    
    story = []
    
    # Header Banner
    story.append(Paragraph("ReturnShield AI — Return Dispute & Evidence Dossier", title_style))
    story.append(Paragraph(
        f"<b>Generated For:</b> {order.seller.store_name} | <b>Claim Ref:</b> {claim.claim_ref} | <b>Date:</b> {claim.created_at.strftime('%d %b %Y, %H:%M')}", 
        subtitle_style
    ))
    story.append(Spacer(1, 10))
    
    # Section 1: Order & Dispute Summary Table
    order_data = [
        ["Field", "Dispatched Record Details", "Return Claim Information"],
        ["Order Reference", order.order_ref, f"Return Ref: {return_request.return_ref}"],
        ["Product / SKU", f"{order.product.name} ({order.product.sku})", f"Return Reason: {return_request.return_reason}"],
        ["Order Value", f"INR {order.order_amount:.2f}", f"Disputed Loss: INR {claim.loss_amount:.2f}"],
        ["Customer Name", order.customer_name, f"Customer Remarks: {return_request.customer_remarks or 'None'}"]
    ]
    
    t_order = Table(order_data, colWidths=[120, 210, 210])
    t_order.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_order)
    story.append(Spacer(1, 15))
    
    # Section 2: Physical Inspection Findings
    story.append(Paragraph("Return Inspection & Physical Findings", section_style))
    inspection_data = [
        ["Physical State Assessment", inspection.physical_condition if inspection else "Pending Inspection"],
        ["Brand Security Tag", inspection.tag_condition if inspection else "N/A"],
        ["Courier Packaging Seal", inspection.seal_condition if inspection else "N/A"],
        ["Physical Observations", inspection.observations if inspection else "No observations recorded."],
        ["Visual Similarity (OpenCV)", f"{round(inspection.similarity_score * 100, 1)}% ({inspection.similarity_notes})" if inspection and inspection.similarity_score else "N/A"]
    ]
    t_inspect = Table(inspection_data, colWidths=[160, 380])
    t_inspect.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f8fafc')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_inspect)
    story.append(Spacer(1, 15))
    
    # Section 3: Explainable Risk Intelligence
    story.append(Paragraph(f"Explainable AI Risk Evaluation — Risk Score: {risk.risk_score}/100 ({risk.risk_level})", section_style))
    reasons_text = "<br/>• ".join(risk.reasons.split('||') if '||' in risk.reasons else [risk.reasons])
    risk_html = f"<b>Attributed Discrepancy Factors:</b><br/>• {reasons_text}<br/><br/><b>Recommended Action:</b><br/>{risk.recommended_action}"
    story.append(Paragraph(risk_html, body_style))
    story.append(Spacer(1, 20))
    
    # Section 4: Platform Notice & Legal Affirmation
    disclaimer_text = (
        "<b>Affirmation of Authenticity:</b> The dispatch data, photographic evidence timestamps, and inspection "
        "findings documented in this dossier were captured through the ReturnShield AI seller-protection workflow. "
        "This dossier is intended as formal supporting evidence for manual marketplace seller protection fund (SPF) review."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle('Notice', parent=body_style, fontSize=7.5, textColor=colors.HexColor('#64748b'))))
    
    doc.build(story)
    return f"/uploads/reports/{pdf_filename}"
