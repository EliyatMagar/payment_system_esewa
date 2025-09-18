package services

import (
	"bookstore/internal/models"
	"bookstore/internal/repositories"
	"context"

	"github.com/google/uuid"
)

type BookService interface {
	CreateBook(ctx context.Context, book *models.Book) (*models.Book, error)
	GetAllBooks(ctx context.Context) ([]models.Book, error)
	GetBookByID(ctx context.Context, id uuid.UUID) (*models.Book, error)
	UpdateBook(ctx context.Context, id uuid.UUID, updateData models.Book) (*models.Book, error)
	DeleteBook(ctx context.Context, id uuid.UUID) error
}

type bookService struct {
	repo repositories.BookRepository
}

func NewBookService(repo repositories.BookRepository) BookService {
	return &bookService{repo: repo}
}

func (s *bookService) CreateBook(ctx context.Context, book *models.Book) (*models.Book, error) {
	return s.repo.Create(ctx, book)
}

func (s *bookService) GetAllBooks(ctx context.Context) ([]models.Book, error) {
	return s.repo.GetAll(ctx)
}

func (s *bookService) GetBookByID(ctx context.Context, id uuid.UUID) (*models.Book, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *bookService) UpdateBook(ctx context.Context, id uuid.UUID, updateData models.Book) (*models.Book, error) {
	return s.repo.Update(ctx, id, updateData)
}

func (s *bookService) DeleteBook(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
