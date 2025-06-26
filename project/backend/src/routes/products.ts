import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Mock products database
const products = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 199.99,
    originalPrice: 299.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
    rating: 4.8,
    reviews: 124,
    category: 'Electronics',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    inStock: true,
    stock: 50,
    specifications: {
      brand: 'AudioTech',
      model: 'AT-WH1000',
      color: 'Black',
      weight: '250g',
    },
    reviews_data: [
      {
        id: '1',
        user: 'John Doe',
        rating: 5,
        comment: 'Excellent sound quality and comfortable to wear.',
        date: '2024-01-15',
      },
    ],
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 249.99,
    originalPrice: 349.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500',
    rating: 4.7,
    reviews: 89,
    category: 'Electronics',
    description: 'Advanced fitness tracking with heart rate monitor, GPS, and 7-day battery life.',
    inStock: true,
    stock: 30,
    specifications: {
      brand: 'FitTech',
      model: 'FT-SW200',
      color: 'Space Gray',
      display: '1.4" AMOLED',
    },
    reviews_data: [],
  },
];

// Get all products with filtering, sorting, and pagination
router.get('/', (req, res) => {
  try {
    let filteredProducts = [...products];
    
    // Filter by category
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase().includes((req.query.category as string).toLowerCase())
      );
    }

    // Filter by search query
    if (req.query.search) {
      const searchTerm = (req.query.search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by price range
    if (req.query.minPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= parseFloat(req.query.minPrice as string)
      );
    }
    if (req.query.maxPrice) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= parseFloat(req.query.maxPrice as string)
      );
    }

    // Filter by rating
    if (req.query.minRating) {
      filteredProducts = filteredProducts.filter(product =>
        product.rating >= parseFloat(req.query.minRating as string)
      );
    }

    // Sort products
    const sortBy = req.query.sortBy as string || 'featured';
    switch (sortBy) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // For demo purposes, reverse the order
        filteredProducts.reverse();
        break;
      default:
        // Keep original order for 'featured'
        break;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      totalProducts: filteredProducts.length,
      currentPage: page,
      totalPages: Math.ceil(filteredProducts.length / limit),
      hasNextPage: endIndex < filteredProducts.length,
      hasPrevPage: startIndex > 0,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = [...new Set(products.map(product => product.category))];
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add new product (Admin only)
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      image,
      category,
      description,
      stock,
      specifications,
    } = req.body;

    const newProduct = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      image,
      rating: 0,
      reviews: 0,
      category,
      description,
      inStock: stock > 0,
      stock: parseInt(stock),
      specifications: specifications || {},
      reviews_data: [],
    };

    products.push(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
    };

    products[productIndex] = updatedProduct;

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products.splice(productIndex, 1);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;