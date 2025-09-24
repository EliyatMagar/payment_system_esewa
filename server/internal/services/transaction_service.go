package services

import (
	"bookstore/internal/models"
	"bookstore/internal/repositories"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type TransactionService interface {
	CreateTransaction(ctx context.Context, req *models.CreateTransactionRequest, userID uuid.UUID) (*models.Transaction, error)
	GetAllTransactions(ctx context.Context) ([]models.Transaction, error)
	GetTransactionByID(ctx context.Context, id uuid.UUID) (*models.Transaction, error)
	GetUserTransactions(ctx context.Context, userID uuid.UUID) ([]models.Transaction, error)
	GetTransactionByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Transaction, error)
	UpdateTransactionStatus(ctx context.Context, id uuid.UUID, req *models.TransactionUpdateRequest) (*models.Transaction, error)
	InitiateEsewaPayment(ctx context.Context, transactionID uuid.UUID, esewaReq *models.EsewaPaymentRequest) (*models.Transaction, error)
	VerifyEsewaPayment(ctx context.Context, esewaResponse *models.EsewaResponseData) (*models.Transaction, error)
	DeleteTransaction(ctx context.Context, id uuid.UUID) error
}

type transactionService struct {
	transactionRepo repositories.TransactionRepository
	orderRepo       repositories.OrderRepository
}

func NewTransactionService(transactionRepo repositories.TransactionRepository, orderRepo repositories.OrderRepository) TransactionService {
	return &transactionService{
		transactionRepo: transactionRepo,
		orderRepo:       orderRepo,
	}
}

func (s *transactionService) CreateTransaction(ctx context.Context, req *models.CreateTransactionRequest, userID uuid.UUID) (*models.Transaction, error) {
	// Validate order exists and belongs to user
	order, err := s.orderRepo.GetByID(ctx, req.OrderID)
	if err != nil {
		return nil, errors.New("order not found")
	}

	// Verify order belongs to the user
	if order.UserID != userID {
		return nil, errors.New("order does not belong to user")
	}

	// Check if transaction already exists for this order
	existingTransaction, _ := s.transactionRepo.GetByOrderID(ctx, req.OrderID)
	if existingTransaction != nil {
		return nil, errors.New("transaction already exists for this order")
	}

	// Validate amount matches order total
	if req.Amount != order.TotalPrice {
		return nil, fmt.Errorf("amount %.2f does not match order total %.2f", req.Amount, order.TotalPrice)
	}

	// Create transaction
	transaction := &models.Transaction{
		OrderID:       req.OrderID,
		UserID:        userID,
		PaymentMethod: req.PaymentMethod,
		Amount:        req.Amount,
		Status:        models.TransactionStatusPending,
		ProductName:   "Book Order",
	}

	return s.transactionRepo.Create(ctx, transaction)
}

func (s *transactionService) GetAllTransactions(ctx context.Context) ([]models.Transaction, error) {
	return s.transactionRepo.GetAll(ctx)
}

func (s *transactionService) GetTransactionByID(ctx context.Context, id uuid.UUID) (*models.Transaction, error) {
	return s.transactionRepo.GetByID(ctx, id)
}

func (s *transactionService) GetUserTransactions(ctx context.Context, userID uuid.UUID) ([]models.Transaction, error) {
	return s.transactionRepo.GetByUserID(ctx, userID)
}

func (s *transactionService) GetTransactionByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Transaction, error) {
	return s.transactionRepo.GetByOrderID(ctx, orderID)
}

