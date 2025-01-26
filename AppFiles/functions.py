from datetime import date, timedelta
from models import db, Customers, Books, Loans
from flask import current_app, jsonify  # Import Flask's built-in logger

# Function to add a customer
def add_customer(name, city, age):
    with current_app.app_context():  # Ensure we are within Flask's app context
        try:
            current_app.logger.info(f"Attempting to add customer: {name}, {city}, {age}")
            existing_customer = Customers.query.filter_by(name=name, city=city).first()
            if existing_customer:
                current_app.logger.warning(f"Customer '{name}' in '{city}' already exists.")
                return jsonify({"message": "Customer already exists."}),400
            new_customer = Customers(name=name, city=city, age=age)
            db.session.add(new_customer)
            db.session.commit()
            current_app.logger.info(f"Customer '{name}' added successfully.")
            return jsonify({"message": "Customer added successfully."}),201
            
        except Exception as e:
            current_app.logger.error(f"Error adding customer: {e}")
            return jsonify({"message": "An error occurred while adding the customer."}),500


# Function to add a book
def add_book(name, author, year, booktype=1):
    with current_app.app_context():
        try:
            current_app.logger.info(f"Attempting to add a book: {name} by {author}, Year: {year}, Type: {booktype}")
            if booktype not in [1, 2, 3]:
                current_app.logger.warning(f"Invalid book type: {booktype}")
                return jsonify({"message": "Incorrect book type, should be 1, 2, or 3"}),400

            
            new_book = Books(name=name, author=author, year_published=year, book_type=booktype)
            db.session.add(new_book)
            db.session.commit()
            current_app.logger.info(f"Book '{name}' added successfully.")
            return jsonify({"message": "Book added successfully."}),201

        except Exception as e:
            current_app.logger.error(f"Error adding book: {e}")
            return jsonify({"message": "An error occurred while adding the book."}),500


# Function to delete a customer
def del_customer(customer_id):
    with current_app.app_context():
        try:
            current_app.logger.info(f"Deleting customer ID: {customer_id}")
            customer = Customers.query.get(customer_id)
            if not customer:
                current_app.logger.warning(f"Customer ID {customer_id} not found.")
                return jsonify({"message": "Customer not found!"}),404
            
            if customer.have_loan:
                current_app.logger.warning(f"Cannot delete customer ID {customer_id}, has loan")
                return jsonify({"message": "Customer has loan!"}),400

            db.session.delete(customer)
            db.session.commit()
            current_app.logger.info(f"Customer ID {customer_id} deleted successfully.")
            return jsonify({"message": "Customer deleted successfully!"}),200

        except Exception as e:
            current_app.logger.error(f"Error deleting customer: {e}")
            return jsonify({"message": "An error occurred while deleting the customer."}),500


# Function to delete a book
def del_book(book_id):
    with current_app.app_context():
        try:
            current_app.logger.info(f"Deleting book ID: {book_id}")
            book = Books.query.get(book_id)
            if not book:
                current_app.logger.warning(f"Book ID {book_id} not found.")
                return jsonify({"message": "Book not found!"}),404
            if book.is_loaned:
                current_app.logger.warning(f"Cannot delete book ID {book_id} it is loaned!")
                return jsonify({"message": "Book is loaned!"}),400

            db.session.delete(book)
            db.session.commit()
            current_app.logger.info(f"Book ID {book_id} deleted successfully.")
            return jsonify({"message": "Book deleted successfully!"}),200

        except Exception as e:
            current_app.logger.error(f"Error deleting book: {e}")
            return jsonify({"message": "An error occurred while deleting the book."}),500


