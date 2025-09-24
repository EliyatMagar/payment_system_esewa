package handlers

import (
	"bookstore/internal/models"
	"bookstore/internal/services"
	"bookstore/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TransactionHandler struct {
	transactionService services.TransactionService
}

func NewTransactionHandler(transactionService services.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		transactionService: transactionService,
	}
}

// CreateTransaction creates a new transaction
// @Summary Create a new transaction
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param transaction body models.CreateTransactionRequest true "Transaction data"
// @Success 201 {object} utils.SuccessResponse{data=models.Transaction}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions [post]
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	var req models.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid input: "+err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Convert string to UUID
	userIDStr, ok := userID.(string)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID format")
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	transaction, err := h.transactionService.CreateTransaction(c.Request.Context(), &req, userUUID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, transaction)
}

// GetAllTransactions gets all transactions (admin only)
// @Summary Get all transactions
// @Tags transactions
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.SuccessResponse{data=[]models.Transaction}
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions [get]
func (h *TransactionHandler) GetAllTransactions(c *gin.Context) {
	transactions, err := h.transactionService.GetAllTransactions(c.Request.Context())
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, transactions)
}

// GetTransactionByID gets a specific transaction by ID
// @Summary Get transaction by ID
// @Tags transactions
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Success 200 {object} utils.SuccessResponse{data=models.Transaction}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /transactions/{id} [get]
func (h *TransactionHandler) GetTransactionByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transaction ID")
		return
	}

	transaction, err := h.transactionService.GetTransactionByID(c.Request.Context(), id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Transaction not found")
		return
	}

	// Check authorization
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	// Convert string to UUID for comparison
	userIDStr, ok := userID.(string)
	if ok {
		userUUID, err := uuid.Parse(userIDStr)
		if err == nil {
			if userRole != "admin" && transaction.UserID != userUUID {
				utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
				return
			}
		}
	}

	utils.SuccessResponse(c, http.StatusOK, transaction)
}

// GetUserTransactions gets transactions for the current user
// @Summary Get current user's transactions
// @Tags transactions
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.SuccessResponse{data=[]models.Transaction}
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions/user/my-transactions [get]
func (h *TransactionHandler) GetUserTransactions(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Convert string to UUID
	userIDStr, ok := userID.(string)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID format")
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	transactions, err := h.transactionService.GetUserTransactions(c.Request.Context(), userUUID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, transactions)
}

// GetTransactionByOrderID gets transaction by order ID
// @Summary Get transaction by order ID
// @Tags transactions
// @Produce json
// @Security BearerAuth
// @Param orderId path string true "Order ID"
// @Success 200 {object} utils.SuccessResponse{data=models.Transaction}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /transactions/order/{orderId} [get]
func (h *TransactionHandler) GetTransactionByOrderID(c *gin.Context) {
	orderID, err := uuid.Parse(c.Param("orderId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid order ID")
		return
	}

	transaction, err := h.transactionService.GetTransactionByOrderID(c.Request.Context(), orderID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Transaction not found for this order")
		return
	}

	// Check authorization
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	// Convert string to UUID for comparison
	userIDStr, ok := userID.(string)
	if ok {
		userUUID, err := uuid.Parse(userIDStr)
		if err == nil {
			if userRole != "admin" && transaction.UserID != userUUID {
				utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
				return
			}
		}
	}

	utils.SuccessResponse(c, http.StatusOK, transaction)
}

// UpdateTransactionStatus updates transaction status (admin only)
// @Summary Update transaction status
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Param body body models.TransactionUpdateRequest true "Status update"
// @Success 200 {object} utils.SuccessResponse{data=models.Transaction}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions/{id}/status [put]
func (h *TransactionHandler) UpdateTransactionStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transaction ID")
		return
	}

	var req models.TransactionUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	transaction, err := h.transactionService.UpdateTransactionStatus(c.Request.Context(), id, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, transaction)
}

// InitiateEsewaPayment initiates eSewa payment
// @Summary Initiate eSewa payment
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body models.EsewaPaymentRequest true "eSewa payment data"
// @Success 200 {object} utils.SuccessResponse{data=models.Transaction}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions/esewa/initiate [post]
func (h *TransactionHandler) InitiateEsewaPayment(c *gin.Context) {
	var esewaReq models.EsewaPaymentRequest
	if err := c.ShouldBindJSON(&esewaReq); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Get transaction ID from query parameter or body
	transactionIDStr := c.Query("transaction_id")
	if transactionIDStr == "" {
		// Try to get from body if not in query
		var body struct {
			TransactionID string `json:"transaction_id"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Transaction ID is required")
			return
		}
		transactionIDStr = body.TransactionID
	}

	if transactionIDStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Transaction ID is required")
		return
	}

	transactionID, err := uuid.Parse(transactionIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transaction ID")
		return
	}

	// Verify the transaction belongs to the current user
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// Convert string to UUID
	userIDStr, ok := userID.(string)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID format")
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	transaction, err := h.transactionService.GetTransactionByID(c.Request.Context(), transactionID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Transaction not found")
		return
	}

	if transaction.UserID != userUUID {
		utils.ErrorResponse(c, http.StatusForbidden, "Access denied")
		return
	}

	transaction, err = h.transactionService.InitiateEsewaPayment(c.Request.Context(), transactionID, &esewaReq)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, transaction)
}

// VerifyEsewaPayment verifies eSewa payment
// @Summary Verify eSewa payment
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body models.EsewaResponseData true "eSewa response data"
// @Success 200 {object} utils.SuccessResponse{data=models.Transaction}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions/esewa/verify [post]
func (h *TransactionHandler) VerifyEsewaPayment(c *gin.Context) {
	var esewaResponse models.EsewaResponseData
	if err := c.ShouldBindJSON(&esewaResponse); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	transaction, err := h.transactionService.VerifyEsewaPayment(c.Request.Context(), &esewaResponse)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, transaction)
}

// DeleteTransaction deletes a transaction (admin only)
// @Summary Delete a transaction
// @Tags transactions
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /transactions/{id} [delete]
func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transaction ID")
		return
	}

	if err := h.transactionService.DeleteTransaction(c.Request.Context(), id); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}
