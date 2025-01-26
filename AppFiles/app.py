from flask import request, jsonify,send_from_directory
import logging
from database import *
from functions import *


@app.route('/')
def serve_home():
    return send_from_directory('static', 'index.html'),200


@app.route('/add_customer', methods=['POST'])
def api_add_customer():
    data = request.json
    try:
        return add_customer(data['name'], data['city'], data['age'])      
    except KeyError:
        app.logger.warning("Adding a customer failed:missing parameters.")
        return jsonify({"message":"Please fill all fields"}), 402
    

@app.route('/add_book', methods=['POST'])
def api_add_book():
    data = request.json
    try:
        return add_book(data['name'], data['author'], data['year'], data.get('booktype', 1))
    except KeyError:
        app.logger.warning("Adding a book failed:missing parameters.")
        return jsonify({"message":"Please fill all fields"}),402
    

@app.route('/delete_customer/<int:customer_id>', methods=['DELETE'])
def api_del_customer(customer_id):
    return del_customer(customer_id)


@app.route('/delete_book/<int:book_id>', methods=['DELETE'])
def api_del_book(book_id):
    return del_book(book_id)


@app.route('/create_loan', methods=['POST'])
def api_create_loan():
    data = request.json
    try:
        return create_loan(data['book_id'], data['customer_id'])
    except KeyError:
        app.logger.warning("Adding a loan failed:missing parameters.")
        return jsonify({"message":"Please fill all fields"}),402
    
        
     
@app.route('/display_late_loans')
def api_get_late_loans():
    return display_late_loans()


@app.route('/display_all_loans')
def api_get_all_loans():
    return display_all_loans()


@app.route('/return_by_loanid/<int:loanid>', methods=['PUT'])
def api_return_by_loanid(loanid):
    return return_book_by_loanid(loanid)

@app.route('/display_all_books')
def api_display_all_books():
    return display_all_books()

@app.route('/display_all_customers')
def api_display_all_customers():
    return display_all_customers()

@app.route('/Find_books_by_name/<string:book_name>')
def api_Find_book_by_name(book_name):
    return Find_books_by_name(book_name)

@app.route('/Find_costumer_by_name/<string:customer_name>')
def api_Find_costumer_by_name(customer_name):
    return Find_customer_by_name(customer_name)

@app.route('/Find_active_loan_by_customer_id/<int:custid>')
def api_get_active_loanby_customer_id(custid):
    return Find_active_loan_by_customer_id(custid)

@app.route('/Find_active_loan_by_book_id/<int:bookid>')
def api_get_active_loan_by_bookid(bookid):
    return Find_active_loan_by_book_id(bookid)

@app.route('/add50books', methods=['POST'])
def api_add_50_books():
    return add_50_books()

@app.route('/add10customers', methods=['POST'])
def api_add_10_customers():
    return add_10_customers()

@app.route('/create_late_loan', methods=['POST'])
def api_create_lat_loan():
    data = request.json
    try:
        return create_late_loan(data['book_id'], data['customer_id'])
    except KeyError:
        app.logger.warning("Adding a loan failed:missing parameters.")
        return jsonify({"message":"Please fill all fields"}),404


log_file = 'app.log'

if __name__ != '__main__':
    # Configure logging for Gunicorn
    gunicorn_error_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_error_logger.handlers
    app.logger.setLevel(gunicorn_error_logger.level)
else:
    # Configure logging to save logs to a file
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),  # Save logs to a file
            logging.StreamHandler()  # Also print logs to the console
        ])

    app.logger.info("Starting Flask-Library application...")
    app.run(debug=True)

   
   
