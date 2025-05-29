from fastapi import FastAPI, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from datetime import datetime
import os
import socket
import ssl
import whois
from urllib.parse import urlparse
import logging
import re
import time
from typing import Optional, Dict, List, Union

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLPhishingDetector:
    def __init__(self):
        """Initialize the phishing detector with model and scaler."""
        self.scaler = None
        self.kmeans = None
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            scaler_path = os.path.join(base_dir, "scaler.joblib")
            model_path = os.path.join(base_dir, "phishing_model.joblib")

            if not os.path.exists(scaler_path) or not os.path.exists(model_path):
                raise FileNotFoundError("Model or Scaler file not found!")

            self.scaler = joblib.load(scaler_path)
            self.kmeans = joblib.load(model_path)
            self.cluster_to_label_mapping = {0: "Safe", 1: "Phishing"}

            # Known safe domains with high confidence
            self.known_safe_domains = [
                "google.com", "amazon.com", "microsoft.com", "apple.com",
                "facebook.com", "youtube.com", "netflix.com", "github.com",
                "stackoverflow.com", "paruluniversity.ac.in", "claude.ai"
            ]

            logger.info("Model and Scaler loaded successfully!")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise RuntimeError(f"Failed to initialize detector: {str(e)}")

    def is_valid_ssl(self, url: str) -> bool:
        """Check if the URL has a valid SSL certificate."""
        try:
            parsed_url = urlparse(url)
            hostname = parsed_url.netloc.split(":")[0]
            if not hostname:
                return False

            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=hostname):
                    return True
        except Exception as e:
            logger.warning(f"SSL validation failed for {url}: {e}")
            return False

    def extract_features(self, url: str) -> np.ndarray:
        """Extract features from the URL for prediction."""
        try:
            if not url.startswith("http"):
                url = "http://" + url

            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower() if parsed_url.netloc else parsed_url.path.lower().split("/")[0]
            path = parsed_url.path.lower()

            length = len(url)
            https = int(url.startswith("https"))
            special_chars = sum(url.count(c) for c in "@-.=&?/:%#")
            keyword_count = sum(1 for word in [
                "login", "secure", "bank", "verify", "update",  
                "account", "password", "signin", "auth", "payment",  
                "urgent", "alert", "confirm", "suspend", "locked",  
                "paypal", "credit", "billing", "invoice", "transaction",
                "payment", "card", "cardholder", "cardnumber", "cvv",
                "stripe", "visa", "mastercard", "amex", "discover",
                "paypal", "bitcoin", "ethereum", "litecoin", "monero",
                "blockchain", "cryptocurrency", "wallet", "exchange","support-help"
                "transfer", "withdrawal", "deposit", "refund", "reimbursement",
                ".verification",".paypal-security",".login",".verify","verification",".click~"
                ".verification",".paypal-security",".login",".verify","verification","account.click"
                
            ] if word in url.lower())
            subdomain_count = domain.count(".")

            features = [length, https, special_chars, keyword_count, subdomain_count]
            if any(f is None or (isinstance(f, float) and np.isnan(f)) for f in features):
                logger.error(f"Feature extraction failed for {url}: {features}")
                raise ValueError("Feature extraction returned NaN values.")

            features = np.array([features])
            logger.info(f"Extracted features for {url}: {features}")
            
            return features
        except Exception as e:
            logger.error(f"Error extracting features from URL {url}: {e}")
            raise
    
    def predict_url(self, url: str) -> tuple[str, float, Optional[int]]:
        """Predict if a URL is phishing or safe with appropriate confidence scores."""
        try:
            if self.is_known_safe_domain(url):
                logger.info(f"{url} is a known safe domain")
                return "Safe", 0.95, self.get_domain_age(url)

            features = self.extract_features(url)
            if np.isnan(features).any():
                logger.error(f"NaN detected in extracted features for {url}: {features}")
                return "Error", 0.0, None

            scaled_features = self.scaler.transform(features)
            cluster = self.kmeans.predict(scaled_features)[0]
            verdict = self.cluster_to_label_mapping.get(cluster, "Safe")

            distance = np.linalg.norm(scaled_features - self.kmeans.cluster_centers_[cluster])

            def sigmoid(x):
                return 1 / (1 + np.exp(-x))

            raw_score = sigmoid(4 * ((distance / 5.0) - 0.5))

            if verdict == "Phishing":
                score = max(0.15, min(0.59, raw_score))
            else:
                score = max(0.60, min(1.0, 1 - raw_score))

            domain_age = self.get_domain_age(url)
            logger.info(f"Predicted {url}: verdict={verdict}, score={score}, domain_age={domain_age}")

            return verdict, score, domain_age
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return "Error", 0.0, None

    def is_known_safe_domain(self, url: str) -> bool:
        """Check if the URL belongs to known safe domains."""
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower() if parsed_url.netloc else parsed_url.path.lower().split("/")[0]
        return any(safe_domain in domain for safe_domain in self.known_safe_domains)

    def get_domain_age(self, url: str) -> Optional[int]:
        """Get the domain age in days."""
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc if parsed_url.netloc else parsed_url.path.split("/")[0]
            domain_info = whois.whois(domain)
            if domain_info.creation_date:
                creation_date = domain_info.creation_date
                if isinstance(creation_date, list):
                    creation_date = creation_date[0]
                age = (datetime.now() - creation_date).days
                return age
            return None
        except Exception as e:
            logger.warning(f"Could not get domain age for {url}: {e}")
            return None