# Function to create a loan
def create_loan(book_id, customer_id):
    with current_app.app_context():
        try:
            current_app.logger.info(f"Creating loan for Customer ID {customer_id} and Book ID {book_id}")
            customer = Customers.query.get(customer_id)
            book = Books.query.get(book_id)

            if not customer:
                current_app.logger.warning(f"Customer ID {customer_id} not found.")
                return jsonify({"message": "Customer not found!"}),404
            if not book:
                current_app.logger.warning(f"Book ID {book_id} not found.")
                return jsonify({"message": "Book not found!"}),404
            if book.is_loaned:
                current_app.logger.warning(f"Book ID {book_id} is already loaned.")
                return jsonify({"message": "Book is already loaned!"}),400
            if customer.have_loan:
                current_app.logger.warning(f"Customer ID {customer_id} is already loaned.")
                return jsonify({"message": "This customer allready have a book loaned!"}),400

            return_date = date.today() + timedelta(days=10 if book.book_type == 1 else 5 if book.book_type == 2 else 3)

            new_loan = Loans(custid=customer_id, bookid=book_id, returndate=return_date)
            book.is_loaned = True  # Mark book as loaned
            customer.have_loan = True # Mark customer as loaner
            db.session.add(new_loan)
            db.session.commit()

            current_app.logger.info(f"Loan created successfully for Customer ID {customer_id} and Book ID {book_id}. Return Date: {return_date}")
            return jsonify({"message": "Loan created successfully!", "return_date": str(return_date)}),201

        except Exception as e:
            current_app.logger.error(f"Error creating loan: {e}")
            return jsonify({"message": "An error occurred while creating the loan."}),500


# Function to display all loans        
def display_all_loans():
    with current_app.app_context():
        current_app.logger.info("Fetching all loans")
        try:
            loans = Loans.query.all()  # No need for explicit joins!

            if not loans:
                current_app.logger.warning("No loans found.")
                return jsonify({"message": "No loans found."}),404

            all_loans_list = []
            for loan in loans:
                all_loans_list.append({
                    "loanid": loan.loanid,
                    "customer_id": loan.customer.custid,  # Access via backref
                    "customer_name": loan.customer.name,  # Access via backref
                    "book_id": loan.book.bookid,  # Access via backref
                    "book_name": loan.book.name,  # Access via backref
                    "loan_date": loan.loandate.strftime("%Y-%m-%d"),
                    "return_date": loan.returndate.strftime("%Y-%m-%d"),
                    "book_returned": loan.book_returned
                })
            
            current_app.logger.info("All loans sent.")
            return jsonify({"all_loans": all_loans_list}),200

        except Exception as e:
            current_app.logger.error(f"Error displaying all loans: {e}")
            return jsonify({"message": "An error occurred while displaying all loans."}),500


# Function to display late loans
def display_late_loans():
    with current_app.app_context():
        try:
            today = date.today()
            current_app.logger.info("Fetching late loans")

            # Fetch overdue loans where the book has not been returned
            late_loans = (
                db.session.query(Loans)
                .filter(Loans.book_returned == False)  # Book is still not returned
                .filter(Loans.returndate <= today)  # Past due date
                .all()
            )

            if not late_loans:
                current_app.logger.warning("No late loans found.")
                return jsonify({"message": "No late loans found."}),404

            late_loans_list = []
            for loan in late_loans:
                late_loans_list.append({
                    "loanid": loan.loanid,
                    "customer_id": loan.customer.custid,
                    "customer_name": loan.customer.name,
                    "book_id": loan.book.bookid,
                    "book_name": loan.book.name,
                    "loan_date": loan.loandate.strftime("%Y-%m-%d"),
                    "return_date": loan.returndate.strftime("%Y-%m-%d"),
                    "book_returned": loan.book_returned
                })

            current_app.logger.info(f"Fetched {len(late_loans_list)} late loans.")
            return jsonify({"late_loans": late_loans_list}),200

        except Exception as e:
            current_app.logger.error(f"Error displaying late loans: {e}")
            return jsonify({"message": "An error occurred while displaying late loans."}),500


