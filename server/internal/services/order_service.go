package services

import (
	"bookstore/internal/models"
	"bookstore/internal/repositories"
	"context"
	"errors"

	"github.com/google/uuid"
)

type OrderService struct {
	orderRepo repositories.OrderRepository
}

func NewOrderService(orderRepo repositories.OrderRepository) *OrderService {
	return &OrderService{orderRepo: orderRepo}
}

// CreateOrder handles creating a new order
func (s *OrderService) CreateOrder(ctx context.Context, order *models.Order) (*models.Order, error) {
	if len(order.Items) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	var total float64
	for _, item := range order.Items {
		total += item.Price * float64(item.Quantity)
	}
	order.TotalPrice = total
	order.Status = "PENDING"

	return s.orderRepo.Create(ctx, order)
}

// GetAllOrders returns all orders
func (s *OrderService) GetAllOrders(ctx context.Context) ([]models.Order, error) {
	return s.orderRepo.GetAll(ctx)
}

// GetOrderByID returns a single order by ID
func (s *OrderService) GetOrderByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	return s.orderRepo.GetByID(ctx, id)
}

// UpdateOrderStatus updates the status of an order
func (s *OrderService) UpdateOrderStatus(ctx context.Context, id uuid.UUID, status string) (*models.Order, error) {
	validStatuses := map[string]bool{"PENDING": true, "PAID": true, "CANCELLED": true}
	if !validStatuses[status] {
		return nil, errors.New("invalid order status")
	}
	return s.orderRepo.UpdateStatus(ctx, id, status)
}

// DeleteOrder deletes an order by ID
func (s *OrderService) DeleteOrder(ctx context.Context, id uuid.UUID) error {
	return s.orderRepo.Delete(ctx, id)
}
