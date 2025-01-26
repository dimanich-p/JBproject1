// function to clear the output 
document.addEventListener("DOMContentLoaded", function () {
    // Get the Clear Output button
    const clearOutputButton = document.getElementById("clearOutput");

    // Get the Output Area
    const outputArea = document.getElementById("output-area");

    // Add event listener to clear output on button click
    clearOutputButton.addEventListener("click", function () {
        outputArea.innerHTML = "";
    });
});

// function to load all customers
document.addEventListener("DOMContentLoaded", function () {
    // Select the Load Customers button and Output Area
    const loadCustomersButton = document.getElementById("loadCustomers");
    const outputArea = document.getElementById("output-area");

    // Function to Load Customers
    loadCustomersButton.addEventListener("click", function () {
        // Clear the output area before fetching new data
        outputArea.innerHTML = "";

        // Send GET request to the backend
        axios.get('/display_all_customers')
            .then(response => {
                if (response.data.all_customers) {
                    // Build customer list
                    const customerList = document.createElement("ul");

                    response.data.all_customers.forEach(customer => {
                        const listItem = document.createElement("li");
                        listItem.innerHTML = `
                            <strong>ID:</strong> ${customer.custid} | 
                            <strong>Name:</strong> ${customer.name} | 
                            <strong>City:</strong> ${customer.city} | 
                            <strong>Age:</strong> ${customer.age} | 
                            <strong>Loan:</strong> ${customer.have_loan ? "Yes" : "No"}
                        `;

                        // Highlight customers with active loans in red
                        if (customer.have_loan) {
                            listItem.style.color = "red";
                        }

                        customerList.appendChild(listItem);
                    });

                    outputArea.appendChild(customerList);
                } else if (response.data.message) {
                    outputArea.innerHTML = `<p>${response.data.message}</p>`;
                }
            })
            .catch(error => {
                console.error("Error loading customers:", error);
                outputArea.innerHTML = `<p style="color: red;">Failed to load customers.</p>`;
            });
    });
});

// function to load all books
document.addEventListener("DOMContentLoaded", function () {
    // Select the Load Books button and Output Area
    const loadBooksButton = document.getElementById("loadBooks");
    const outputArea = document.getElementById("output-area");

    // Function to Load Books
    loadBooksButton.addEventListener("click", function () {
        // Clear the output area before fetching new data
        outputArea.innerHTML = "";

        // Send GET request to the backend
        axios.get('/display_all_books')
            .then(response => {
                if (response.data.all_books) {
                    // Build book list
                    const bookList = document.createElement("ul");

                    response.data.all_books.forEach(book => {
                        const listItem = document.createElement("li");
                        listItem.innerHTML = `
                            <strong>ID:</strong> ${book.bookid} | 
                            <strong>Title:</strong> ${book.name} | 
                            <strong>Author:</strong> ${book.author} | 
                            <strong>Year:</strong> ${book.year_published} | 
                            <strong>Loaned:</strong> ${book.is_loaned ? "Yes" : "No"}
                        `;

                        // Highlight loaned books in red
                        if (book.is_loaned) {
                            listItem.style.color = "red";
                        }

                        bookList.appendChild(listItem);
                    });

                    outputArea.appendChild(bookList);
                } else if (response.data.message) {
                    outputArea.innerHTML = `<p>${response.data.message}</p>`;
                }
            })
            .catch(error => {
                console.error("Error loading books:", error);
                outputArea.innerHTML = `<p style="color: red;">Failed to load books.</p>`;
            });
    });
});


