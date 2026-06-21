import pandas as pd
import time
import json
import os
import google.generativeai as genai
from tqdm import tqdm

# =================================================================
# CONFIGURATION & API SETUP
# =================================================================

# 1. Insert your Gemini API Key here
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

# 2. Configure the model
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# 3. Path to your product inventory
INPUT_CSV = 'products.csv'
OUTPUT_CSV = 'seo_optimized_products.csv'

# =================================================================
# SYSTEM PROMPT LOGIC (SEO EXPERT)
# =================================================================

def get_seo_prompt(title, description, category="Lehengas"):
    """
    Constructs the system prompt for the Gemini API call.
    Instructs the AI to perform programmatic long-tail keyword optimization.
    """
    prompt = f"""
    Act as a Senior Technical SEO Specialist for a high-end headless e-commerce boutique (LuxeMia Boutique).
    Your goal is to generate hyper-specific, high-intent SEO metadata for the category: {category}.

    CURRENT PRODUCT DATA:
    - Title: {title}
    - Description: {description}

    OPTIMIZATION INSTRUCTIONS:
    1. EXTRACT ATTRIBUTES: Identify the exact Color, Fabric, Embroidery/Work Type, and specific Occasion (e.g., Sangeet, Mehendi, Wedding, Reception) from the description.
    2. KEYWORD STRUCTURE: Use a programmatic structure: [Color] [Fabric] [Work Type] [Category] for [Occasion].
    3. NO GENERIC SLOP: Stop using generic terms like "beautiful dress" or "high quality". Use technical terms like "Zari work", "Georgette", "Sequin embellishments", "Banarasi Silk", etc.
    4. META TITLE:
       - Maximum 60 characters.
       - Structure: [Programmatic Title] | LuxeMia Boutique
       - Must include a high-intent verb like "Buy" or "Shop" if space permits.
    5. META DESCRIPTION:
       - Maximum 160 characters.
       - Must describe the fabric and work in detail.
       - End with a clear Call to Action (CTA) like "Shop Online Now" or "Free Shipping over $350".

    OUTPUT FORMAT:
    Return ONLY a JSON object with the following keys:
    {{
        "Optimized_Title": "...",
        "Optimized_Description": "..."
    }}
    """
    return prompt

# =================================================================
# PROCESSING LOGIC
# =================================================================

def process_catalog(input_path, output_path):
    # Load data
    try:
        df = pd.read_csv(input_path)
        print(f"Successfully loaded {len(df)} products.")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return

    # Check for required columns
    required_cols = ['Product_ID', 'Current_Title', 'Current_Description', 'Product_URL']
    if not all(col in df.columns for col in required_cols):
        print(f"CSV must contain: {required_cols}")
        return

    optimized_titles = []
    optimized_descs = []

    # Iterate through products
    for index, row in tqdm(df.iterrows(), total=df.shape[0], desc="Optimizing SEO"):
        success = False
        retries = 0

        while not success and retries < 3:
            try:
                # Generate prompt
                prompt = get_seo_prompt(row['Current_Title'], row['Current_Description'])

                # Call Gemini API
                response = model.generate_content(prompt)

                # Parse JSON response
                # Note: model sometimes wraps JSON in ```json blocks
                clean_response = response.text.replace('```json', '').replace('```', '').strip()
                data = json.loads(clean_response)

                optimized_titles.append(data.get('Optimized_Title', ''))
                optimized_descs.append(data.get('Optimized_Description', ''))

                success = True

            except Exception as e:
                print(f"\nError at index {index} (ID: {row['Product_ID']}): {e}")
                retries += 1
                time.sleep(2) # Backoff

        if not success:
            optimized_titles.append("ERROR_PENDING")
            optimized_descs.append("ERROR_PENDING")

        # Rate limiting: Gemini Free Tier is ~15-60 RPM
        time.sleep(1.5)

    # Append to dataframe
    df['Optimized_Title'] = optimized_titles
    df['Optimized_Description'] = optimized_descs

    # Export
    df.to_csv(output_path, index=False)
    print(f"\nOptimization complete! File saved to: {output_path}")

# =================================================================
# EXECUTION (For Colab)
# =================================================================

if __name__ == "__main__":
    # In Colab, ensure you upload products.csv to the file explorer first.
    if os.path.exists(INPUT_CSV):
        process_catalog(INPUT_CSV, OUTPUT_CSV)
    else:
        print(f"Please upload '{INPUT_CSV}' to your Colab directory before running.")