# Function to return a loaned book by loan ID
def return_book_by_loanid(loan_id):
    
    with current_app.app_context():
        try:
            current_app.logger.info(f"Attempting to return book by loanid:{loan_id}")
            loan = Loans.query.get(loan_id)
            if not loan:
                current_app.logger.warning(f"Loan not found")
                return jsonify({"message": "Loan not found!"}),404
            
            if loan.book_returned:
                current_app.logger.warning(f"Book allready returned!")
                return jsonify({"message": "Book allready returned!"}),404
            # Update loan details
            loan.returndate = date.today()
            loan.book_returned = True
            loan.book.is_loaned = False
            loan.customer.have_loan = False

            db.session.commit()
            current_app.logger.info(f"Book {loan.bookid} was returned by loan ID: {loan_id}")
            return jsonify({"message": "Book returned successfully!", "return_date": str(loan.returndate)}),201

        except Exception as e:
            current_app.logger.error(f"Error returning book by loan ID: {e}")
            return jsonify({"message": "An error occurred while returning the book."}),500
 

# Function to display all books       
def display_all_books():
    with current_app.app_context():
        current_app.logger.info(f"Sending all books")
        try:
            
            books = (db.session.query(Books).all())

            if not books:
                current_app.logger.warning(f"No books found!")
                return jsonify({"message": "No books found."}),404

            all_books_list = []
            for book in books:
                all_books_list.append({
                    "bookid": book.bookid,
                    "name": book.name,
                    "author": book.author,
                    "year_published": book.year_published,
                    "book_type": book.book_type,
                    "is_loaned": book.is_loaned
                })
            current_app.logger.info(f"All books sent.")
            return jsonify({"all_books": all_books_list}),200

        except Exception as e:
            current_app.logger.error(f"Error displaying all books: {e}")
            return jsonify({"message": "An error occurred while displaying all books."}),500


# Function to display all customers        
def display_all_customers():
    with current_app.app_context():
        current_app.logger.info(f"Sending all customers")
        try:            
            customers = (db.session.query(Customers).all())
            if not customers:
                current_app.logger.warning(f"No costumers  found!")
                return jsonify({"message": "No costumers found."}),404

            all_books_list = []
            for customer in customers:
                all_books_list.append({
                    "custid": customer.custid,
                    "name": customer.name,
                    "city": customer.city,
                    "age": customer.age,
                    "have_loan": customer.have_loan
                })
            current_app.logger.info(f"All customers sent.")
            return jsonify({"all_customers": all_books_list}),200

        except Exception as e:
            current_app.logger.error(f"Error displaying all customers: {e}")
            return jsonify({"message": "An error occurred while displaying all custumers."}),500


# Function to find book by name
def Find_books_by_name(book_name):
    with current_app.app_context():
        current_app.logger.info(f"Serching book by name:{book_name}")
        try:            
            books = (db.session.query(Books).filter(Books.name==book_name ).all())
            if not books:
                current_app.logger.info(f"Books not found!")
                return jsonify({"message":"Books not found!"}),404
            
            all_books_list = []
            for book in books:
                all_books_list.append({
                    "bookid": book.bookid,
                    "name": book.name,
                    "author": book.author,
                    "year_published": book.year_published,
                    "book_type": book.book_type,
                    "is_loaned": book.is_loaned
                })
            current_app.logger.info("Sending found books")
            return jsonify({"books": all_books_list}),200
                
            
        except Exception as e:
            current_app.logger.error(f"Error finding book by name: {e}")
            return jsonify({"message": "An error occurred while finding book by name."}),500


# Function to find customer by name        
def Find_customer_by_name(customer_name):
    with current_app.app_context():
        current_app.logger.info(f"Searching customer by name: {customer_name}")
        try:            
            customers = db.session.query(Customers).filter(Customers.name == customer_name).all()
            
            if not customers:
                current_app.logger.info("Customer not found!")
                return jsonify({"message": "Customer not found!"}),404
            
            customer_list = [
                {
                    "custid": customer.custid,
                    "name": customer.name,
                    "city": customer.city,
                    "age": customer.age,
                    "have_loan": customer.have_loan
                }
                for customer in customers
            ]
            
            current_app.logger.info(f"Sending found customers: {len(customers)} results")
            return jsonify({"customers": customer_list}),200
                          
        except Exception as e:
            current_app.logger.error(f"Error finding customer by name: {e}")
            return jsonify({"message": "An error occurred while finding customer by name."}),500



