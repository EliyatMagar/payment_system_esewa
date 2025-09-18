package main

import (
	"bookstore/config"
	"bookstore/internal/handlers"
	"bookstore/internal/repositories"
	"bookstore/internal/routes"
	"bookstore/internal/services"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Load configuration and DB
	cfg := config.LoadConfig()
	db := cfg.DB

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	categoryRepo := repositories.NewCategoryRepository(db)
	bookRepo := repositories.NewBookRepository(db)
	orderRepo := repositories.NewOrderRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo)
	categoryService := services.NewCategoryService(categoryRepo)
	bookService := services.NewBookService(bookRepo)
	orderService := services.NewOrderService(orderRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	bookHandler := handlers.NewBookHandler(bookService)
	orderHandler := handlers.NewOrderHandler(orderService)

	// Setup Gin router
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(router, authHandler, categoryHandler, bookHandler, orderHandler)

	// Start server
	log.Println("🚀 Server running at http://localhost:8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
