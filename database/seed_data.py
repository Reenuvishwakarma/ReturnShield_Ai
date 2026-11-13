import sys
import os
from datetime import datetime, timedelta

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_dir)

from app import create_app, db
from app.models import (
    User, Product, Order, DispatchEvidence, DispatchImage,
    ReturnRequest, ReturnImage, ReturnInspection, RiskAssessment,
    Claim, Notification
)
from app.services.pdf_generator import generate_evidence_qr, generate_claim_dossier_pdf

app = create_app()

def seed_database():
    with app.app_context():
        # Clear existing tables
        db.drop_all()
        db.create_all()
        print("Database schema dropped & recreated.")
        
        # 1. Create Default Verified Demo Seller
        seller = User(
            name="Aarav Sharma",
            email="seller@returnshield.ai",
            store_name="Royal Ethnic & Apparels"
        )
        seller.set_password("seller123")
        db.session.add(seller)
        db.session.commit()
        print("Demo seller created: seller@returnshield.ai / seller123")
        
        # 2. Add Products
        products_data = [
            ("Anarkali Embroidered Kurti Set", "KURTI-EMB-ANR-01", "Women's Ethnic", 1299.0, "Pure rayon embroidered anarkali kurti with duppatta."),
            ("Cotton Solid Straight Kurta", "KURTI-COT-STR-02", "Women's Ethnic", 599.0, "Breathable daily wear cotton kurta with side slits."),
            ("Men Slim Fit Formal Shirt", "SHIRT-SLM-NVY-03", "Men's Apparel", 849.0, "Wrinkle-resistant navy blue corporate dress shirt."),
            ("Leatherette Travel Duffle Bag", "BAG-TRAV-BRN-04", "Luggage & Accessories", 1899.0, "Waterproof 45L luggage duffle bag with brass buckles."),
            ("Wireless Bluetooth Earbuds Pro", "TECH-EAR-WHT-05", "Consumer Electronics", 1499.0, "Active noise cancelling wireless earbuds with IPX5.")
        ]
        
        created_prods = []
        for name, sku, cat, price, desc in products_data:
            p = Product(seller_id=seller.id, name=name, sku=sku, category=cat, selling_price=price, description=desc)
            db.session.add(p)
            created_prods.append(p)
        db.session.commit()
        print(f"Created {len(created_prods)} products.")
        
        # 3. Create Orders & Dispatch Records
        orders_info = [
            ("MEESH-ORD-9021", "Pooja Verma", created_prods[0], 1, 1299.0, 14),
            ("MEESH-ORD-9022", "Rahul Malhotra", created_prods[1], 2, 1198.0, 12),
            ("MEESH-ORD-9023", "Pooja Verma", created_prods[2], 1, 849.0, 10),
            ("MEESH-ORD-9024", "Vikram Rathore", created_prods[3], 1, 1899.0, 8),
            ("MEESH-ORD-9025", "Neha Sundaram", created_prods[4], 1, 1499.0, 7),
            ("MEESH-ORD-9026", "Pooja Verma", created_prods[0], 1, 1299.0, 5),
            ("MEESH-ORD-9027", "Sneha Roy", created_prods[1], 1, 599.0, 3),
            ("MEESH-ORD-9028", "Amitabh Sen", created_prods[2], 1, 849.0, 1)
        ]
        
        created_orders = []
        for ref, cust, prod, qty, amt, days_ago in orders_info:
            d_date = datetime.utcnow() - timedelta(days=days_ago)
            o = Order(
                seller_id=seller.id,
                product_id=prod.id,
                order_ref=ref,
                customer_name=cust,
                quantity=qty,
                order_amount=amt,
                dispatch_date=d_date,
                status="Dispatched"
            )
            db.session.add(o)
            created_orders.append(o)
        db.session.commit()
        
        # 4. Attach Dispatch Evidence to several orders
        upload_folder = app.config['UPLOAD_FOLDER']
        for i, o in enumerate(created_orders[:6]):
            tok = f"EVD-{datetime.utcnow().strftime('%Y%m%d')}-00{i+1}"
            qr_url = generate_evidence_qr(tok, upload_folder)
            disp = DispatchEvidence(
                order_id=o.id,
                evidence_token=tok,
                condition_notes="Dispatched in brand new condition. Polybag heat-sealed with intact barcode security tag.",
                packaging_seal_intact=True,
                tag_attached=True,
                qr_code_url=qr_url,
                captured_at=o.dispatch_date
            )
            db.session.add(disp)
        db.session.commit()
        print("Dispatch evidence & QR codes generated.")
        
        # 5. Add Return Requests (including suspicious cases)
        # Case A: Suspicious / High Risk (Used & Worn returned)
        ret1 = ReturnRequest(
            order_id=created_orders[0].id,
            return_ref="RET-2026-901",
            return_reason="Product damaged",
            customer_remarks="Received damaged and defective cloth from inside.",
            status="Inspected",
            return_date=datetime.utcnow() - timedelta(days=2)
        )
        created_orders[0].status = "Return Inspected"
        db.session.add(ret1)
        db.session.flush()
        
        insp1 = ReturnInspection(
            return_request_id=ret1.id,
            physical_condition="Used/worn",
            tag_condition="Missing",
            seal_condition="Tampered",
            observations="Security tag has been cut off. Noticeable perfume odor and detergent washing marks around collar.",
            verified_damaged=True,
            similarity_score=0.42,
            similarity_notes="Severe Visual Mismatch - Color fading & tag missing.",
            inspected_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(insp1)
        
        risk1 = RiskAssessment(
            return_request_id=ret1.id,
            risk_score=85,
            risk_level="HIGH",
            reasons="Frequent return pattern detected: Customer Pooja Verma has filed 3 recent returns.||Inspection finding contradicts brand-new state: Marked as 'Used/worn'.||Brand security tag is missing.||Packaging seal shows evident signs of tampering.||OpenCV visual comparison indicates high color/texture deviation from dispatch photo.",
            recommended_action="Initiate Formal SPF Dispute. Retain original courier polybag, record unboxing video, and attach ReturnShield AI PDF dossier with dispatch evidence."
        )
        db.session.add(risk1)
        
        # Claim for Case A
        claim1 = Claim(
            return_request_id=ret1.id,
            claim_ref="CLM-2026-8801",
            claim_type="Used / Worn Apparel Returned",
            loss_amount=1299.0,
            status="Ready for Platform Submission",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(claim1)
        db.session.flush()
        
        pdf1 = generate_claim_dossier_pdf(claim1, created_orders[0], ret1, insp1, risk1, upload_folder)
        claim1.pdf_report_path = pdf1
        
        # Case B: Medium Risk (Wrong Product Received Claim)
        ret2 = ReturnRequest(
            order_id=created_orders[3].id,
            return_ref="RET-2026-902",
            return_reason="Wrong product received",
            customer_remarks="Box had completely different cheap cloth bag.",
            status="Pending Inspection",
            return_date=datetime.utcnow() - timedelta(days=1)
        )
        created_orders[3].status = "Return Requested"
        db.session.add(ret2)
        db.session.flush()
        
        risk2 = RiskAssessment(
            return_request_id=ret2.id,
            risk_score=50,
            risk_level="MEDIUM",
            reasons="High-dispute return reason category: 'Wrong product received'.||High unit value product (INR 1899.00).",
            recommended_action="Conduct thorough secondary manual inspection. Cross-check barcode sticker against order records before releasing inventory."
        )
        db.session.add(risk2)
        
        # Case C: Low Risk (Size / Fitting issue)
        ret3 = ReturnRequest(
            order_id=created_orders[1].id,
            return_ref="RET-2026-903",
            return_reason="Size or fitting issue",
            customer_remarks="XL size is slightly tight around shoulders, returning for exchange.",
            status="Inspected",
            return_date=datetime.utcnow() - timedelta(days=3)
        )
        created_orders[1].status = "Return Inspected"
        db.session.add(ret3)
        db.session.flush()
        
        insp3 = ReturnInspection(
            return_request_id=ret3.id,
            physical_condition="Good condition",
            tag_condition="Intact",
            seal_condition="Broken",
            observations="Item returned folded in original condition with security tag intact. Ready for resale.",
            verified_damaged=False,
            similarity_score=0.94,
            similarity_notes="High Visual Similarity - Clean tag and pristine fabric.",
            inspected_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(insp3)
        
        risk3 = RiskAssessment(
            return_request_id=ret3.id,
            risk_score=20,
            risk_level="LOW",
            reasons="Standard return characteristics with no suspicious discrepancy patterns detected.||Tag is verified intact.",
            recommended_action="Standard return processing. Item is acceptable for repackaging and restocking after standard quality check."
        )
        db.session.add(risk3)
        
        # 6. Notifications / Alerts
        notifs = [
            (seller.id, "High Return Risk Detected: Order MEESH-ORD-9021", "Explainable risk score 85/100: Missing security tags and evidence of garment washing.", "danger"),
            (seller.id, "Dispute Claim Dossier PDF Ready", "Dispute dossier CLM-2026-8801 has been compiled into official PDF format.", "info"),
            (seller.id, "Inspection Pending for Bag Order MEESH-ORD-9024", "Parcel returned by courier. Please record side-by-side inspection.", "warning")
        ]
        for uid, title, msg, sev in notifs:
            n = Notification(user_id=uid, title=title, message=msg, severity=sev)
            db.session.add(n)
            
        db.session.commit()
        print("Database seeded with realistic demo data, orders, risk evaluations, and PDF dossiers!")

if __name__ == '__main__':
    seed_database()
