package repositories

import (
	"bookstore/internal/models"
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type TransactionRepository interface {
	Create(ctx context.Context, transaction *models.Transaction) (*models.Transaction, error)
	GetAll(ctx context.Context) ([]models.Transaction, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Transaction, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]models.Transaction, error)
	GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Transaction, error)
	Update(ctx context.Context, id uuid.UUID, updateData *models.Transaction) (*models.Transaction, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status, failureReason string, esewaResponse datatypes.JSON) (*models.Transaction, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, transaction *models.Transaction) (*models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := r.db.WithContext(ctx).Create(transaction).Error; err != nil {
		return nil, err
	}

	// Preload associations with proper nested preloading
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		First(transaction, "id = ?", transaction.ID).Error; err != nil {
		return nil, err
	}

	return transaction, nil
}

func (r *transactionRepository) GetAll(ctx context.Context) ([]models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var transactions []models.Transaction
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		Order("created_at DESC").
		Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

func (r *transactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var transaction models.Transaction
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *transactionRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var transactions []models.Transaction
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

func (r *transactionRepository) GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var transaction models.Transaction
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		First(&transaction, "order_id = ?", orderID).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *transactionRepository) Update(ctx context.Context, id uuid.UUID, updateData *models.Transaction) (*models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var transaction models.Transaction
	if err := r.db.WithContext(ctx).First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}

	// Update fields
	if updateData.Status != "" {
		transaction.Status = updateData.Status
	}
	if updateData.TransactionID != "" {
		transaction.TransactionID = updateData.TransactionID
	}
	if updateData.FailureReason != "" {
		transaction.FailureReason = updateData.FailureReason
	}
	if updateData.EsewaResponse != nil {
		transaction.EsewaResponse = updateData.EsewaResponse
	}
	if updateData.PaymentURL != "" {
		transaction.PaymentURL = updateData.PaymentURL
	}

	if err := r.db.WithContext(ctx).Save(&transaction).Error; err != nil {
		return nil, err
	}

	// Reload with associations
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

func (r *transactionRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status, failureReason string, esewaResponse datatypes.JSON) (*models.Transaction, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var transaction models.Transaction
	if err := r.db.WithContext(ctx).First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}

	transaction.Status = status
	if failureReason != "" {
		transaction.FailureReason = failureReason
	}
	if esewaResponse != nil {
		transaction.EsewaResponse = esewaResponse
	}

	if err := r.db.WithContext(ctx).Save(&transaction).Error; err != nil {
		return nil, err
	}

	// Reload with associations
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Order", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Preload("Items.Book.Category")
		}).
		First(&transaction, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

func (r *transactionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Transaction{}, "id = ?", id).Error
}