func (s *transactionService) UpdateTransactionStatus(ctx context.Context, id uuid.UUID, req *models.TransactionUpdateRequest) (*models.Transaction, error) {
	// Validate status
	validStatuses := map[string]bool{
		models.TransactionStatusPending:   true,
		models.TransactionStatusSuccess:   true,
		models.TransactionStatusFailed:    true,
		models.TransactionStatusCancelled: true,
	}
	if !validStatuses[req.Status] {
		return nil, errors.New("invalid transaction status")
	}

	var esewaResponseData datatypes.JSON
	if req.EsewaResponse != "" {
		esewaResponseData = datatypes.JSON(req.EsewaResponse)
	}

	// Use the general Update method instead of UpdateStatus for more flexibility
	updateData := &models.Transaction{
		Status:        req.Status,
		FailureReason: req.FailureReason,
		EsewaResponse: esewaResponseData,
	}

	if req.TransactionID != "" {
		updateData.TransactionID = req.TransactionID
	}

	transaction, err := s.transactionRepo.Update(ctx, id, updateData)
	if err != nil {
		return nil, err
	}

	// If transaction is successful, update order status to PAID
	if req.Status == models.TransactionStatusSuccess {
		_, err = s.orderRepo.UpdateStatus(ctx, transaction.OrderID, models.OrderStatusPaid)
		if err != nil {
			return nil, fmt.Errorf("failed to update order status: %v", err)
		}
	}

	return transaction, nil
}

func (s *transactionService) InitiateEsewaPayment(ctx context.Context, transactionID uuid.UUID, esewaReq *models.EsewaPaymentRequest) (*models.Transaction, error) {
	// Get transaction
	transaction, err := s.transactionRepo.GetByID(ctx, transactionID)
	if err != nil {
		return nil, errors.New("transaction not found")
	}

	// Verify transaction is in pending status
	if transaction.Status != models.TransactionStatusPending {
		return nil, errors.New("transaction is not in pending status")
	}

	// Update transaction with eSewa details
	transaction.MerchantCode = "DUMMY_MERCHANT" // From environment
	transaction.ProductCode = esewaReq.ProductCode
	transaction.ProductName = esewaReq.ProductName

	// Generate payment URL
	paymentURL := fmt.Sprintf("http://dummy-esewa-url.com/payment?transaction_id=%s&amount=%.2f",
		transaction.ID, transaction.Amount)
	transaction.PaymentURL = paymentURL

	updatedTransaction, err := s.transactionRepo.Update(ctx, transaction.ID, transaction)
	if err != nil {
		return nil, err
	}

	return updatedTransaction, nil
}

func (s *transactionService) VerifyEsewaPayment(ctx context.Context, esewaResponse *models.EsewaResponseData) (*models.Transaction, error) {
	// Find transaction by reference (using TransactionCode as the transaction ID)
	transactionID, err := uuid.Parse(esewaResponse.TransactionCode)
	if err != nil {
		return nil, errors.New("invalid transaction code")
	}

	transaction, err := s.transactionRepo.GetByID(ctx, transactionID)
	if err != nil {
		return nil, errors.New("transaction not found")
	}

	// Store eSewa response
	esewaResponseJSON, err := json.Marshal(esewaResponse)
	if err != nil {
		return nil, errors.New("failed to marshal eSewa response")
	}

	// Update transaction status based on eSewa response
	var status string
	var failureReason string

	switch esewaResponse.Status {
	case "COMPLETE", "SUCCESS":
		status = models.TransactionStatusSuccess
		// Update order status to PAID
		_, err = s.orderRepo.UpdateStatus(ctx, transaction.OrderID, models.OrderStatusPaid)
		if err != nil {
			return nil, fmt.Errorf("failed to update order status: %v", err)
		}
	case "FAILED", "ERROR":
		status = models.TransactionStatusFailed
		failureReason = esewaResponse.Message
	default:
		status = models.TransactionStatusPending
	}

	// Update transaction
	updateData := &models.Transaction{
		Status:        status,
		TransactionID: esewaResponse.RefID,
		FailureReason: failureReason,
		EsewaResponse: datatypes.JSON(esewaResponseJSON),
	}

	updatedTransaction, err := s.transactionRepo.Update(ctx, transaction.ID, updateData)
	if err != nil {
		return nil, err
	}

	return updatedTransaction, nil
}

func (s *transactionService) DeleteTransaction(ctx context.Context, id uuid.UUID) error {
	return s.transactionRepo.Delete(ctx, id)
}
