package repositories

import (
	"bookstore/internal/models"
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BookRepository defines the interface for book operations
type BookRepository interface {
	Create(ctx context.Context, book *models.Book) (*models.Book, error)
	GetAll(ctx context.Context) ([]models.Book, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error)
	Update(ctx context.Context, id uuid.UUID, updateData models.Book) (*models.Book, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// bookRepository is the GORM implementation of BookRepository
type bookRepository struct {
	db *gorm.DB
}

// NewBookRepository creates a new BookRepository
func NewBookRepository(db *gorm.DB) BookRepository {
	return &bookRepository{db: db}
}

// Create a new book and preload the Category
func (r *bookRepository) Create(ctx context.Context, book *models.Book) (*models.Book, error) {
	if err := r.db.WithContext(ctx).Create(book).Error; err != nil {
		return nil, err
	}

	// Reload the book with category info
	if err := r.db.WithContext(ctx).Preload("Category").First(book, "id = ?", book.ID).Error; err != nil {
		return nil, err
	}

	return book, nil
}

// GetAll returns all books with their categories preloaded
func (r *bookRepository) GetAll(ctx context.Context) ([]models.Book, error) {
	var books []models.Book
	if err := r.db.WithContext(ctx).Preload("Category").Find(&books).Error; err != nil {
		return nil, err
	}
	return books, nil
}

// GetByID returns a single book by ID with category preloaded
func (r *bookRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error) {
	var book models.Book
	if err := r.db.WithContext(ctx).Preload("Category").First(&book, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &book, nil
}

// Update updates a book and reloads the category
func (r *bookRepository) Update(ctx context.Context, id uuid.UUID, updateData models.Book) (*models.Book, error) {
	var book models.Book
	if err := r.db.WithContext(ctx).First(&book, "id = ?", id).Error; err != nil {
		return nil, err
	}

	book.Title = updateData.Title
	book.Author = updateData.Author
	book.Price = updateData.Price
	book.Stock = updateData.Stock
	book.Description = updateData.Description
	book.CategoryID = updateData.CategoryID

	if err := r.db.WithContext(ctx).Save(&book).Error; err != nil {
		return nil, err
	}

	// Reload the book with category info
	if err := r.db.WithContext(ctx).Preload("Category").First(&book, "id = ?", book.ID).Error; err != nil {
		return nil, err
	}

	return &book, nil
}

// Delete removes a book by ID
func (r *bookRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Book{}, "id = ?", id).Error
}
