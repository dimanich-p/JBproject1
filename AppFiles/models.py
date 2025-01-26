# models.py
from datetime import date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Customers(db.Model):
    custid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    age = db.Column(db.String(15), nullable=False)
    have_loan = db.Column(db.Boolean, nullable=False, default=False, server_default='0')
    loans = db.relationship('Loans', backref='customer', lazy=True, cascade='all, delete-orphan')

class Books(db.Model):
    bookid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    year_published = db.Column(db.String(15), nullable=False)
    book_type = db.Column(db.Integer, nullable=False, default=1)
    is_loaned = db.Column(db.Boolean, nullable=False, default=False, server_default='0')
    loans = db.relationship('Loans', backref='book', lazy=True, cascade='all, delete-orphan')

class Loans(db.Model):
    loanid = db.Column(db.Integer, primary_key=True)
    custid = db.Column(db.Integer, db.ForeignKey('customers.custid'), nullable=False)
    bookid = db.Column(db.Integer, db.ForeignKey('books.bookid'), nullable=False)
    loandate = db.Column(db.Date, nullable=False, default=date.today)
    returndate = db.Column(db.Date, nullable=True)
    book_returned = db.Column(db.Boolean, nullable=False, default=False, server_default='0')
