package repositories

import (
	"bookstore/internal/models"
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderRepository interface {
	Create(ctx context.Context, order *models.Order) (*models.Order, error)
	GetAll(ctx context.Context) ([]models.Order, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) (*models.Order, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) (*models.Order, error) {
	if err := r.db.WithContext(ctx).Create(order).Error; err != nil {
		return nil, err
	}

	// Preload User and Items → Book
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Items").
		Preload("Items.Book").
		First(order, "id = ?", order.ID).Error; err != nil {
		return nil, err
	}

	return order, nil
}

func (r *orderRepository) GetAll(ctx context.Context) ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Items").
		Preload("Items.Book").
		Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *orderRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	var order models.Order
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Items").
		Preload("Items.Book").
		First(&order, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) (*models.Order, error) {
	var order models.Order
	if err := r.db.WithContext(ctx).First(&order, "id = ?", id).Error; err != nil {
		return nil, err
	}
	order.Status = status
	if err := r.db.WithContext(ctx).Save(&order).Error; err != nil {
		return nil, err
	}

	// Reload with associations
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Items").
		Preload("Items.Book").
		First(&order, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *orderRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Order{}, "id = ?", id).Error
}