detector = URLPhishingDetector()

class URLRequest(BaseModel):
    url: str

@app.post("/predict")
async def predict(request: URLRequest):
    try:
        url = request.url.strip()
        if not url:
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        
        if not re.match(r'^(https?://)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(/[^\s]*)?$', url):
            raise HTTPException(status_code=400, detail="Invalid URL format")

        verdict, score, domain_age = detector.predict_url(url)

        return {
            "url": url,
            "score": float(score),
            "verdict": verdict,
            "domain_age_days": domain_age,
            "date": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")

class WhoisRequest(BaseModel):
    url: str

@app.post("/whois")
async def get_whois(data: WhoisRequest):
    """Fetch WHOIS information for a given domain."""
    url = data.url.strip()

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    domain = re.sub(r'^(https?://)?(www\.)?', '', url).split('/')[0]
    
    try:
        domain_info = whois.whois(domain)

        def format_field(field):
            """Format WHOIS fields to be JSON-friendly."""
            if not field:
                return "N/A"
            if isinstance(field, list):
                return [str(item) for item in field if item] or "N/A"
            return str(field) if field else "N/A"

        def format_date(date_field):
            """Convert datetime fields to ISO format with timezone."""
            if isinstance(date_field, list) and date_field:
                return date_field[0].isoformat()
            return date_field.isoformat() if date_field else "N/A"

        def calculate_domain_age(creation_date):
            """Calculate domain age in years."""
            if not creation_date or creation_date == "N/A":
                return "N/A"
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            try:
                age = (datetime.now() - creation_date).days // 365
                return f"{age} years"
            except Exception:
                return "N/A"

        registered_on = format_date(domain_info.creation_date) if hasattr(domain_info, "creation_date") else "N/A"
        domain_age = calculate_domain_age(domain_info.creation_date) if hasattr(domain_info, "creation_date") else "N/A"
        registrar = format_field(domain_info.registrar) if hasattr(domain_info, "registrar") else "N/A (Registrar information not available)"

        logger.info(f"Raw WHOIS data: {domain_info}")
        
        result = {
            "Domain Name": format_field(domain_info.domain_name),
            "Registry Domain ID": format_field(getattr(domain_info, "registry_domain_id", None)),
            "Registered On": registered_on,
            "Expires On": format_date(domain_info.expiration_date),
            "Updated On": format_date(domain_info.updated_date),
            "Domain Age": domain_age,
            "Registrar": registrar,
            "Domain Status": format_field(domain_info.status),
            "Name Servers": format_field(domain_info.name_servers),
        }

        logger.info(f"Formatted WHOIS result: {result}")
        
        return {"domain_info": result, "method": "python-whois"}
    except whois.parser.PywhoisError:
        logger.error(f"WHOIS lookup failed for {domain}: Domain may not be registered.")
        raise HTTPException(status_code=404, detail="WHOIS lookup failed. The domain may not be registered.")
    except Exception as e:
        logger.error(f"WHOIS lookup error for {domain}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error while fetching WHOIS data.")

@app.get("/")
async def root():
    """Root endpoint welcoming users to the API."""
    return {"message": "Welcome to the URL Phishing Detection API. Use /predict to check URLs."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)