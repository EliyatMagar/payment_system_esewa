package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Transaction struct {
	ID            uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID       uuid.UUID      `gorm:"type:uuid;not null" json:"order_id"`
	Order         Order          `gorm:"foreignKey:OrderID" json:"order"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	User          User           `gorm:"foreignKey:UserID" json:"user"`
	PaymentMethod string         `gorm:"type:varchar(50);not null" json:"payment_method"` // ESEWA, CASH, CARD, etc.
	TransactionID string         `gorm:"type:varchar(100);unique" json:"transaction_id"`  // External transaction ID
	Amount        float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
	Status        string         `gorm:"type:varchar(20);default:'PENDING'" json:"status"` // PENDING, SUCCESS, FAILED, CANCELLED
	PaymentURL    string         `gorm:"type:text" json:"payment_url"`                     // For redirect-based payments
	MerchantCode  string         `gorm:"type:varchar(100)" json:"merchant_code"`
	ProductCode   string         `gorm:"type:varchar(100)" json:"product_code"`
	ProductName   string         `gorm:"type:varchar(200)" json:"product_name"`
	EsewaResponse datatypes.JSON `gorm:"type:json" json:"esewa_response"` // Store structured eSewa response
	FailureReason string         `gorm:"type:text" json:"failure_reason"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Transaction status constants
const (
	TransactionStatusPending   = "PENDING"
	TransactionStatusSuccess   = "SUCCESS"
	TransactionStatusFailed    = "FAILED"
	TransactionStatusCancelled = "CANCELLED"
)

// Payment method constants
const (
	PaymentMethodEsewa = "ESEWA"
	PaymentMethodCash  = "CASH"
	PaymentMethodCard  = "CARD"
)

type EsewaPaymentRequest struct {
	Amount                float64 `json:"amount" binding:"required,min=0.01"`
	TaxAmount             float64 `json:"tax_amount" binding:"min=0"`
	ProductCode           string  `json:"product_code" binding:"required"`
	ProductName           string  `json:"product_name" binding:"required"`
	ProductServiceCharge  float64 `json:"product_service_charge" binding:"min=0"`
	ProductDeliveryCharge float64 `json:"product_delivery_charge" binding:"min=0"`
	SuccessURL            string  `json:"success_url" binding:"required,url"`
	FailureURL            string  `json:"failure_url" binding:"required,url"`
	SignedFieldNames      string  `json:"signed_field_names"`
	Signature             string  `json:"signature"`
}

type EsewaPaymentResponse struct {
	TransactionID string `json:"transaction_id"`
	ProductCode   string `json:"product_code"`
	TotalAmount   string `json:"total_amount"`
	Status        string `json:"status"`
	Message       string `json:"message"`
	RefID         string `json:"ref_id"`
}

type EsewaResponseData struct {
	TransactionCode  string `json:"transaction_code"`
	Status           string `json:"status"`
	TotalAmount      string `json:"total_amount"`
	ProductCode      string `json:"product_code"`
	RefID            string `json:"ref_id"`
	Message          string `json:"message"`
	SignedFieldNames string `json:"signed_field_names"`
	Signature        string `json:"signature"`
}

type TransactionUpdateRequest struct {
	Status        string `json:"status" binding:"required,oneof=PENDING SUCCESS FAILED CANCELLED"`
	TransactionID string `json:"transaction_id"`
	FailureReason string `json:"failure_reason"`
	EsewaResponse string `json:"esewa_response"`
}

type CreateTransactionRequest struct {
	OrderID       uuid.UUID `json:"order_id" binding:"required"`
	PaymentMethod string    `json:"payment_method" binding:"required,oneof=ESEWA CASH CARD"`
	Amount        float64   `json:"amount" binding:"required,min=0.01,gt=0"`
}
