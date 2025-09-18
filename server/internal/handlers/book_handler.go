package handlers

import (
	"bookstore/internal/models"
	"bookstore/internal/services"
	"bookstore/pkg/utils"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BookHandler struct {
	service services.BookService
}

func NewBookHandler(service services.BookService) *BookHandler {
	return &BookHandler{service: service}
}

// POST /books
func (h *BookHandler) CreateBook(c *gin.Context) {
	var body models.Book
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	book, err := h.service.CreateBook(context.Background(), &body)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, gin.H{"book": book})
}

// GET /books
func (h *BookHandler) GetAllBooks(c *gin.Context) {
	books, err := h.service.GetAllBooks(context.Background())
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"books": books})
}

// GET /books/:id
func (h *BookHandler) GetBookByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid book ID")
		return
	}

	book, err := h.service.GetBookByID(context.Background(), id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"book": book})
}

// PUT /books/:id
func (h *BookHandler) UpdateBook(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid book ID")
		return
	}

	var body models.Book
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	book, err := h.service.UpdateBook(context.Background(), id, body)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"book": book})
}

// DELETE /books/:id
func (h *BookHandler) DeleteBook(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid book ID")
		return
	}

	if err := h.service.DeleteBook(context.Background(), id); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"message": "book deleted successfully"})
}
