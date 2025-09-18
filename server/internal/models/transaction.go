package models

import (
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID      uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	Order   Order     `json:"order"`

	ProductID string  `gorm:"uniqueIndex;not null" json:"product_id"` // unique ID sent to eSewa
	RefID     string  `gorm:"type:varchar(100)" json:"ref_id"`        // returned by eSewa after success
	Amount    float64 `gorm:"not null" json:"amount"`
	Status    string  `gorm:"type:varchar(20);default:'PENDING'" json:"status"` // PENDING, SUCCESS, FAILED

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
