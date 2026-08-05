import csv
import json
import os
import re
import urllib.parse
import urllib.request

# Default seed database of targeted preschools & primary school leads in major Indian cities
# (All formatted for direct 1-on-1 WhatsApp & Email outreach)
INITIAL_LEADS = [
    {
        "school_name": "Lotus Kids Preschool",
        "city": "Hyderabad",
        "phone": "919849012345",
        "email": "info@lotuskidshyd.com",
        "category": "Preschool",
        "contact_person": "Managing Director"
    },
    {
        "school_name": "Little Elly Preschool",
        "city": "Hyderabad",
        "phone": "919885098765",
        "email": "hyderabad@littleelly.com",
        "category": "Preschool",
        "contact_person": "Principal"
    },
    {
        "school_name": "Bachpan Play School",
        "city": "Secunderabad",
        "phone": "919100123890",
        "email": "admissions@bachpanschool.com",
        "category": "Play School",
        "contact_person": "Center Head"
    },
    {
        "school_name": "EuroKids Early Years",
        "city": "Bangalore",
        "phone": "919845011223",
        "email": "bangalore@eurokidsindia.com",
        "category": "Preschool",
        "contact_person": "Principal"
    },
    {
        "school_name": "Kidzee Preschool",
        "city": "Bangalore",
        "phone": "919740033445",
        "email": "enquiry@kidzeebangalore.com",
        "category": "Preschool",
        "contact_person": "Center Director"
    },
    {
        "school_name": "Tree House High & Play School",
        "city": "Vizag",
        "phone": "919440155667",
        "email": "vizag@treehouseplaygroup.net",
        "category": "Preschool / Primary",
        "contact_person": "Headmistress"
    },
    {
        "school_name": "Kangaroo Kids International",
        "city": "Vijayawada",
        "phone": "919848077889",
        "email": "vijayawada@kangarookids.in",
        "category": "Preschool",
        "contact_person": "Academic Coordinator"
    },
    {
        "school_name": "Podar Jumbo Kids",
        "city": "Mumbai",
        "phone": "919820099112",
        "email": "jumbokids@podar.org",
        "category": "Preschool",
        "contact_person": "Principal"
    },
    {
        "school_name": "First Step Play School",
        "city": "Delhi NCR",
        "phone": "919810022334",
        "email": "contact@firststepplayschool.com",
        "category": "Play School",
        "contact_person": "Director"
    },
    {
        "school_name": "Rainbow Kids Academy",
        "city": "Chennai",
        "phone": "919840044556",
        "email": "chennai@rainbowkids.edu.in",
        "category": "Preschool",
        "contact_person": "Principal"
    }
]

def clean_phone(phone_str):
    digits = re.sub(r'\D', '', str(phone_str))
    if len(digits) == 10:
        return '91' + digits
    elif len(digits) == 12 and digits.startswith('91'):
        return digits
    return digits

def generate_whatsapp_message(school_name):
    encoded_school = urllib.parse.quote(school_name)
    demo_url = f"https://aforapple.fun/Alphabet.html?school={encoded_school}"
    
    msg = (
        f"Namaste! Quick question regarding interactive Smart TV learning at {school_name}?\n\n"
        f"We built Aforapple.fun — an interactive classroom tool for Nursery to Grade 2 "
        f"(Alphabet, Phonics, Tracing, Math, Hindi & Telugu) designed specifically for classroom Smart TVs and tablets.\n\n"
        f"🖥️ No download needed — runs in any browser.\n"
        f"📺 Direct Demo Link for {school_name}:\n{demo_url}\n\n"
        f"We are offering a 14-day free pilot for your classrooms. Would you like a trial code for your teachers?"
    )
    return msg

def export_leads():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(output_dir)
    
    csv_path = os.path.join(project_dir, "school_leads.csv")
    json_path = os.path.join(project_dir, "school_leads.json")
    
    processed_leads = []
    for lead in INITIAL_LEADS:
        phone_clean = clean_phone(lead["phone"])
        wa_text = generate_whatsapp_message(lead["school_name"])
        wa_link = f"https://wa.me/{phone_clean}?text={urllib.parse.quote(msg_format(lead['school_name']))}"
        
        item = {
            "school_name": lead["school_name"],
            "city": lead["city"],
            "phone": phone_clean,
            "email": lead["email"],
            "category": lead["category"],
            "contact_person": lead["contact_person"],
            "whatsapp_link": wa_link,
            "demo_url": f"https://aforapple.fun/Alphabet.html?school={urllib.parse.quote(lead['school_name'])}",
            "status": "New"
        }
        processed_leads.append(item)

    # Save CSV
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=processed_leads[0].keys())
        writer.writeheader()
        writer.writerows(processed_leads)

    # Save JSON for the local web dashboard
    with open(json_path, mode="w", encoding="utf-8") as f:
        json.dump(processed_leads, f, indent=2, ensure_ascii=False)

    print(f"✅ Successfully exported {len(processed_leads)} leads to:")
    print(f"   📄 CSV:  {csv_path}")
    print(f"   🌐 JSON: {json_path}")

def msg_format(school_name):
    encoded_school = urllib.parse.quote(school_name)
    demo_url = f"https://aforapple.fun/Alphabet.html?school={encoded_school}"
    return (
        f"Namaste! Quick question regarding interactive Smart TV learning at {school_name}?\n\n"
        f"We built Aforapple.fun — an interactive classroom tool for Nursery to Grade 2 "
        f"(Alphabet, Phonics, Tracing, Math, Hindi & Telugu) designed specifically for classroom Smart TVs and tablets.\n\n"
        f"🖥️ No download needed — runs in any browser.\n"
        f"📺 Try Demo Link for {school_name}:\n{demo_url}\n\n"
        f"We are offering a 14-day free pilot for your classrooms. Would you like a trial code for your teachers?"
    )

if __name__ == "__main__":
    export_leads()