// function to Handle returns,Load Late Loans,Load All Loans
document.addEventListener("DOMContentLoaded", function () {
    // Select buttons and output area
    const loadAllLoansButton = document.getElementById("loadAllLoans");
    const loadLateLoansButton = document.getElementById("loadLateLoans");
    const outputArea = document.getElementById("output-area");

    // Function to Load All Loans
    loadAllLoansButton.addEventListener("click", function () {
        loadLoans("/display_all_loans");
    });

    // Function to Load Late Loans
    loadLateLoansButton.addEventListener("click", function () {
        loadLoans("/display_late_loans");
    });

    // Generic function to fetch loans (all loans or late loans)
    function loadLoans(apiEndpoint) {
        // Clear the output area before fetching new data
        outputArea.innerHTML = "";

        // Send GET request to the backend
        axios.get(apiEndpoint)
            .then(response => {
                const loans = response.data.all_loans || response.data.late_loans;

                if (loans && loans.length > 0) {
                    const loanList = document.createElement("ul");

                    loans.forEach(loan => {
                        const listItem = document.createElement("li");

                        // Loan details
                        listItem.innerHTML = `
                            <strong>Loan ID:</strong> ${loan.loanid} | 
                            <strong>Customer:</strong> ${loan.customer_name} (ID: ${loan.customer_id}) | 
                            <strong>Book:</strong> ${loan.book_name} (ID: ${loan.book_id}) | 
                            <strong>Loan Date:</strong> ${loan.loan_date} | 
                            <strong>Return Date:</strong> <span id="return-date-${loan.loanid}">${loan.return_date ? loan.return_date : "Not Returned"}</span>
                        `;

                        // Highlight active (unreturned) loans in yellow
                        if (!loan.book_returned) {
                            listItem.style.backgroundColor = "yellow";
                        }

                        // Add "Return" button if book is still unreturned
                        if (!loan.book_returned) {
                            const returnButton = document.createElement("button");
                            returnButton.textContent = "Return";
                            returnButton.classList.add("return");
                            returnButton.addEventListener("click", function () {
                                returnBook(loan.loanid);
                            });

                            listItem.appendChild(returnButton);
                        }

                        loanList.appendChild(listItem);
                    });

                    outputArea.appendChild(loanList);
                } else {
                    outputArea.innerHTML = `<p>No loans found.</p>`;
                }
            })
            .catch(error => {
                console.error("Error loading loans:", error);
                outputArea.innerHTML = `<p style="color: red;">Failed to load loans.</p>`;
            });
    }

    // Function to handle returning a book
    function returnBook(loanId) {
        axios.put(`/return_by_loanid/${loanId}`)
            .then(response => {
                alert(response.data.message);

                if (response.data.return_date) {
                    // Update the return date in the UI
                    document.getElementById(`return-date-${loanId}`).textContent = response.data.return_date;
                }

                // Refresh the loan list after returning
                loadAllLoansButton.click();
            })
            .catch(error => {
                console.error("Error returning book:", error);
                alert("Failed to return book.");
            });
    }
});