# Function to find active loan by customer ID        
def Find_active_loan_by_customer_id(custid):
    with current_app.app_context():
        try:
            current_app.logger.info(f"Searching for active loan for Customer ID: {custid}")

            # Find an active loan (loan not yet returned)
            loan = Loans.query.filter_by(custid=custid, book_returned=False).first()

            if not loan:
                current_app.logger.warning(f"No active loan found for Customer ID {custid}")
                return jsonify({"message": "No active loan found for this customer."}),404

            # Prepare loan details
            loan_details = {
                "loanid": loan.loanid,
                "customer_id": loan.custid,
                "customer_name": loan.customer.name,  # Assuming Customers model has `name`
                "book_id": loan.bookid,
                "book_name": loan.book.name,  # Assuming Books model has `name`
                "loan_date": loan.loandate.strftime("%Y-%m-%d"),
                "return_date": loan.returndate.strftime("%Y-%m-%d"),
                "book_returned":loan.book_returned 
            }
            current_app.logger.info(f"Sending active loan ID:{loan.loanid} for Customer ID: {custid}")
            return jsonify({"active_loan": loan_details}),200

        except Exception as e:
            current_app.logger.error(f"Error finding active loan for Customer ID {custid}: {e}")
            return jsonify({"message": "An error occurred while retrieving the active loan."}),500


# Function to find customer by name 
def Find_active_loan_by_book_id(bookid):
    with current_app.app_context():
        try:
            current_app.logger.info(f"Searching for active loan for book ID: {bookid}")

            # Find an active loan (loan not yet returned)
            loan = Loans.query.filter_by(bookid=bookid, book_returned=False).first()

            if not loan:
                current_app.logger.warning(f"No active loan found for Book ID {bookid}")
                return jsonify({"message": "No active loan found for this book."}),404

            # Prepare loan details
            loan_details = {
                "loanid": loan.loanid,
                "customer_id": loan.custid,
                "customer_name": loan.customer.name,  # Assuming Customers model has `name`
                "book_id": loan.bookid,
                "book_name": loan.book.name,  # Assuming Books model has `name`
                "loan_date": loan.loandate.strftime("%Y-%m-%d"),
                "return_date": loan.returndate.strftime("%Y-%m-%d"),
                "book_returned":loan.book_returned 
            }
            current_app.logger.info(f"Sending active loan ID:{loan.loanid} for book ID: {bookid}")
            return jsonify({"active_loan": loan_details}),200

        except Exception as e:
            current_app.logger.error(f"Error finding active loan for Customer ID {bookid}: {e}")
            return jsonify({"message": "An error occurred while retrieving the active loan."}),500

# testing function
def add_10_customers():
    customers = [
        ("Billy Kid", "Chicago", 36),
        ("Add Smith", "LA", 65),
        ("John Jackson", "Atlanta", 19),
        ("Helen Driller", "NY", 38),
        ("Julie Hartson", "SF", 18),
        ("Rick Smith", "Colombus", 26),
        ("Marie Smith", "LA", 14),
        ("Chris James", "Boston", 22),
        ("Robert Friedman", "Brooklin", 33),
        ("Jane Fox", "San Diego", 29),
        ("Ricky Palmer", "LA", 31),
        ("Judie Portman", "Brooklin", 83)
        ]
    for name, city, age in customers:
        new_cust = Customers(name=name, city=city, age=age)
        db.session.add(new_cust)
    db.session.commit()
    return jsonify({"message":"10 customers created."}),201

