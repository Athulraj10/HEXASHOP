# HexaShop E-Commerce Website

HexaShop is a full-fledged e-commerce website developed using Node.js, Express, Bootstrap, EJS, and other technologies. It provides an intuitive platform for buying and selling various products.

## Features

- **User Authentication:** User registration and authentication with secure password hashing.
- **Product Management:** Browse, search, and view detailed product information.
- **Shopping Cart:** Add products to the cart, modify quantities, and proceed to checkout.
- **Order Processing:** Secure and streamlined checkout process with order history.
- **Admin Dashboard:** Manage products, orders, and user accounts from an admin dashboard.
- **Responsive Design:** Bootstrap-based frontend ensuring compatibility across devices.

## Technologies Used

- **Backend:** Node.js, Express.js, MongoDB (with Mongoose)
- **Frontend:** EJS (Embedded JavaScript), Bootstrap
- **Authentication:** JSON Web Tokens (JWT)
- **Other Libraries:** Express-validator, Bcrypt, etc.

```
## File Structure

hexashop/
│
├── config/
│ └── keys.js
│
├── controllers/
│ ├── authController.js
│ ├── productController.js
│ ├── orderController.js
│ └── adminController.js
│
├── models/
│ ├── User.js
│ ├── Product.js
│ └── Order.js
│
├── routes/
│ ├── authRoutes.js
│ ├── productRoutes.js
│ ├── orderRoutes.js
│ └── adminRoutes.js
│
├── views/
│ ├── index.ejs
│ ├── cart.ejs
│ ├── product.ejs
│ ├── checkout.ejs
│ ├── login.ejs
│ ├── register.ejs
│ ├── adminDashboard.ejs
│ └── adminProductManagement.ejs
│
├── public/
│ ├── css/
│ ├── js/
│ └── images/
│
├── app.js
└── package.json
```

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Athulraj10/HEXASHOP
   cd hexashop
   
2. **npm install
    Access the application in your browser at: http://localhost:3000




Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please feel free to create a pull request or raise an issue on the repository.