// Function to find a customer by their ID and refresh the output area
function findCustomerById(customerId) {
    const outputArea = document.getElementById("output-area");

    axios.get(`/Find_costumer_by_name/${customerId}`)
        .then(response => {
            outputArea.innerHTML = ""; // Clear previous output

            if (response.data.customers && response.data.customers.length > 0) {
                const customerList = document.createElement("ul");

                response.data.customers.forEach(customer => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <strong>ID:</strong> ${customer.custid} | 
                        <strong>Name:</strong> ${customer.name} | 
                        <strong>City:</strong> ${customer.city} | 
                        <strong>Age:</strong> ${customer.age} | 
                        <strong>Loan:</strong> ${customer.have_loan ? "Yes" : "No"}
                    `;

                    if (customer.have_loan) {
                        listItem.style.color = "red";
                    }

                    // Add "Loan Book" or "Return Book" buttons dynamically
                    if (!customer.have_loan) {
                        const returnButton = document.createElement("button");
                        returnButton.textContent = "Return Book";
                        returnButton.classList.add("return");
                        returnButton.addEventListener("click", function () {
                            returnBookForCustomer(customer.custid);
                        });

                        listItem.appendChild(returnButton)
                    } else {
                        ;
                    }

                    customerList.appendChild(listItem);
                });

                outputArea.appendChild(customerList);
            } else {
                outputArea.innerHTML = `<p>No customers found.</p>`;
            }
        })
        .catch(error => {
            console.error("Error finding customer:", error);
            outputArea.innerHTML = `<p style="color: red;">Failed to find customer.</p>`;
        });
}

// Function to handle returning a book for a customer
function returnBookForCustomer(customerId) {
    // Step 1: Get active loan by customer ID
    axios.get(`/Find_active_loan_by_customer_id/${customerId}`)
        .then(response => {
            if (response.data.active_loan) {
                const loanId = response.data.active_loan.loanid;

                // Step 2: Send PUT request to return the book
                axios.put(`/return_by_loanid/${loanId}`)
                    .then(returnResponse => {
                        console.log(returnResponse.data.message);
                        alert(returnResponse.data.message);

                        if (returnResponse.data.message === "Book returned successfully!") {
                            // Refresh the customer search to reflect the returned loan
                            findCustomerById(customerId);
                        }
                    })
                    .catch(error => {
                        console.log("Error caught!");
                        console.error("Error returning book:", error);
                        alert("Failed to return book. Please try again.");
                    });
            } else {
                alert("No active loan found for this customer.");
            }
        })
        .catch(error => {
            console.error("Error fetching active loan:", error);
            alert("Failed to find active loan.");
        });
}

// Handle find costumer 
document.addEventListener("DOMContentLoaded", function () {
    // Select Find Customer button and Output Area
    const findCustomerButton = document.getElementById("findCustomer");
    const outputArea = document.getElementById("output-area");

    // Function to handle Find Customer button click
    findCustomerButton.addEventListener("click", function () {
        // Clear the output area before displaying search input
        outputArea.innerHTML = "";

        // Create a search form
        const searchForm = document.createElement("div");
        searchForm.innerHTML = `
            <input type="text" id="customerSearchInput" placeholder="Enter customer name" />
            <button id="searchCustomerButton">Search</button>
        `;
        outputArea.appendChild(searchForm);

        // Add event listener to search button
        document.getElementById("searchCustomerButton").addEventListener("click", function () {
            const customerName = document.getElementById("customerSearchInput").value.trim();

            if (customerName === "") {
                alert("Please enter a customer name.");
                return;
            }

            // Send GET request to search for customer
            axios.get(`/Find_costumer_by_name/${customerName}`)
                .then(response => {
                    outputArea.innerHTML = ""; // Clear previous output

                    if (response.data.customers && response.data.customers.length > 0) {
                        const customerList = document.createElement("ul");

                        response.data.customers.forEach(customer => {
                            const listItem = document.createElement("li");
                            listItem.innerHTML = `
                                <strong>ID:</strong> ${customer.custid} | 
                                <strong>Name:</strong> ${customer.name} | 
                                <strong>City:</strong> ${customer.city} | 
                                <strong>Age:</strong> ${customer.age} | 
                                <strong>Loan:</strong> ${customer.have_loan ? "Yes" : "No"}
                            `;

                            // Highlight customers with active loans in red
                            if (customer.have_loan) {
    listItem.style.color = "red";
    const returnButton = document.createElement("button");
    returnButton.textContent = "Return Book";
    returnButton.classList.add("return");
    returnButton.addEventListener("click", function () {
        returnBookForCustomer(customer.custid);
    });
    listItem.appendChild(returnButton);
}

                            customerList.appendChild(listItem);
                        });

                        outputArea.appendChild(customerList);
                    } else {
                        outputArea.innerHTML = `<p>No customers found.</p>`;
                    }
                })
                .catch(error => {
                    console.error("Error finding customer:", error);
                    outputArea.innerHTML = `<p style="color: red;">Failed to find customer.</p>`;
                });
        });
    });

    // Function to handle returning a book for a customer
    function returnBookForCustomer(customerId) {
        // Step 1: Get active loan by customer ID
        axios.get(`/Find_active_loan_by_customer_id/${customerId}`)
            .then(response => {
                if (response.data.active_loan) {
                    const loanId = response.data.active_loan.loanid;

                    // Step 2: Send PUT request to return the book
                    axios.put(`/return_by_loanid/${loanId}`)
                        .then(returnResponse => {
                            console.log(returnResponse.data.message);
                            alert(returnResponse.data.message);

                            if (returnResponse.data.message === "Book returned successfully!") {
                                // Instead of clicking the button, we manually re-run the search with the same customerId
                                findCustomerById(customerId);
                            }
                        })
                        .catch(error => {
                            console.log("Error caught!");
                            console.error("Error returning book:", error);
                            alert("Failed to return book. Please try again.");
                        });
                } else {
                    alert("No active loan found for this customer.");
                }
            })
            .catch(error => {
                console.error("Error fetching active loan:", error);
                alert("Failed to find active loan.");
            });
    }

});





// Handle Find book
document.addEventListener("DOMContentLoaded", function () {
    // Select Find Book button and Output Area
    const findBookButton = document.getElementById("findBook");
    const outputArea = document.getElementById("output-area");

    // Function to handle Find Book button click
    findBookButton.addEventListener("click", function () {
        // Clear the output area before displaying search input
        outputArea.innerHTML = "";

        // Create a search form
        const searchForm = document.createElement("div");
        searchForm.innerHTML = `
            <input type="text" id="bookSearchInput" placeholder="Enter book name" />
            <button id="searchBookButton">Search</button>
        `;
        outputArea.appendChild(searchForm);

        // Add event listener to search button
        document.getElementById("searchBookButton").addEventListener("click", function () {
            const bookName = document.getElementById("bookSearchInput").value.trim();

            if (bookName === "") {
                alert("Please enter a book name.");
                return;
            }

            // Send GET request to search for book
            axios.get(`/Find_books_by_name/${bookName}`)
                .then(response => {
                    outputArea.innerHTML = ""; // Clear previous output

                    if (response.data.books && response.data.books.length > 0) {
                        const bookList = document.createElement("ul");

                        response.data.books.forEach(book => {
                            const listItem = document.createElement("li");
                            listItem.innerHTML = `
                                <strong>ID:</strong> ${book.bookid} | 
                                <strong>Title:</strong> ${book.name} | 
                                <strong>Author:</strong> ${book.author} | 
                                <strong>Year:</strong> ${book.year_published} | 
                                <strong>Type:</strong> ${book.book_type} | 
                                <strong>Loaned:</strong> ${book.is_loaned ? "Yes" : "No"}
                            `;

                            // Highlight loaned books in red
                            if (book.is_loaned) {
                                listItem.style.color = "red";
                            }

                            bookList.appendChild(listItem);
                        });

                        outputArea.appendChild(bookList);
                    } else {
                        outputArea.innerHTML = `<p>No books found.</p>`;
                    }
                })
                .catch(error => {
                    console.error("Error finding book:", error);
                    outputArea.innerHTML = `<p style="color: red;">Failed to find book.</p>`;
                });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const createLoanButton = document.getElementById("createLoan");
    const outputArea = document.getElementById("output-area");

    createLoanButton.addEventListener("click", function () {
        // Clear the output area
        outputArea.innerHTML = "";

        // Create container div for the two sections
        const loanContainer = document.createElement("div");
        loanContainer.style.display = "flex";
        loanContainer.style.justifyContent = "space-between";
        loanContainer.style.padding = "20px";

        // Left side - Search Customer
        const customerDiv = document.createElement("div");
        customerDiv.style.width = "45%";
        customerDiv.innerHTML = `
            <label for="customerSearch">Search Customer:</label>
            <input type="text" id="customerSearch" placeholder="Enter customer name">
            <button id="searchCustomerButton">Find Customer</button>
        `;

        // Right side - Search Book
        const bookDiv = document.createElement("div");
        bookDiv.style.width = "45%";
        bookDiv.innerHTML = `
            <label for="bookSearch">Search Book:</label>
            <input type="text" id="bookSearch" placeholder="Enter book name">
            <button id="searchBookButton">Find Book</button>
        `;

        // Append sections to the container
        loanContainer.appendChild(customerDiv);
        loanContainer.appendChild(bookDiv);

        // Append container to the output area
        outputArea.appendChild(loanContainer);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("createLoan").addEventListener("click", function () {
        setTimeout(() => {
            const searchCustomerButton = document.getElementById("searchCustomerButton");
            
            searchCustomerButton.addEventListener("click", function () {
                const customerName = document.getElementById("customerSearch").value.trim();
                if (customerName === "") {
                    alert("Please enter a customer name.");
                    return;
                }

                axios.get(`/Find_costumer_by_name/${customerName}`)
                    .then(response => {
                        let resultDiv = document.getElementById("customerResults");
                        if (!resultDiv) {
                            resultDiv = document.createElement("div");
                            resultDiv.id = "customerResults";
                            searchCustomerButton.parentElement.appendChild(resultDiv);
                        }
                        resultDiv.innerHTML = "<h3>Search Results:</h3>";

                        if (response.data.customers && response.data.customers.length > 0) {
                            const customerList = document.createElement("ul");

                            response.data.customers.forEach(customer => {
                                const listItem = document.createElement("li");
                                listItem.innerHTML = `
                                    <strong>ID:</strong> ${customer.custid} |
                                    <strong>Name:</strong> ${customer.name} |
                                    <strong>City:</strong> ${customer.city} |
                                    <strong>Age:</strong> ${customer.age} |
                                    <strong>Loan:</strong> ${customer.have_loan ? "Yes" : "No"}
                                `;

                                // Add "Select" button if customer does not have a loan
                                if (!customer.have_loan) {
                                    const selectButton = document.createElement("button");
                                    selectButton.textContent = "Select";
                                    listItem.appendChild(selectButton);
                                }

                                customerList.appendChild(listItem);
                            });

                            resultDiv.appendChild(customerList);
                        } else {
                            resultDiv.innerHTML += "<p>Customer not found!</p>";
                        }
                    })
                    .catch(error => {
                        console.error("Error finding customer:", error);
                        document.getElementById("customerResults").innerHTML = "<p style='color: red;'>Failed to find customer.</p>";
                    });
            });
        }, 100);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("createLoan").addEventListener("click", function () {
        setTimeout(() => {
            const searchCustomerButton = document.getElementById("searchCustomerButton");
            
            searchCustomerButton.addEventListener("click", function () {
                const customerName = document.getElementById("customerSearch").value.trim();
                if (customerName === "") {
                    alert("Please enter a customer name.");
                    return;
                }

                axios.get(`/Find_costumer_by_name/${customerName}`)
                    .then(response => {
                        let resultDiv = document.getElementById("customerResults");
                        if (!resultDiv) {
                            resultDiv = document.createElement("div");
                            resultDiv.id = "customerResults";
                            searchCustomerButton.parentElement.appendChild(resultDiv);
                        }
                        resultDiv.innerHTML = "<h3>Search Results:</h3>";

                        if (response.data.customers && response.data.customers.length > 0) {
                            const customerList = document.createElement("ul");

                            response.data.customers.forEach(customer => {
                                const listItem = document.createElement("li");
                                listItem.innerHTML = `
                                    <strong>ID:</strong> ${customer.custid} |
                                    <strong>Name:</strong> ${customer.name} |
                                    <strong>City:</strong> ${customer.city} |
                                    <strong>Age:</strong> ${customer.age} |
                                    <strong>Loan:</strong> ${customer.have_loan ? "Yes" : "No"}
                                `;

                                // Add "Select" button if customer does not have a loan
                                if (!customer.have_loan) {
                                    const selectButton = document.createElement("button");
                                    selectButton.textContent = "Select";
                                    selectButton.addEventListener("click", function () {
                                        document.getElementById("customerSearch").value = `Selected Customer ID ${customer.custid}`;
                                        document.getElementById("searchCustomerButton").disabled = true;
checkSelectionComplete();
                                    });
                                    listItem.appendChild(selectButton);
                                }

                                customerList.appendChild(listItem);
                            });

                            resultDiv.appendChild(customerList);
                        } else {
                            resultDiv.innerHTML += "<p>Customer not found!</p>";
                        }
                    })
                    .catch(error => {
                        console.error("Error finding customer:", error);
                        document.getElementById("customerResults").innerHTML = "<p style='color: red;'>Failed to find customer.</p>";
                    });
            });
        }, 100);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("createLoan").addEventListener("click", function () {
        setTimeout(() => {
            const searchBookButton = document.getElementById("searchBookButton");
            
            searchBookButton.addEventListener("click", function () {
                const bookName = document.getElementById("bookSearch").value.trim();
                if (bookName === "") {
                    alert("Please enter a book name.");
                    return;
                }

                axios.get(`/Find_books_by_name/${bookName}`)
                    .then(response => {
                        let resultDiv = document.getElementById("bookResults");
                        if (!resultDiv) {
                            resultDiv = document.createElement("div");
                            resultDiv.id = "bookResults";
                            searchBookButton.parentElement.appendChild(resultDiv);
                        }
                        resultDiv.innerHTML = "<h3>Search Results:</h3>";

                        if (response.data.books && response.data.books.length > 0) {
                            const bookList = document.createElement("ul");

                            response.data.books.forEach(book => {
                                const listItem = document.createElement("li");
                                listItem.innerHTML = `
                                    <strong>ID:</strong> ${book.bookid} |
                                    <strong>Title:</strong> ${book.name} |
                                    <strong>Author:</strong> ${book.author} |
                                    <strong>Year:</strong> ${book.year_published} |
                                    <strong>Type:</strong> ${book.book_type} |
                                    <strong>Loaned:</strong> ${book.is_loaned ? "Yes" : "No"}
                                `;

                                // Add "Select" button if book is not loaned
                                if (!book.is_loaned) {
                                    const selectButton = document.createElement("button");
                                    selectButton.textContent = "Select";
                                    listItem.appendChild(selectButton);
                                }

                                bookList.appendChild(listItem);
                            });

                            resultDiv.appendChild(bookList);
                        } else {
                            resultDiv.innerHTML += "<p>Books not found!</p>";
                        }
                    })
                    .catch(error => {
                        console.error("Error finding book:", error);
                        document.getElementById("bookResults").innerHTML = "<p style='color: red;'>Failed to find book.</p>";
                    });
            });
        }, 100);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("createLoan").addEventListener("click", function () {
        setTimeout(() => {
            const searchBookButton = document.getElementById("searchBookButton");
            
            searchBookButton.addEventListener("click", function () {
                const bookName = document.getElementById("bookSearch").value.trim();
                if (bookName === "") {
                    alert("Please enter a book name.");
                    return;
                }

                axios.get(`/Find_books_by_name/${bookName}`)
                    .then(response => {
                        let resultDiv = document.getElementById("bookResults");
                        if (!resultDiv) {
                            resultDiv = document.createElement("div");
                            resultDiv.id = "bookResults";
                            searchBookButton.parentElement.appendChild(resultDiv);
                        }
                        resultDiv.innerHTML = "<h3>Search Results:</h3>";

                        if (response.data.books && response.data.books.length > 0) {
                            const bookList = document.createElement("ul");

                            response.data.books.forEach(book => {
                                const listItem = document.createElement("li");
                                listItem.innerHTML = `
                                    <strong>ID:</strong> ${book.bookid} |
                                    <strong>Title:</strong> ${book.name} |
                                    <strong>Author:</strong> ${book.author} |
                                    <strong>Year:</strong> ${book.year_published} |
                                    <strong>Type:</strong> ${book.book_type} |
                                    <strong>Loaned:</strong> ${book.is_loaned ? "Yes" : "No"}
                                `;

                                // Add "Select" button if book is not loaned
                                if (!book.is_loaned) {
                                    const selectButton = document.createElement("button");
                                    selectButton.textContent = "Select";
                                    selectButton.addEventListener("click", function () {
                                        document.getElementById("bookSearch").value = `Selected Book ID ${book.bookid}`;
                                        document.getElementById("searchBookButton").disabled = true;
checkSelectionComplete();
                                    });
                                    listItem.appendChild(selectButton);
                                }

                                bookList.appendChild(listItem);
                            });

                            resultDiv.appendChild(bookList);
                        } else {
                            resultDiv.innerHTML += "<p>Books not found!</p>";
                        }
                    })
                    .catch(error => {
                        console.error("Error finding book:", error);
                        document.getElementById("bookResults").innerHTML = "<p style='color: red;'>Failed to find book.</p>";
                    });
            });
        }, 100);
    });
});


function checkSelectionComplete() {
    const customerButtonDisabled = document.getElementById("searchCustomerButton").disabled;
    const bookButtonDisabled = document.getElementById("searchBookButton").disabled;

    if (customerButtonDisabled && bookButtonDisabled) {
        const custid = document.getElementById("customerSearch").value.replace("Selected Customer ID ", "").trim();
        const bookid = document.getElementById("bookSearch").value.replace("Selected Book ID ", "").trim();
        console.log(`Customer ID ${custid}  Book ID ${bookid}`);
    }
}


function checkSelectionComplete() {
    const customerButtonDisabled = document.getElementById("searchCustomerButton").disabled;
    const bookButtonDisabled = document.getElementById("searchBookButton").disabled;

    if (customerButtonDisabled && bookButtonDisabled) {
        const custid = document.getElementById("customerSearch").value.replace("Selected Customer ID ", "").trim();
        const bookid = document.getElementById("bookSearch").value.replace("Selected Book ID ", "").trim();

        axios.post('/create_loan', {
            book_id: bookid,
            customer_id: custid
        })
        .then(response => {
            alert(response.data.message);
            if (response.data.return_date) {
                alert("Return Date: " + response.data.return_date);
            }
        })
        .catch(error => {
            console.error("Error creating loan:", error);
            alert("Failed to create loan. Please try again.");
        });
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const createCustomerButton = document.getElementById("createCustomer");
    const outputArea = document.getElementById("output-area");

    createCustomerButton.addEventListener("click", function () {
        // Clear the output area
        outputArea.innerHTML = "";

        // Create form container
        const formContainer = document.createElement("div");
        formContainer.style.display = "flex";
        formContainer.style.flexDirection = "column";
        formContainer.style.gap = "10px";
        formContainer.style.padding = "20px";
        formContainer.style.border = "1px solid black";
        formContainer.style.width = "300px";
        formContainer.style.margin = "auto";

        // Name field
        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Name";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.id = "customerName";

        // City field
        const cityLabel = document.createElement("label");
        cityLabel.textContent = "City";
        const cityInput = document.createElement("input");
        cityInput.type = "text";
        cityInput.id = "customerCity";

        // Age field
        const ageLabel = document.createElement("label");
        ageLabel.textContent = "Age";
        const ageInput = document.createElement("input");
        ageInput.type = "number";
        ageInput.id = "customerAge";

        // Create button
        const createButton = document.createElement("button");
        createButton.textContent = "Create";
        createButton.id = "confirmCreateCustomer";
        createButton.disabled = true; // Initially disabled

        // Append elements to container
        formContainer.appendChild(nameLabel);
        formContainer.appendChild(nameInput);
        formContainer.appendChild(cityLabel);
        formContainer.appendChild(cityInput);
        formContainer.appendChild(ageLabel);
        formContainer.appendChild(ageInput);
        formContainer.appendChild(createButton);

        // Append container to output area
        outputArea.appendChild(formContainer);

        // Enable "Create" button only when all inputs are filled
        function checkInputs() {
            createButton.disabled = !(nameInput.value.trim() && cityInput.value.trim() && ageInput.value.trim());
        }

        nameInput.addEventListener("input", checkInputs);
        cityInput.addEventListener("input", checkInputs);
        ageInput.addEventListener("input", checkInputs);

        // Handle "Create" button click
        createButton.addEventListener("click", function () {
            const customerData = {
                name: nameInput.value.trim(),
                city: cityInput.value.trim(),
                age: parseInt(ageInput.value.trim())
            };

            axios.post('/add_customer', customerData)
                .then(response => {
                    alert(response.data.message);
                })
                .catch(error => {
                    console.error("Error adding customer:", error);
                    alert("Failed to add customer. Please try again.");
                });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const deleteCustomerButton = document.getElementById("deleteCustomer");
    const outputArea = document.getElementById("output-area");

    deleteCustomerButton.addEventListener("click", function () {
        // Clear the output area
        outputArea.innerHTML = "";

        // Create container for delete functionality
        const deleteContainer = document.createElement("div");
        deleteContainer.style.display = "flex";
        deleteContainer.style.flexDirection = "column";
        deleteContainer.style.gap = "10px";
        deleteContainer.style.padding = "20px";
        deleteContainer.style.border = "1px solid black";
        deleteContainer.style.width = "300px";
        deleteContainer.style.margin = "auto";

        // Label and input field
        const label = document.createElement("label");
        label.textContent = "Customer to delete";

        const input = document.createElement("input");
        input.type = "text";
        input.id = "deleteCustomerInput";

        // Find button
        const findButton = document.createElement("button");
        findButton.textContent = "Find";
        findButton.id = "findCustomerButton";
        findButton.disabled = true;

        // Append elements to container
        deleteContainer.appendChild(label);
        deleteContainer.appendChild(input);
        deleteContainer.appendChild(findButton);

        // Append container to output area
        outputArea.appendChild(deleteContainer);

        // Enable "Find" button when input is filled
        input.addEventListener("input", function () {
            findButton.disabled = input.value.trim() === "";
        });

        // Handle "Find" button click
        findButton.addEventListener("click", function () {
            const customerName = input.value.trim();
            if (customerName === "") {
                alert("Please enter a customer name.");
                return;
            }

            axios.get(`/Find_costumer_by_name/${customerName}`)
                .then(response => {
                    let resultDiv = document.getElementById("deleteResults");
                    if (!resultDiv) {
                        resultDiv = document.createElement("div");
                        resultDiv.id = "deleteResults";
                        deleteContainer.appendChild(resultDiv);
                    }
                    resultDiv.innerHTML = "<h3>Search Results:</h3>";

                    if (response.data.customers && response.data.customers.length > 0) {
                        const customerList = document.createElement("ul");

                        response.data.customers.forEach(customer => {
                            const listItem = document.createElement("li");
                            listItem.innerHTML = `
                                <strong>ID:</strong> ${customer.custid} |
                                <strong>Name:</strong> ${customer.name} |
                                <strong>City:</strong> ${customer.city} |
                                <strong>Age:</strong> ${customer.age} |
                                <strong>Loan:</strong> ${customer.have_loan ? "Yes" : "No"}
                            `;

                            // Add "Del" button if customer does not have a loan
                            if (!customer.have_loan) {
                                const deleteButton = document.createElement("button");
                                deleteButton.textContent = "Del";
                                deleteButton.addEventListener("click", function () {
                                    axios.delete(`/delete_customer/${customer.custid}`)
                                        .then(deleteResponse => {
                                            alert(deleteResponse.data.message);
                                            if (deleteResponse.data.message === "Customer deleted successfully!") {
                                                listItem.remove(); // Remove customer from the list after deletion
                                            }
                                        })
                                        .catch(error => {
                                            console.error("Error deleting customer:", error);
                                            alert("Failed to delete customer.");
                                        });
                                });
                                listItem.appendChild(deleteButton);
                            }

                            customerList.appendChild(listItem);
                        });

                        resultDiv.appendChild(customerList);
                    } else {
                        resultDiv.innerHTML += "<p>Customer not found!</p>";
                    }
                })
                .catch(error => {
                    console.error("Error finding customer:", error);
                    document.getElementById("deleteResults").innerHTML = "<p style='color: red;'>Failed to find customer.</p>";
                });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const addBookButton = document.getElementById("addBook");
    const outputArea = document.getElementById("output-area");

    addBookButton.addEventListener("click", function () {
        // Clear the output area
        outputArea.innerHTML = "";

        // Create form container
        const formContainer = document.createElement("div");
        formContainer.style.display = "flex";
        formContainer.style.flexDirection = "column";
        formContainer.style.gap = "10px";
        formContainer.style.padding = "20px";
        formContainer.style.border = "1px solid black";
        formContainer.style.width = "300px";
        formContainer.style.margin = "auto";

        // Name field
        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Name";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.id = "bookName";

        // Author field
        const authorLabel = document.createElement("label");
        authorLabel.textContent = "Author";
        const authorInput = document.createElement("input");
        authorInput.type = "text";
        authorInput.id = "bookAuthor";

        // Year Published field
        const yearLabel = document.createElement("label");
        yearLabel.textContent = "Year Published";
        const yearInput = document.createElement("input");
        yearInput.type = "number";
        yearInput.id = "bookYear";

        // Book Type Dropdown
        const typeLabel = document.createElement("label");
        typeLabel.textContent = "Book Type (opt)";
        const typeSelect = document.createElement("select");
        typeSelect.id = "bookType";
        const blankOption = new Option("", "");
        const option1 = new Option("1", "1");
        const option2 = new Option("2", "2");
        const option3 = new Option("3", "3");
        typeSelect.appendChild(blankOption);
        typeSelect.appendChild(option1);
        typeSelect.appendChild(option2);
        typeSelect.appendChild(option3);

        // Add Button
        const addButton = document.createElement("button");
        addButton.textContent = "Add";
        addButton.id = "confirmAddBook";
        addButton.disabled = true; // Initially disabled

        // Append elements to container
        formContainer.appendChild(nameLabel);
        formContainer.appendChild(nameInput);
        formContainer.appendChild(authorLabel);
        formContainer.appendChild(authorInput);
        formContainer.appendChild(yearLabel);
        formContainer.appendChild(yearInput);
        formContainer.appendChild(typeLabel);
        formContainer.appendChild(typeSelect);
        formContainer.appendChild(addButton);

        // Append container to output area
        outputArea.appendChild(formContainer);

        // Enable "Add" button only when required inputs are filled
        function checkInputs() {
            addButton.disabled = !(nameInput.value.trim() && authorInput.value.trim() && yearInput.value.trim());
        }

        nameInput.addEventListener("input", checkInputs);
        authorInput.addEventListener("input", checkInputs);
        yearInput.addEventListener("input", checkInputs);

        // Handle "Add" button click
        addButton.addEventListener("click", function () {
            const bookData = {
                name: nameInput.value.trim(),
                author: authorInput.value.trim(),
                year: parseInt(yearInput.value.trim())
            };

            // Include book type only if selected
            if (typeSelect.value !== "") {
                bookData.booktype = parseInt(typeSelect.value);
            }

            axios.post('/add_book', bookData)
                .then(response => {
                    alert(response.data.message);
                })
                .catch(error => {
                    console.error("Error adding book:", error);
                    alert("Failed to add book. Please try again.");
                });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const deleteBookButton = document.getElementById("deleteBook");
    const outputArea = document.getElementById("output-area");

    deleteBookButton.addEventListener("click", function () {
        // Clear the output area
        outputArea.innerHTML = "";

        // Create container for delete functionality
        const deleteContainer = document.createElement("div");
        deleteContainer.style.display = "flex";
        deleteContainer.style.flexDirection = "column";
        deleteContainer.style.gap = "10px";
        deleteContainer.style.padding = "20px";
        deleteContainer.style.border = "1px solid black";
        deleteContainer.style.width = "300px";
        deleteContainer.style.margin = "auto";

        // Label and input field
        const label = document.createElement("label");
        label.textContent = "Book to delete";

        const input = document.createElement("input");
        input.type = "text";
        input.id = "deleteBookInput";

        // Find button
        const findButton = document.createElement("button");
        findButton.textContent = "Find";
        findButton.id = "findBookButton";
        findButton.disabled = true;

        // Append elements to container
        deleteContainer.appendChild(label);
        deleteContainer.appendChild(input);
        deleteContainer.appendChild(findButton);

        // Append container to output area
        outputArea.appendChild(deleteContainer);

        // Enable "Find" button when input is filled
        input.addEventListener("input", function () {
            findButton.disabled = input.value.trim() === "";
        });

        // Handle "Find" button click
        findButton.addEventListener("click", function () {
            const bookName = input.value.trim();
            if (bookName === "") {
                alert("Please enter a book name.");
                return;
            }

            axios.get(`/Find_books_by_name/${bookName}`)
                .then(response => {
                    let resultDiv = document.getElementById("deleteBookResults");
                    if (!resultDiv) {
                        resultDiv = document.createElement("div");
                        resultDiv.id = "deleteBookResults";
                        deleteContainer.appendChild(resultDiv);
                    }
                    resultDiv.innerHTML = "<h3>Search Results:</h3>";

                    if (response.data.books && response.data.books.length > 0) {
                        const bookList = document.createElement("ul");

                        response.data.books.forEach(book => {
                            const listItem = document.createElement("li");
                            listItem.innerHTML = `
                                <strong>ID:</strong> ${book.bookid} |
                                <strong>Title:</strong> ${book.name} |
                                <strong>Author:</strong> ${book.author} |
                                <strong>Year:</strong> ${book.year_published} |
                                <strong>Type:</strong> ${book.book_type} |
                                <strong>Loaned:</strong> ${book.is_loaned ? "Yes" : "No"}
                            `;

                            // Add "Del" button if book is not loaned
                            if (!book.is_loaned) {
                                const deleteButton = document.createElement("button");
                                deleteButton.textContent = "Del";
                                deleteButton.addEventListener("click", function () {
                                    axios.delete(`/delete_book/${book.bookid}`)
                                        .then(deleteResponse => {
                                            alert(deleteResponse.data.message);
                                            if (deleteResponse.data.message === "Book deleted successfully!") {
                                                listItem.remove(); // Remove book from the list after deletion
                                            }
                                        })
                                        .catch(error => {
                                            console.error("Error deleting book:", error);
                                            alert("Failed to delete book.");
                                        });
                                });
                                listItem.appendChild(deleteButton);
                            }

                            bookList.appendChild(listItem);
                        });

                        resultDiv.appendChild(bookList);
                    } else {
                        resultDiv.innerHTML += "<p>Books not found!</p>";
                    }
                })
                .catch(error => {
                    console.error("Error finding book:", error);
                    document.getElementById("deleteBookResults").innerHTML = "<p style='color: red;'>Failed to find book.</p>";
                });
        });
    });
});
