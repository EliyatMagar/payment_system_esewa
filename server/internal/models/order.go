package models

import (
	"time"

	"github.com/google/uuid"
)

type Order struct {
	ID         uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User       User      `json:"user"`
	Status     string    `gorm:"type:varchar(20);default:'PENDING'" json:"status"` // PENDING, PAID, CANCELLED
	TotalPrice float64   `gorm:"not null" json:"total_price"`

	Items []OrderItem `gorm:"foreignKey:OrderID" json:"items"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type OrderItem struct {
	ID       uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID  uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	BookID   uuid.UUID `gorm:"type:uuid;not null" json:"book_id"`
	Book     Book      `json:"book"`
	Quantity int       `gorm:"not null" json:"quantity"`
	Price    float64   `gorm:"not null" json:"price"`
}

const (
	OrderStatusPending   = "PENDING"
	OrderStatusPaid      = "PAID"
	OrderStatusCancelled = "CANCELLED"
)
