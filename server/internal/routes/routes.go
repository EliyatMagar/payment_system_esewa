package routes

import (
	"bookstore/internal/handlers"
	"bookstore/pkg/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	categoryHandler *handlers.CategoryHandler,
	bookHandler *handlers.BookHandler,
	orderHandler *handlers.OrderHandler,
) {
	api := router.Group("/api")
	{
		// Public Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes (require JWT)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware()) // Apply JWT auth
		{
			// Category routes
			categories := protected.Group("/categories")
			{
				categories.POST("/", categoryHandler.CreateCategory)
				categories.GET("/", categoryHandler.GetAllCategories)
				categories.GET("/:id", categoryHandler.GetCategoryByID)
				categories.PUT("/:id", categoryHandler.UpdateCategory)
				categories.DELETE("/:id", categoryHandler.DeleteCategory)
			}

			// Book routes
			books := protected.Group("/books")
			{
				books.POST("/", bookHandler.CreateBook)
				books.GET("/", bookHandler.GetAllBooks)
				books.GET("/:id", bookHandler.GetBookByID)
				books.PUT("/:id", bookHandler.UpdateBook)
				books.DELETE("/:id", bookHandler.DeleteBook)
			}

			//order routes

			orders := protected.Group("/orders")
			{
				orders.POST("/", orderHandler.CreateOrder)
				orders.GET("/", orderHandler.GetAllOrders)
				orders.GET("/:id", orderHandler.GetOrderByID)
				orders.PUT("/:id/status", orderHandler.UpdateOrderStatus)
				orders.DELETE("/:id", orderHandler.DeleteOrder)
			}
		}
	}
}