# testing function
def add_50_books():
    books = [
        ("1984", "George Orwell", 1949),
        ("Pride and Prejudice", "Jane Austen", 1813),
        ("The Great Gatsby", "F. Scott Fitzgerald", 1925),
        ("Moby-Dick", "Herman Melville", 1851),
        ("War and Peace", "Leo Tolstoy", 1869),
        ("The Catcher in the Rye", "J.D. Salinger", 1951),
        ("Brave New World", "Aldous Huxley", 1932),
        ("The Lord of the Rings", "J.R.R. Tolkien", 1954),
        ("Crime and Punishment", "Fyodor Dostoevsky", 1866),
        ("The Brothers Karamazov", "Fyodor Dostoevsky", 1880),
        ("The Hobbit", "J.R.R. Tolkien", 1937),
        ("Les Misérables", "Victor Hugo", 1862),
        ("Don Quixote", "Miguel de Cervantes", 1605),
        ("Jane Eyre", "Charlotte Brontë", 1847),
        ("Wuthering Heights", "Emily Brontë", 1847),
        ("The Picture of Dorian Gray", "Oscar Wilde", 1890),
        ("The Divine Comedy", "Dante Alighieri", 1320),
        ("Anna Karenina", "Leo Tolstoy", 1878),
        ("The Count of Monte Cristo", "Alexandre Dumas", 1844),
        ("Frankenstein", "Mary Shelley", 1818),
        ("Dracula", "Bram Stoker", 1897),
        ("The Odyssey", "Homer", -700),
        ("The Iliad", "Homer", -750),
        ("Fahrenheit 451", "Ray Bradbury", 1953),
        ("One Hundred Years of Solitude", "Gabriel García Márquez", 1967),
        ("Catch-22", "Joseph Heller", 1961),
        ("Slaughterhouse-Five", "Kurt Vonnegut", 1969),
        ("A Tale of Two Cities", "Charles Dickens", 1859),
        ("Great Expectations", "Charles Dickens", 1861),
        ("David Copperfield", "Charles Dickens", 1850),
        ("Oliver Twist", "Charles Dickens", 1839),
        ("Madame Bovary", "Gustave Flaubert", 1856),
        ("Ulysses", "James Joyce", 1922),
        ("The Trial", "Franz Kafka", 1925),
        ("The Metamorphosis", "Franz Kafka", 1915),
        ("Lolita", "Vladimir Nabokov", 1955),
        ("The Stranger", "Albert Camus", 1942),
        ("Beloved", "Toni Morrison", 1987),
        ("The Sun Also Rises", "Ernest Hemingway", 1926),
        ("For Whom the Bell Tolls", "Ernest Hemingway", 1940),
        ("The Old Man and the Sea", "Ernest Hemingway", 1952),
        ("A Farewell to Arms", "Ernest Hemingway", 1929),
        ("Mansfield Park", "Jane Austen", 1814),
        ("Sense and Sensibility", "Jane Austen", 1811),
        ("Northanger Abbey", "Jane Austen", 1817),
        ("Emma", "Jane Austen", 1815),
        ("Persuasion", "Jane Austen", 1817),
        ("Gulliver’s Travels", "Jonathan Swift", 1726),
        ("Robinson Crusoe", "Daniel Defoe", 1719),
        ("The Scarlet Letter", "Nathaniel Hawthorne", 1850)
    ]
    
    for name, author, year in books:
        new_book = Books(name=name, author=author, year_published=year)
        db.session.add(new_book)
    db.session.commit()
    
    return jsonify({"message":"50 books added"}),201

# testing function
def create_late_loan(book_id, customer_id):
    with current_app.app_context():
        customer = Customers.query.get(customer_id)
        book = Books.query.get(book_id)
        yesterday = date.today() - timedelta(days=1)
        new_loan = Loans(custid=customer_id, bookid=book_id, returndate=yesterday)
        book.is_loaned = True  # Mark book as loaned
        customer.have_loan = True # Mark customer as loaner
        db.session.add(new_loan)
        db.session.commit()
        return jsonify({"message":"Late loan created"}),201