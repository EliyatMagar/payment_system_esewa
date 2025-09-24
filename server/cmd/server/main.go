package main

import (
	"bookstore/config"
	"bookstore/internal/handlers"
	"bookstore/internal/repositories"
	"bookstore/internal/routes"
	"bookstore/internal/services"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		log.Fatal("FRONTEND_URL not set in .env")
	}

	// Load DB
	cfg := config.LoadConfig()
	db := cfg.DB

	// Repositories
	userRepo := repositories.NewUserRepository(db)
	categoryRepo := repositories.NewCategoryRepository(db)
	bookRepo := repositories.NewBookRepository(db)
	orderRepo := repositories.NewOrderRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)

	// Services
	authService := services.NewAuthService(userRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	bookService := services.NewBookService(bookRepo)
	orderService := services.NewOrderService(orderRepo)
	transactionService := services.NewTransactionService(transactionRepo, orderRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	bookHandler := handlers.NewBookHandler(bookService)
	orderHandler := handlers.NewOrderHandler(orderService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)

	// Gin router
	router := gin.Default()

	// Proper CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.RedirectTrailingSlash = false

	// Routes
	routes.SetupRoutes(router, authHandler, categoryHandler, bookHandler, orderHandler, transactionHandler)

	// Start server
	log.Println("🚀 Server running at http://localhost:8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
