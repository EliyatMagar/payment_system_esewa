package services

import (
	"bookstore/internal/models"
	"bookstore/internal/repositories"
	"context"

	"github.com/google/uuid"
)

type CategoryService interface {
	CreateCategory(ctx context.Context, category *models.Category) (*models.Category, error)
	GetAllCategories(ctx context.Context) ([]models.Category, error)
	GetCategoryByID(ctx context.Context, id uuid.UUID) (*models.Category, error)
	UpdateCategory(ctx context.Context, id uuid.UUID, updateData models.Category) (*models.Category, error)
	DeleteCategory(ctx context.Context, id uuid.UUID) error
}

type categoryService struct {
	repo repositories.CategoryRepository
}

func NewCategoryService(repo repositories.CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) CreateCategory(ctx context.Context, category *models.Category) (*models.Category, error) {
	return s.repo.Create(ctx, category)
}

func (s *categoryService) GetAllCategories(ctx context.Context) ([]models.Category, error) {
	return s.repo.GetAll(ctx)
}

func (s *categoryService) GetCategoryByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *categoryService) UpdateCategory(ctx context.Context, id uuid.UUID, updateData models.Category) (*models.Category, error) {
	return s.repo.Update(ctx, id, updateData)
}

func (s *categoryService) DeleteCategory(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
