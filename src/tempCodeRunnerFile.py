import whois
from datetime import datetime

def get_domain_info(domain):
    try:
        domain_info = whois.whois(domain)

        # Extract first value if multiple entries exist
        def extract_first(value):
            return value[0] if isinstance(value, list) else value

        domain_name = domain_info.domain_name
        creation_date = extract_first(domain_info.creation_date)
        expiration_date = extract_first(domain_info.expiration_date)
        updated_date = extract_first(domain_info.updated_date)
        registrar = domain_info.registrar
        name_servers = domain_info.name_servers
        
        # Filter status (remove duplicate links)
        status = list(set([s.split(" ")[0] for s in domain_info.status])) if domain_info.status else None

        # Calculate domain age
        domain_age = (datetime.now() - creation_date).days // 365 if creation_date else "Unknown"

        # Format dates
        formatted_data = {
            "Domain Name": domain_name,
            "Domain Age (Years)": domain_age,
            "Created On": creation_date.strftime("%Y-%m-%d") if creation_date else "Unknown",
            "Expires On": expiration_date.strftime("%Y-%m-%d") if expiration_date else "Unknown",
            "Updated On": updated_date.strftime("%Y-%m-%d") if updated_date else "Unknown",
            "Registrar": registrar,
            "Status": status,
            "Name Servers": name_servers
        }

        return formatted_data

    except Exception as e:
        return {"Error": f"WHOIS lookup failed: {e}"}

# Test it
print(get_domain_info("google.com"))

