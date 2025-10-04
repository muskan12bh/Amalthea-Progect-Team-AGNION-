from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# In-memory storage (replace with database in production)
expense_requests = {}
companies = {}
users = {}

@app.route('/api/companies', methods=['GET'])
def get_companies():
    return jsonify(companies)

@app.route('/api/companies', methods=['POST'])
def create_company():
    data = request.json
    company_id = str(uuid.uuid4())
    companies[company_id] = {
        'id': company_id,
        'name': data['name'],
        'admin_email': data['admin_email'],
        'currency': data['currency'],
        'roles': data['roles'],
        'approval_flow': data['approval_flow'],
        'approval_rule': data['approval_rule'],
        'created_at': datetime.now().isoformat()
    }
    return jsonify({'id': company_id, 'message': 'Company created successfully'})

@app.route('/api/expense-requests', methods=['GET'])
def get_expense_requests():
    user_id = request.args.get('user_id')
    company_id = request.args.get('company_id')
    status = request.args.get('status')
    
    filtered_requests = []
    for req_id, request_data in expense_requests.items():
        if user_id and request_data.get('user_id') != user_id:
            continue
        if company_id and request_data.get('company_id') != company_id:
            continue
        if status and request_data.get('status') != status:
            continue
        filtered_requests.append(request_data)
    
    return jsonify(filtered_requests)

@app.route('/api/expense-requests', methods=['POST'])
def create_expense_request():
    data = request.json
    request_id = str(uuid.uuid4())
    
    expense_requests[request_id] = {
        'id': request_id,
        'user_id': data['user_id'],
        'company_id': data['company_id'],
        'amount': data['amount'],
        'currency': data['currency'],
        'category': data['category'],
        'description': data['description'],
        'receipt_image': data.get('receipt_image'),
        'extracted_data': data.get('extracted_data'),
        'status': 'pending',
        'urgency': data.get('urgency', 'normal'),
        'created_at': datetime.now().isoformat(),
        'approval_history': []
    }
    
    return jsonify({'id': request_id, 'message': 'Expense request created successfully'})

@app.route('/api/expense-requests/<request_id>/approve', methods=['POST'])
def approve_request(request_id):
    if request_id not in expense_requests:
        return jsonify({'error': 'Request not found'}), 404
    
    data = request.json
    expense_requests[request_id]['status'] = 'approved'
    expense_requests[request_id]['approved_by'] = data['approved_by']
    expense_requests[request_id]['approved_at'] = datetime.now().isoformat()
    
    return jsonify({'message': 'Request approved successfully'})

@app.route('/api/expense-requests/<request_id>/reject', methods=['POST'])
def reject_request(request_id):
    if request_id not in expense_requests:
        return jsonify({'error': 'Request not found'}), 404
    
    data = request.json
    expense_requests[request_id]['status'] = 'rejected'
    expense_requests[request_id]['rejected_by'] = data['rejected_by']
    expense_requests[request_id]['rejection_reason'] = data['rejection_reason']
    expense_requests[request_id]['rejected_at'] = datetime.now().isoformat()
    
    return jsonify({'message': 'Request rejected successfully'})

@app.route('/api/analytics/company/<company_id>', methods=['GET'])
def get_company_analytics(company_id):
    company_requests = [req for req in expense_requests.values() if req.get('company_id') == company_id]
    
    total_requests = len(company_requests)
    approved_requests = len([req for req in company_requests if req['status'] == 'approved'])
    rejected_requests = len([req for req in company_requests if req['status'] == 'rejected'])
    pending_requests = len([req for req in company_requests if req['status'] == 'pending'])
    urgent_requests = len([req for req in company_requests if req.get('urgency') == 'urgent' and req['status'] == 'pending'])
    
    total_amount = sum(float(req['amount']) for req in company_requests if req['status'] == 'approved')
    
    return jsonify({
        'total_requests': total_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'pending_requests': pending_requests,
        'urgent_requests': urgent_requests,
        'total_amount': total_amount,
        'approval_rate': (approved_requests / total_requests * 100) if total_requests > 0 else 0
    })

@app.route('/api/analytics/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    user_requests = [req for req in expense_requests.values() if req.get('user_id') == user_id]
    
    total_requests = len(user_requests)
    approved_requests = len([req for req in user_requests if req['status'] == 'approved'])
    rejected_requests = len([req for req in user_requests if req['status'] == 'rejected'])
    pending_requests = len([req for req in user_requests if req['status'] == 'pending'])
    
    total_amount = sum(float(req['amount']) for req in user_requests if req['status'] == 'approved')
    
    return jsonify({
        'total_requests': total_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'pending_requests': pending_requests,
        'total_amount': total_amount,
        'approval_rate': (approved_requests / total_requests * 100) if total_requests > 0 else 0
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
