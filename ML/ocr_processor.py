import cv2
import numpy as np
import pytesseract
from PIL import Image
import re
import json

class OCRProcessor:
    def __init__(self):
        # Configure tesseract path (adjust for your system)
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        pass
    
    def preprocess_image(self, image_path):
        """Preprocess image for better OCR results"""
        # Read image
        img = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply threshold to get binary image
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations to clean up
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
    
    def extract_text(self, image_path):
        """Extract text from receipt image"""
        try:
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            
            # Configure tesseract for receipt text
            custom_config = r'--oem 3 --psm 6'
            
            # Extract text
            text = pytesseract.image_to_string(processed_img, config=custom_config)
            
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""
    
    def extract_receipt_data(self, image_path):
        """Extract structured data from receipt"""
        text = self.extract_text(image_path)
        
        if not text:
            return None
        
        # Initialize result dictionary
        result = {
            'raw_text': text,
            'amount': None,
            'date': None,
            'merchant': None,
            'category': 'Other',
            'confidence': 0.8
        }
        
        # Extract amount (look for currency patterns)
        amount_patterns = [
            r'Total[:\s]*\$?(\d+\.?\d*)',
            r'Amount[:\s]*\$?(\d+\.?\d*)',
            r'\$(\d+\.?\d*)',
            r'(\d+\.?\d*)\s*(?:USD|dollars?)',
            r'(\d+\.?\d*)\s*(?:INR|rupees?)'
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    result['amount'] = float(match.group(1))
                    break
                except ValueError:
                    continue
        
        # Extract date
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{4}-\d{2}-\d{2})',
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result['date'] = match.group(1)
                break
        
        # Extract merchant name (usually first line or after "From:")
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line) > 3 and not re.match(r'^\d+', line):  # Not a number
                if any(keyword in line.lower() for keyword in ['store', 'shop', 'restaurant', 'cafe', 'market']):
                    result['merchant'] = line
                    break
        
        # Categorize based on merchant or keywords
        text_lower = text.lower()
        if any(keyword in text_lower for keyword in ['restaurant', 'food', 'dining', 'cafe', 'pizza', 'burger']):
            result['category'] = 'Food & Dining'
        elif any(keyword in text_lower for keyword in ['gas', 'fuel', 'petrol', 'station']):
            result['category'] = 'Transportation'
        elif any(keyword in text_lower for keyword in ['hotel', 'accommodation', 'lodging']):
            result['category'] = 'Travel & Accommodation'
        elif any(keyword in text_lower for keyword in ['office', 'supplies', 'stationery']):
            result['category'] = 'Office Supplies'
        elif any(keyword in text_lower for keyword in ['medical', 'pharmacy', 'health', 'doctor']):
            result['category'] = 'Medical'
        else:
            result['category'] = 'Other'
        
        return result
    
    def validate_extracted_data(self, data):
        """Validate and clean extracted data"""
        if not data:
            return None
        
        # Validate amount
        if data.get('amount') and data['amount'] <= 0:
            data['amount'] = None
        
        # Validate date format
        if data.get('date'):
            try:
                # Try to parse common date formats
                from datetime import datetime
                datetime.strptime(data['date'], '%m/%d/%Y')
            except:
                try:
                    datetime.strptime(data['date'], '%Y-%m-%d')
                except:
                    data['date'] = None
        
        return data

# Example usage
if __name__ == "__main__":
    processor = OCRProcessor()
    
    # Test with a sample image
    # result = processor.extract_receipt_data("sample_receipt.jpg")
    # print(json.dumps(result, indent=2))
